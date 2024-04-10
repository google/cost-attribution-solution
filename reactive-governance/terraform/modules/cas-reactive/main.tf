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
  expanded_region    = var.region == "us-central" || var.region == "europe-west" ? "${var.region}1" : var.region
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

  activate_apis = [
    "compute.googleapis.com",
    "bigquery.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudasset.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "eventarc.googleapis.com"
  ]
  depends_on = [module.project-service-cloudresourcemanager]
}

resource "google_storage_bucket" "bucket_gcf_source" {
  name          = "${var.project_id}-gcf-source"
  storage_class = "REGIONAL"
  location      = local.expanded_region
  force_destroy = "true"
  uniform_bucket_level_access = "true"
}

data "archive_file" "local_source_code_zip" {
  type        = "zip"
  source_dir  = abspath("${path.module}/../../../cas-reactive")
  output_path = "./src.zip"
}

resource "google_storage_bucket_object" "source_code_object" {
  name   = "src.${data.archive_file.local_source_code_zip.output_md5}.zip"
  bucket = google_storage_bucket.bucket_gcf_source.name
  source = data.archive_file.local_source_code_zip.output_path

  depends_on = [
    data.archive_file.local_source_code_zip
  ]
}

## RESOURCES TO CREATE MISSING LABELS DASHBOARD ##
# Create Pub/Sub topic to list projects in the parent node
resource "google_pubsub_topic" "cas_topic" {
  name       = var.cas_topic
  depends_on = [module.project-services]
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

resource "google_cloudfunctions2_function" "cas_report_function" {
  name        = var.cloud_function_cas_reporting
  location    = local.expanded_region
  description = var.scheduler_cas_job_description

  build_config {
    runtime = "java17"
    entry_point = "functions.CasReport"
    source {
      storage_source {
        bucket = google_storage_bucket.bucket_gcf_source.name
        object = google_storage_bucket_object.source_code_object.name
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

## RESOURCES TO SETUP ALERTING WHEN RESOURCE IS CREATED OR UPDATED AND LABEL IS MISSING ##
# Create Pub/Sub topic to list projects in the parent node
resource "google_pubsub_topic" "cas_alerting_topic" {
  name       = var.cas_alerting_topic
  depends_on = [module.project-services]
}

# Create a feed that sends notifications on resource creation or update events.
resource "google_cloud_asset_project_feed" "project_feed" {
  project          = var.project_id
  feed_id          = "missing-labels-feed"
  content_type     = "RESOURCE"

  // TBD Add more resources here
  asset_types = [
    "compute.googleapis.com/Instance",
    "storage.googleapis.com/Bucket",
    "bigquery.googleapis.com/Dataset",
    "bigquery.googleapis.com/Table",
    "pubsub.googleapis.com/Topic",
    "pubsub.googleapis.com/Subscription"
  ]

  feed_output_config {
    pubsub_destination {
      topic = google_pubsub_topic.cas_alerting_topic.id
    }
  }

  condition {
    expression = <<-EOT
    !temporal_asset.deleted
    EOT
    title = "created or updated"
    description = "Send notifications on creation or update events"
  }
  depends_on = [google_pubsub_topic.cas_alerting_topic]
}

resource "google_cloudfunctions2_function" "cas_alert_function" {
  name        = var.cloud_function_cas_alerting
  location    = local.expanded_region
  description = var.cloud_function_cas_alerting_desc

  build_config {
    runtime = "java17"
    entry_point = "functions.CasAlert"
    source {
      storage_source {
        bucket = google_storage_bucket.bucket_gcf_source.name
        object = google_storage_bucket_object.source_code_object.name
      }
    }
  }

  service_config {
    available_memory      = var.cloud_function_cas_reporting_memory
    timeout_seconds       = var.cloud_function_cas_reporting_timeout
    service_account_email = var.service_account_email
  }

  event_trigger {
    trigger_region  = local.expanded_region
    event_type      = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic    = google_pubsub_topic.cas_alerting_topic.id
    retry_policy    = "RETRY_POLICY_RETRY"
  }

  depends_on = [google_pubsub_topic.cas_alerting_topic]
}

# Custom log-based metric to send quota alert data through
resource "google_logging_metric" "quota_logging_metric" {
  name        = var.cas_alert_log_metric
  description = "Tracks logs for resources missing labels"
  filter      = "logName:\"projects/${var.project_id}/logs/\" jsonPayload.message:\"Resource with missing Label - Name: \""
  depends_on  = [module.project-services]
  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
    labels {
      key        = "data"
      value_type = "STRING"
    }
  }
  label_extractors = {
    "data" = "EXTRACT(jsonPayload.message)"
  }
}

#Set notification channels below
#Add Notification channel - Email
resource "google_monitoring_notification_channel" "email0" {
  display_name = "Oncall"
  type         = "email"
  depends_on   = [module.project-services]
  labels = {
    email_address = var.notification_email_address
  }
}

#Alert policy for log-based metric
# Condition display name can be changed based on user's quota range
resource "google_monitoring_alert_policy" "alert_policy_quota" {
  display_name = "Resources missing label"
  combiner     = "OR"
  conditions {
    display_name = "Resources reaching Quotas"
    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.quota_logging_metric.name}\"  AND resource.type=\"cloud_function\""
      duration        = "60s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0
      trigger {
        count = 1
      }
      aggregations {
        per_series_aligner = "ALIGN_COUNT"
        alignment_period   = "60s"
      }
    }
  }
  documentation {
    mime_type = "text/markdown"
    content   = "$${metric.label.data}"
  }
  notification_channels = [
    google_monitoring_notification_channel.email0.name
  ]
  depends_on = [
    module.project-services,
    google_logging_metric.quota_logging_metric,
    google_monitoring_notification_channel.email0
  ]
}





