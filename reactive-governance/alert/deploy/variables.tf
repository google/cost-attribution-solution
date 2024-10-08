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
    condition = var.region != "us-central1" && var.region != "europe-west1"
    error_message = "Region must be set to an App Engine location. us-central1 and europe-west1 should be specified as us-central and europe-west respectively."
  }
}

variable "cas_alerting_topic" {
  description = "Value of the Pub/Sub topic Id subscribed to asset feed and triggers Cloud Function"
  type        = string
  default     = "cas_alerting_topic"
}

variable "cloud_function_cas_alerting" {
  description = "Value of the name for the Cloud Function to Alert for missing labels"
  type        = string
  default     = "cas_alert"
}

variable "cloud_function_cas_alerting_desc" {
  description = "Value of the description for the Cloud Function to Alert missing labels"
  type        = string
  default     = "Alert when resources created or updated and are missing labels"
}

variable "cas_alert_log_metric" {
  description = "Value of the name for custom log metric"
  type        = string
  default     = "cas_alert_log_metric"
}

variable "notification_email_address" {
  description = "Email to receive alerts when resources with missing labels"
  type        = string
}

variable "bucket_gcf_source_name" {
  description = "Bucket to upload source code to Cloud Function"
  type        = string
}

variable "cloud_function_cas_reporting_memory" {
  description = "Value of the memory for the Cloud Function to Export Assets in Bigquery"
  type        = string
  default     = "512M"
}

variable "cloud_function_cas_reporting_timeout" {
  description = "Value of the timeout for the Cloud Function to Export Assets in Bigquery"
  type        = number
  default     = 540
}

variable "service_account_email" {
  description = "Value of the Service Account"
  type        = string
}