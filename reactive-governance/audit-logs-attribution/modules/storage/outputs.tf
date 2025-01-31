

output "bucket_name" {
  value = google_storage_bucket.function_bucket.name
}

output "object_name" {
  description = "Name of the uploaded object in GCS"
  value       = google_storage_bucket_object.function_zip.name
}
