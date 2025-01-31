resource "google_project_service" "storage_api" {
  service = "storage.googleapis.com"
}

resource "google_storage_bucket" "function_bucket" {
  name                        = var.bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  depends_on                  = [google_project_service.storage_api]
}



data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "${path.module}/function_source" # Path to Cloud Function source directory
  output_path = "${path.module}/function_source.zip"
}

resource "google_storage_bucket_object" "function_zip" {
  name   = "function_source.zip"
  bucket = var.bucket_name
  source = data.archive_file.function_zip.output_path
}



