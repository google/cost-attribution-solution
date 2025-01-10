output "cloud_function_sa_email" {
  description = "Email of the service account created for the Cloud Function"
  value       = google_service_account.cloud_function_sa.email
}
