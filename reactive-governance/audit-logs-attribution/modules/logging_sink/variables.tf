variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "pubsub_topic_name" {
  description = "The name of the Pub/Sub topic to send logs to"
  type        = string
}