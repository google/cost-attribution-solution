# resource "google_project_service" "cloud_functions_api" {
#   service = "cloudfunctions.googleapis.com"
#   # Prevent Terraform from deleting this service on destroy
#   disable_on_destroy = true
# }
# resource "google_cloudfunctions2_function" "log_processor" {
#   name     = var.name 
#   location = var.region
#   event_trigger {
#     trigger_region = var.region
#     event_type     = "google.cloud.pubsub.topic.v1.messagePublished"
#     pubsub_topic   = var.pubsub_topic_id
#   }
#   build_config {
#     entry_point = "process_log"
#     runtime     = "python39"
#     source {
#       storage_source {
#         bucket = var.function_bucket
#         object = "function_source.zip"
#       }
#     }
#   }
#   service_config {
#     service_account_email = var.cloud_function_sa
#   }
#   depends_on = [google_project_service.cloud_functions_api]
# }
resource "google_project_service" "cloud_functions_api" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
  disable_on_destroy = false
}

# resource "null_resource" "package_function" {
#   provisioner "local-exec" {
#     command = <<EOT
#       rm -f function_source.zip
#       cd ${path.module}/function_source
#       zip -r ../function_source.zip * 
#     EOT
#   }

#   triggers = {
#     always_run = timestamp()
#   }
# }

# data "archive_file" "function_zip" {
#   type        = "zip"
#   source_dir  = "${path.module}/function_source" # Ensure the source code exists in this folder
#   output_path = "${path.module}/function_source.zip"
# }

resource "google_storage_bucket_object" "function_zip" {
  name   = "function_source.zip"  # Name of the ZIP file in GCS
  bucket = var.function_bucket    # Ensure this bucket is passed from root module
  source = "./modules/storage/function_source.zip"  # Path to the generated ZIP file
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
        object = var.object_name  # ✅ Reference module output correctly
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
