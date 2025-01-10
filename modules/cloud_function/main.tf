resource "google_project_service" "cloud_functions_api" {
  service = "cloudfunctions.googleapis.com"
  # Prevent Terraform from deleting this service on destroy
  disable_on_destroy = true
}
resource "google_cloudfunctions2_function" "log_processor" {
  name     = var.name 
  location = var.region
  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = var.pubsub_topic_id
  }
  build_config {
    entry_point = "process_log"
    runtime     = "python39"
    source {
      storage_source {
        bucket = var.function_bucket
        object = "function_source.zip"
      }
    }
  }
  service_config {
    service_account_email = var.cloud_function_sa
  }
  depends_on = [google_project_service.cloud_functions_api]
}


