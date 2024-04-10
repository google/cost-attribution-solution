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

provider "google" {
  project     = var.project_id
  region      = var.region
  
  // These might be required if the quota project is different than the host project and are not associated with your credentials.
  // See https://registry.terraform.io/providers/hashicorp/google/latest/docs/guides/provider_reference#quota-management-configuration for more details.
  //user_project_override = true
  //billing_project = var.project_id
}

module "cas" {
  source = "../modules/cas-reactive"

  organization_id              = var.organization_id
  project_id                   = var.project_id
  region                       = var.region
  location                     = var.location
  service_account_email        = var.service_account_email
  notification_email_address   = var.notification_email_address
  scheduler_cas_job_frequency  = var.scheduler_cas_job_frequency
}