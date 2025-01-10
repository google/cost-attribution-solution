output "cloud_function_name" {
  description = "The name of the Cloud Function"
  value       = google_cloudfunctions2_function.log_processor.name
}

output "https_trigger_url" {
  value = google_cloudfunctions2_function.log_processor.service_config[0].uri
}

