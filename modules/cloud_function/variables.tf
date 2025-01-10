variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The region for the Cloud Function"
  type        = string
}

variable "function_bucket" {
  description = "The storage bucket for the function source code"
  type        = string
}

variable "pubsub_topic_id" {
  description = "The Pub/Sub topic ID for the event trigger"
  type        = string
}

variable "cloud_function_sa" {
  description = "The service account email for the Cloud Function"
  type        = string
}

variable "name" {

  type = string
}