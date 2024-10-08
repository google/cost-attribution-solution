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

## RESOURCES TO SETUP ALERTING WHEN RESOURCE IS CREATED OR UPDATED AND LABEL IS MISSING ##

locals {
  expanded_region    = var.region == "us-central" || var.region == "europe-west" ? "${var.region}1" : var.region
}

# Create Pub/Sub topic to list projects in the parent node
resource "google_pubsub_topic" "cas_alerting_topic" {
  name       = var.cas_alerting_topic
}

# Create a feed that sends notifications on resource creation or update events for project.
resource "google_cloud_asset_project_feed" "project_feed" {
  count = length(var.organization_id) == 0 ? 1 : 0 

  project          = var.project_id
  feed_id          = "missing-labels-feed"
  content_type     = "RESOURCE"

  // TODO Add more resources here
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

# Create a feed that sends notifications on resource creation or update events for organization.
resource "google_cloud_asset_organization_feed" "organization_feed" {
  count = length(var.organization_id) == 0 ? 0 : 1 

  org_id           = var.organization_id
  billing_project  = var.project_id
  feed_id          = "missing-labels-feed"
  content_type     = "RESOURCE"

  // TODO Add more resources here
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

data "archive_file" "alert_source_code_zip" {
  type        = "zip"
  source_dir  = abspath("${path.module}/../../alert/src/")
  output_path = "./alert_src.zip"
}

resource "google_storage_bucket_object" "alert_source_code_object" {
  name   = "src.${data.archive_file.alert_source_code_zip.output_md5}.zip"
  bucket = var.bucket_gcf_source_name
  source = data.archive_file.alert_source_code_zip.output_path

  depends_on = [
    data.archive_file.alert_source_code_zip
  ]
}

resource "google_cloudfunctions2_function" "cas_alert_function" {
  name        = var.cloud_function_cas_alerting
  location    = local.expanded_region
  description = var.cloud_function_cas_alerting_desc

  build_config {
    runtime = "python310"
    entry_point = "cas_alert"
    environment_variables = {
      GOOGLE_FUNCTION_SOURCE = "cas_alert.py"
    }    
    source {
      storage_source {
        bucket = var.bucket_gcf_source_name
        object = google_storage_bucket_object.alert_source_code_object.name
      }
    }
  }

  service_config {
    available_memory      = var.cloud_function_cas_reporting_memory
    timeout_seconds       = var.cloud_function_cas_reporting_timeout
    service_account_email = var.service_account_email
    environment_variables = {
      LOG_EXECUTION_ID  = "true"
    }  
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
# filter      = "logName:\"projects/${var.project_id}/logs/\" jsonPayload.message:\"Resource with missing Label - Name: \""
  filter      = "resource.type=\"cloud_run_revision\" AND resource.labels.service_name=\"casalert\" AND SEARCH(textPayload, \"Resource with missing Label\")"
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
    display_name = "Resources missing label"
    condition_threshold {
     filter          = "metric.type=\"logging.googleapis.com/user/${google_logging_metric.quota_logging_metric.name}\" AND resource.type=\"cloud_run_revision\""
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
    google_logging_metric.quota_logging_metric,
    google_monitoring_notification_channel.email0
  ]
}