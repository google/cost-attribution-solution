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

variable "organization_id" {
  description = "Value of the Organization Id to export assets and build report"
  type        = string
}

variable "project_id" {
  description = "Value of the Project Id to deploy the solution"
  type        = string
}

variable "region" {
  description = "Value of the region to deploy the solution"
  type        = string

  validation {
    condition     = var.region != "us-central1" && var.region != "europe-west1"
    error_message = "Region must be set to an App Engine location. us-central1 and europe-west1 should be specified as us-central and europe-west respectively."
  }
}

variable "location" {
  description = "Value of the location if region id is not used"
  type        = string
}

variable "service_account_email" {
  description = "Value of the Service Account"
  type        = string
}

variable "notification_email_address" {
  description = "Email to receive alerts when resources with missing labels"
  type        = string
}

variable "scheduler_cas_job_frequency" {
  description = "Value of the cas job frequency to trigger the solution"
  type        = string
}

variable "alert_asset_types" {
  type        = list(string)
  description = "List of asset types to include in the alert. See https://cloud.google.com/asset-inventory/docs/supported-asset-types for supported types."
  default = [
    "cloudresourcemanager.googleapis.com/Project",
    "compute.googleapis.com/Instance",
    "storage.googleapis.com/Bucket",
    "bigquery.googleapis.com/Dataset",
    "bigquery.googleapis.com/Table",
    "pubsub.googleapis.com/Topic",
    "pubsub.googleapis.com/Subscription",
  ]
}

variable "activate_apis" {
  type = list(string)
  description = "List of APIs to enable for the project. This is necessary for some asset types to be correctly ingested by the feed."
  default = [
    "compute.googleapis.com",
    "bigquery.googleapis.com",
    "pubsub.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudfunctions.googleapis.com",
    "cloudasset.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "eventarc.googleapis.com",
    "storage.googleapis.com",
    "logging.googleapis.com",
    "monitoring.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
  ]
}
