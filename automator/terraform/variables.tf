/*
Copyright 2025 Google LLC

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

variable "activate_apis" {
  type        = list(string)
  description = "List of APIs to enable for the project. This is necessary for some asset types to be correctly ingested by the feed."
  default = [
    "cloudasset.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iap.googleapis.com",
    "dns.googleapis.com",
    "compute.googleapis.com",
    "cloudfunctions.googleapis.com",
  ]
}

variable "region" {
  description = "Value of the region to deploy the solution"
  type        = string
  default     = "us-east1"
}

variable "tag_name" {
  description = "The tag of the image"
  default     = "latest"
}

variable "domain" {
  description = "Domain name to run the load balancer on."
  type        = string
}

variable "lb_name" {
  description = "Name for load balancer and associated resources"
  default     = "iap-lb"
}

variable "iam_roles" {
  type        = list(string)
  description = "IAM roles assigned to service account at Org Level"
  default = [
    "roles/resourcemanager.tagUser",
    "roles/cloudasset.viewer",
    "roles/resourcemanager.tagAdmin",
    "roles/resourcemanager.projectMover"
  ]
}

variable "support_email_address" {
  description = "Email to be contacted in case of errors or missing permissions"
  type        = string
}

variable "iap_members" {
  description = "Lista de membros para o IAP"
  type        = list(string)
}
