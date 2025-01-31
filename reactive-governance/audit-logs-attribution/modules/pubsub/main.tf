resource "google_project_service" "pubsub_api" {
  service            = "pubsub.googleapis.com"
  disable_on_destroy = true
}

resource "google_pubsub_topic" "vertex_ai_audit_topic" {
  name       = "vertex-ai-audit-logs"
  depends_on = [google_project_service.pubsub_api]
}

data "google_project" "project" {}

