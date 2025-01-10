resource "google_project_service" "storage_api" {
  service = "storage.googleapis.com"
}

resource "google_storage_bucket" "function_bucket" {
  name                        = var.bucket_name
  location                    = var.region
  uniform_bucket_level_access = true
  depends_on                  = [google_project_service.storage_api]
}


resource "google_storage_bucket_object" "object" {
  name   = var.object_name
  bucket = google_storage_bucket.function_bucket.name
  source = var.source_file_path
}
