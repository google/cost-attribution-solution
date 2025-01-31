
resource "google_project_service" "cloud_functions_api" {
  project            = var.project_id
  service            = "cloudfunctions.googleapis.com"
  disable_on_destroy = false
}

resource "google_storage_bucket_object" "function_zip" {
  name   = "function_source.zip"                   # Name of the ZIP file in GCS
  bucket = var.function_bucket                     # Ensure this bucket is passed from root module
  source = "./modules/storage/function_source.zip" # Path to the generated ZIP file
}

resource "google_cloudfunctions2_function" "log_processor" {
  name     = var.name
  location = var.region

  build_config {
    entry_point = "process_log"
    runtime     = "python39"
    source {
      storage_source {
        bucket = var.function_bucket
        object = var.object_name
      }
    }
  }

  service_config {
    service_account_email = var.cloud_function_sa
  }

  event_trigger {
    trigger_region = var.region
    event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
    pubsub_topic   = var.pubsub_topic_id
  }

  depends_on = [
    google_project_service.cloud_functions_api,

  ]



}
