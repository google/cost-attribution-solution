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

## RESOURCES TO CREATE MISSING LABELS DASHBOARD ##

locals {
  expanded_region    = var.region == "us-central" || var.region == "europe-west" ? "${var.region}1" : var.region
}

# Create Pub/Sub topic to list projects in the parent node
resource "google_pubsub_topic" "cas_topic" {
  name       = var.cas_topic
}

resource "google_cloud_scheduler_job" "cas_job" {
  name        = var.scheduler_cas_job_name
  description = var.scheduler_cas_job_description
  schedule    = var.scheduler_cas_job_frequency
  region      = local.expanded_region

  pubsub_target {
    topic_name = google_pubsub_topic.cas_topic.id
    data       = base64encode("hello")
  }

  depends_on = [google_pubsub_topic.cas_topic]
}

data "archive_file" "report_source_code_zip" {
  type        = "zip"
  source_dir  = abspath("${path.module}/../../report/src/")
  output_path = "./report_src.zip"
}

resource "google_storage_bucket_object" "report_source_code_object" {
  name   = "src.${data.archive_file.report_source_code_zip.output_md5}.zip"
  bucket = var.bucket_gcf_source_name
  source = data.archive_file.report_source_code_zip.output_path

  depends_on = [
    data.archive_file.report_source_code_zip
  ]
}

resource "google_cloudfunctions2_function" "cas_report_function" {
  name        = var.cloud_function_cas_reporting
  location    = local.expanded_region
  description = var.scheduler_cas_job_description

  build_config {
    runtime = "python310"
    entry_point = "cas_report"
    environment_variables = {
      GOOGLE_FUNCTION_SOURCE = "cas_report.py"
    } 
    source {
      storage_source {
        bucket = var.bucket_gcf_source_name
        object = google_storage_bucket_object.report_source_code_object.name
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
      LOG_EXECUTION_ID  = "true"
    }
    service_account_email = var.service_account_email
  }

  event_trigger {
    trigger_region  = local.expanded_region
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
}

resource "google_bigquery_table" "default" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = var.bigquery_table
  deletion_protection = false

  #time_partitioning {
  #  type = var.bigquery_table_partition
  #}

  #labels = {
  #  solution = "cost-attribute-solution"
  #}

  schema = file("${path.module}/asset_table_schema.txt")
  depends_on = [google_bigquery_dataset.dataset]
}

resource "google_bigquery_table" "cas_table_view" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = var.bigquery_table_view

  labels = {
    solution = "cost-attribute-solution"
  }

  schema = file("${path.module}/asset_table_view_schema.txt")

  view {
    query = templatefile("${path.module}/view_query.tftpl", {
      cas_table = "${var.project_id}.${google_bigquery_dataset.dataset.dataset_id}.${google_bigquery_table.default.table_id}",
    })
    use_legacy_sql = false
  }
  depends_on = [google_bigquery_table.default]
}