
output "pubsub_sa_email" {
  description = "Pub/Sub service account email for token creation"
  value       = "service-${data.google_project.project.number}@gcp-sa-pubsub.iam.gserviceaccount.com"
}
output "vertex_ai_audit_topic_id" {
  value = google_pubsub_topic.vertex_ai_audit_topic.id
}

