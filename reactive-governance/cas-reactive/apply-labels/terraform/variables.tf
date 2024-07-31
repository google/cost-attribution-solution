variable "project_id" {
  description = "Value of the Project Id to deploy the solution"
  type        = string
  default     = "prj-22-376417"
}

variable "folder_id" {
  description = "Value of the Folder Id to deploy the solution"
  type        = string
  default     = "665019192319"
}

variable "service_account_id_clear_apply_labels" {
  description = "Value of the Service Account Id to clear and apply labels"
  type        = string
  default     = "cas-apply-labels-sa"
}

variable "service_account_name_clear_apply_labels" {
  description = "Value of the Service Account name to clear and apply labels"
  type        = string
  default     = "service account name for clear and apply labels"
}

variable "region" {
  description = "Value of the region to deploy the solution"
  type        = string
  default     = "us-central"

  validation {
    condition = var.region != "us-central1" && var.region != "europe-west1"
    error_message = "us-central1 and europe-west1 should be specified as us-central and europe-west respectively."
  }
}

variable "zone" {
  description = "Value of the zone to deploy the solution"
  type        = string
  default     = "us-central-c"
}

variable "gcs_bucket" {
  description = "Value of the GCS bucket where csv file is stored with new labeling strategy"
  type        = string
  default     = "cost_attribution"
}

variable "compute_instance_id" {
  description = "Value of the compute instance id"
  type        = string
  default     = "cas-apply-label-instance"
}

