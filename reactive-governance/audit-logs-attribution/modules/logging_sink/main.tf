# Resource: Creates the project-level logging sink
resource "google_logging_project_sink" "vertex_ai_sink" {
  name    = "vertex-ai-audit-sink"
  project = var.project_id

  # Destination for the logs (your Pub/Sub topic)
  destination = "pubsub.googleapis.com/projects/${var.project_id}/topics/${var.pubsub_topic_name}"

  # --- UPDATE THE FILTER SECTION BELOW ---
  filter = <<-EOT
    (protoPayload.serviceName="documentai.googleapis.com" OR protoPayload.serviceName="aiplatform.googleapis.com")
    AND
    logName=("projects/${var.project_id}/logs/cloudaudit.googleapis.com%2Factivity" OR "projects/${var.project_id}/logs/cloudaudit.googleapis.com%2Fdata_access")
  EOT
  # --- END OF UPDATE ---
}

# Resource: Grants the sink's service account permission to publish to the topic
resource "google_pubsub_topic_iam_member" "sink_publisher" {
  project = var.project_id
  topic   = var.pubsub_topic_name
  role    = "roles/pubsub.publisher"
  member  = google_logging_project_sink.vertex_ai_sink.writer_identity
}