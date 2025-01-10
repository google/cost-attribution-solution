
output "object_name" {
  value = google_storage_bucket_object.object.name
}
output "bucket_name" {
  value = google_storage_bucket.function_bucket.name
}
