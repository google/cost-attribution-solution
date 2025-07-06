output "dataset_id" {
  description = "The ID of the BigQuery dataset"
  value       = google_bigquery_dataset.dataset.dataset_id
}

output "table_id" {
  description = "The ID of the BigQuery table"
  value       = google_bigquery_table.table.table_id
}
