variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "pubsub_sa_email" {
  description = "Pub/Sub service account email for token creation"
  type        = string
}