variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region for the resources"
  type        = string
}
variable "bq_region" {
  description = "The region for the BigQuery resources"
  type        = string
}

variable "bq_dataset_id" {
  description = "BigQuery dataset ID"
  type        = string
}

variable "bq_table_id" {
  description = "BigQuery table ID"
  type        = string
}

variable "bucket_name" {
  type = string
}
variable "cf_name" {
  type = string
}