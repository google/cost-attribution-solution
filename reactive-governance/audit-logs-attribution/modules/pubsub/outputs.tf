output "vertex_ai_audit_topic_id" {
  description = "The full ID of the Vertex AI audit log topic"
  value       = google_pubsub_topic.vertex_ai_audit_topic.id
}

output "vertex_ai_audit_topic_name" {
  description = "The name of the Vertex AI audit log topic"
  value       = google_pubsub_topic.vertex_ai_audit_topic.name
}

output "pubsub_sa_email" {
  description = "Pub/Sub service account email for token creation"
  value       = "service-${data.google_project.project.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}