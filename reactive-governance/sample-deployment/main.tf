/*
Copyright 2024 Google LLC

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

# Enable Cloud Resource Manager API
module "project-service-cloudresourcemanager" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "4.0.0"

  project_id = var.project_id
  activate_apis = [
    "cloudresourcemanager.googleapis.com"
  ]
}

# Enable APIs
module "project-services" {
  source  = "terraform-google-modules/project-factory/google//modules/project_services"
  version = "4.0.0"

  project_id = var.project_id
  activate_apis = var.activate_apis
  depends_on = [module.project-service-cloudresourcemanager]
}

resource "google_storage_bucket" "bucket_gcf_source" {
  name                        = "${var.project_id}-gcf-source"
  storage_class               = "REGIONAL"
  location                    = local.expanded_region
  force_destroy               = "true"
  uniform_bucket_level_access = "true"
  depends_on                  = [module.project-services]
}

module "cas_alert" {
  source = "../alert/deploy"

  organization_id            = var.organization_id
  project_id                 = var.project_id
  region                     = var.region
  bucket_gcf_source_name     = google_storage_bucket.bucket_gcf_source.name
  service_account_email      = var.service_account_email
  notification_email_address = var.notification_email_address
  asset_types                = var.alert_asset_types
  depends_on                 = [module.project-services]
}

module "cas_report" {
  source = "../report/deploy"

  organization_id             = var.organization_id
  project_id                  = var.project_id
  region                      = var.region
  location                    = var.location
  bucket_gcf_source_name      = google_storage_bucket.bucket_gcf_source.name
  service_account_email       = var.service_account_email
  scheduler_cas_job_frequency = var.scheduler_cas_job_frequency
  depends_on                  = [module.project-services]
}