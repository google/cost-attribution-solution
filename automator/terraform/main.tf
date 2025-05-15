/*
Copyright 2025 Google LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

locals {
  expanded_region = var.region == "us-central" || var.region == "europe-west" ? "${var.region}1" : var.region
}

provider "google" {
  project = var.project_id
  region  = var.region

  // These might be required if the quota project is different than the host project and are not associated with your credentials.
  // See https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference#quota-management-configuration for more details.
  //user_project_override = true
  //billing_project = var.project_id
}

# Enable APIs
module "project-services" {
  source                      = "terraform-google-modules/project-factory/google//modules/project_services"
  version                     = "4.0.0"
  disable_services_on_destroy = false

  project_id    = var.project_id
  activate_apis = var.activate_apis
}

# Create service account and assing permissions
module "sa" {
  source  = "terraform-google-modules/service-accounts/google//modules/simple-sa"
  version = "~> 4.0"

  project_id    = var.project_id
  name          = "cas-tag-automator"
  project_roles = []
}

module "project-iam-bindings" {
  count = length(var.organization_id) == 0 ? 1 : 0

  source  = "terraform-google-modules/iam/google//modules/projects_iam"
  version = "~> 8.0"

  projects = ["${var.project_id}"]
  mode     = "additive"

  bindings = {
    for role in var.iam_roles : role => ["serviceAccount:${module.sa.email}"]
  }
}

resource "google_organization_iam_member" "organization_iam" {
  for_each = length(var.organization_id) == 0 ? toset([]) : toset(var.iam_roles)

  org_id = var.organization_id
  role   = each.value
  member = "serviceAccount:${module.sa.email}"
}

## Cloud Run configuration
data "google_project" "project" {
}

## Frontend - Cloud run Container
resource "google_cloud_run_v2_service" "frontend" {
  name     = "cas-frontend"
  location = local.expanded_region

  # For valid annotation values and descriptions, see
  # https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service#ingress
  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    containers {
      image = "us.gcr.io/${var.project_id}/tag-automator-frontend:${var.tag_name}"
    }

    service_account = module.sa.email

    scaling {
      max_instance_count = 100
      min_instance_count = 1
    }
  }
}

resource "google_cloud_run_service_iam_binding" "binding_fe" {
  location = google_cloud_run_v2_service.frontend.location
  project  = google_cloud_run_v2_service.frontend.project
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  members = [
    "serviceAccount:service-${data.google_project.project.number}@gcp-sa-iap.iam.gserviceaccount.com",
  ]
}

resource "google_compute_region_network_endpoint_group" "serverless_neg_fe" {
  provider              = google
  name                  = "serverless-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.frontend.name
  }
}

resource "google_storage_bucket" "cas-config" {
  project                     = var.project_id
  name                        = "${var.project_id}-cas-config"
  location                    = var.region
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_member" "cas-config-iam" {
  for_each = toset(["roles/storage.bucketViewer", "roles/storage.objectUser"])

  bucket = google_storage_bucket.cas-config.name
  role   = each.value
  member = "serviceAccount:${module.sa.email}"
}

## Backend - Cloud run Container
resource "google_cloud_run_v2_service" "backend" {
  name     = "cas-backend"
  location = local.expanded_region

  # For valid annotation values and descriptions, see
  # https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloud_run_v2_service#ingress
  ingress = "INGRESS_TRAFFIC_INTERNAL_LOAD_BALANCER"

  template {
    containers {
      image = "us.gcr.io/${var.project_id}/tag-automator-backend:${var.tag_name}"

      env {
        name  = "CONFIG_BUCKET"
        value = "${var.project_id}-cas-config"
      }
      env {
        name  = "SCOPE"
        value = "organizations/${var.organization_id}"
      }
    }

    scaling {
      max_instance_count = 100
      min_instance_count = 1
    }

    service_account = module.sa.email
  }
}

resource "google_cloud_run_service_iam_binding" "binding_be" {
  location = google_cloud_run_v2_service.backend.location
  project  = google_cloud_run_v2_service.backend.project
  service  = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  members = [
    "serviceAccount:service-${data.google_project.project.number}@gcp-sa-iap.iam.gserviceaccount.com",
  ]
}

resource "google_compute_region_network_endpoint_group" "serverless_neg_be" {
  provider              = google
  name                  = "serverless-be-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = google_cloud_run_v2_service.backend.name
  }
}

## Load balancer
resource "google_compute_url_map" "urlmap" {
  name            = "cas-url-map"
  default_service = module.lb-http.backend_services["frontend"].self_link

  host_rule {
    hosts        = ["*"]
    path_matcher = "default"
  }

  path_matcher {
    name            = "default"
    default_service = module.lb-http.backend_services["frontend"].self_link

    path_rule {
      paths   = ["/api/*"]
      service = module.lb-http.backend_services["backend"].self_link
    }
  }
}

module "lb-http" {
  source  = "GoogleCloudPlatform/lb-http/google//modules/serverless_negs"
  version = "~> 9.0"

  project = var.project_id
  name    = var.lb_name

  ssl                             = true
  managed_ssl_certificate_domains = [var.domain]
  https_redirect                  = true
  create_url_map                  = false
  url_map                         = google_compute_url_map.urlmap.self_link

  backends = {
    frontend = {
      description = null
      groups = [
        {
          group = google_compute_region_network_endpoint_group.serverless_neg_fe.id,
        }
      ]
      enable_cdn             = false
      security_policy        = null
      custom_request_headers = null

      iap_config = {
        enable               = true
        oauth2_client_id     = google_iap_client.project_client.client_id
        oauth2_client_secret = google_iap_client.project_client.secret
      }
      log_config = {
        enable      = false
        sample_rate = null
      }
    },
    backend = {
      description = null
      groups = [
        {
          group = google_compute_region_network_endpoint_group.serverless_neg_be.id,
        }
      ]
      enable_cdn             = false
      security_policy        = null
      custom_request_headers = null

      iap_config = {
        enable               = true
        oauth2_client_id     = google_iap_client.project_client.client_id
        oauth2_client_secret = google_iap_client.project_client.secret
      }
      log_config = {
        enable      = false
        sample_rate = null
      }
    },
  }
}

## IAP Config
# OAuth consent screen 
resource "google_iap_brand" "project_brand" {
  support_email     = var.support_email_address
  application_title = "Tag Automator"
  project           = var.project_id
}

# Oauth client ID and Secret
resource "google_iap_client" "project_client" {
  display_name = "Test Client"
  brand        = google_iap_brand.project_brand.name
}

data "google_iam_policy" "iap" {
  binding {
    role    = "roles/iap.httpsResourceAccessor"
    members = var.iap_members
  }
}

resource "google_iap_web_backend_service_iam_policy" "policy_fe" {
  project             = var.project_id
  web_backend_service = module.lb-http.backend_services["frontend"].name
  policy_data         = data.google_iam_policy.iap.policy_data
  depends_on = [
    module.lb-http
  ]
}

resource "google_iap_web_backend_service_iam_policy" "policy_be" {
  project             = var.project_id
  web_backend_service = module.lb-http.backend_services["backend"].name
  policy_data         = data.google_iam_policy.iap.policy_data
  depends_on = [
    module.lb-http
  ]
}

output "load-balancer-ip" {
  value = module.lb-http.external_ip
}
