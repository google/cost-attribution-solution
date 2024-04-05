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

terraform {
  required_providers {
    google = {
      version = ">3.5.0"
    }
  }
}

provider "google" {
  project     = var.project_id
  region      = var.region
}

module "cas" {
  source = "../modules/cas-monitoring"

  organization_id              = var.organization_id
  project_id                   = var.project_id
  region                       = var.region
  location                     = var.location
  service_account_email        = var.service_account_email
  bigquery_dataset             = var.bigquery_dataset
  bigquery_table               = var.bigquery_table
  bigquery_table_view          = var.bigquery_table_view
  cas_topic                    = var.cas_topic
  scheduler_cas_job_name       = var.scheduler_cas_job_name
  cloud_function_cas_reporting = var.cloud_function_cas_reporting
  scheduler_cas_job_frequency  = var.scheduler_cas_job_frequency
  source_code_bucket           = var.source_code_bucket
  source_code_object           = var.source_code_object
}