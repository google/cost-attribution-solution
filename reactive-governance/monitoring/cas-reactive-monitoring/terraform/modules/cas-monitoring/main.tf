/*
Copyright 2023 Google LLC

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

  activate_apis = [
    "bigquery.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudfunctions.googleapis.com",
  ]
  depends_on = [module.project-service-cloudresourcemanager]
}

# Create Pub/Sub topic to list projects in the parent node
resource "google_pubsub_topic" "cas_topic" {
  name       = var.cas_topic
  depends_on = [module.project-services]
}

resource "google_cloud_scheduler_job" "cas_job" {
  name        = var.scheduler_cas_job_name
  description = var.scheduler_cas_job_description
  schedule    = var.scheduler_cas_job_frequency
  region      = var.region

  pubsub_target {
    topic_name = google_pubsub_topic.cas_topic.id
    data       = base64encode("hello")
  }

  depends_on = [google_pubsub_topic.cas_topic]
}

resource "google_cloudfunctions2_function" "cas_reporting_function" {
  name        = var.cloud_function_cas_reporting
  location    = var.region
  description = var.scheduler_cas_job_description

  build_config {
    runtime = "java17"
    entry_point = "functions.CasReactiveReporting"
    source {
      storage_source {
        bucket = var.source_code_bucket
        object = var.source_code_object
      }
    }
  }

  service_config {
    available_memory    = var.cloud_function_cas_reporting_memory
    timeout_seconds     = var.cloud_function_cas_reporting_timeout
    environment_variables = {
      PARENT            = var.organization_id
      PROJECT_ID        = var.project_id
      BIGQUERY_DATASET  = var.bigquery_dataset
      BIGQUERY_TABLE    = var.bigquery_table
    }
    service_account_email = "cost-attribution-solution@prj-21-376417.iam.gserviceaccount.com"
  }

  event_trigger {
    trigger_region  = var.region
    event_type      = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic    = google_pubsub_topic.cas_topic.id
    retry_policy    = "RETRY_POLICY_RETRY"
  }

  depends_on = [google_pubsub_topic.cas_topic]
}

# BigQuery Dataset
resource "google_bigquery_dataset" "dataset" {
  dataset_id                      = var.bigquery_dataset
  friendly_name                   = var.bigquery_dataset
  description                     = var.bigquery_dataset_desc
  location                        = var.location
  default_partition_expiration_ms = var.bigquery_dataset_default_partition_expiration_ms
  labels = {
    solution = "cost-attribute-solution"
  }
  depends_on                      = [module.project-services]
}

resource "google_bigquery_table" "default" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = var.bigquery_table
  deletion_protection = false

  time_partitioning {
    type = var.bigquery_table_partition
  }

  labels = {
    solution = "cost-attribute-solution"
  }

  schema = file("asset_table_schema.txt")
}

resource "google_bigquery_table" "cas_table_view" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = var.bigquery_table_view

  labels = {
    solution = "cost-attribute-solution"
  }

  schema = file("asset_table_view_schema.txt")

  view {
    query = file("view_query.txt")
    use_legacy_sql = false
  }
}


output "function_uri" {
  value = google_cloudfunctions2_function.cas_reporting_function.service_config[0].uri
}





