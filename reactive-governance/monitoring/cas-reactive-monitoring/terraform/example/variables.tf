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

variable "location" {
  description = "Value of the location if region id is not used"
  type        = string
}

variable "service_account_email" {
  description = "Value of the Service Account"
  type        = string
}

variable "bigquery_dataset" {
  description = "Value of the BigQuery dataset id to load assets"
  type        = string
}

variable "bigquery_dataset_desc" {
  description = "Value of the BigQuery dataset description to load assets"
  type        = string
  default     = "Dataset to load organization assets data"
}

variable "bigquery_dataset_default_partition_expiration_ms" {
  description = "Value of the Big Query Dataset default partition expiration"
  type        = number
  default     = 86400000
}

variable "bigquery_table" {
  description = "Value of the BigQuery table to load assets"
  type        = string
}

variable "bigquery_table_view" {
  description = "Value of the BigQuery view to extract assets without labels"
  type        = string
}

variable "bigquery_table_partition" {
  description = "Value of the Big Query Table time partitioning"
  type        = string
  default     = "DAY"
}

variable "cas_topic" {
  description = "Value of the Pub/Sub topic Id to trigger Cloud Function"
  type        = string
}

variable "scheduler_cas_job_name" {
  description = "Value of name of job scheduler"
  type        = string
}

variable "scheduler_cas_job_description" {
  description = "Value of description of job scheduler"
  type        = string
  default     = "trigger cost attribution monitoring cloud function"
}

variable "scheduler_cas_job_frequency" {
  description = "Value of the cas job frequency to trigger the solution"
  type        = string
}

variable "cloud_function_cas_reporting" {
  description = "Value of the name for the Cloud Function to Export Assets in Bigquery"
  type        = string
}

variable "cloud_function_cas_reporting_desc" {
  description = "Value of the description for the Cloud Function to Export Assets in Bigquery"
  type        = string
  default     = "Export Assets in Bigquery"
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

variable "source_code_bucket" {
  description = "Value of the source code bucket name"
  type        = string
}

variable "source_code_object" {
  description = "Value of the source code zip name"
  type        = string
}

