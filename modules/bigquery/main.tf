resource "google_project_service" "bigquery_api" {
  service = "bigquery.googleapis.com"
}

resource "google_bigquery_dataset" "dataset" {
  dataset_id = var.bq_dataset_id
  location   = var.region
  depends_on = [google_project_service.bigquery_api]
}

resource "google_bigquery_table" "table" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  project    = var.project_id
  table_id   = var.bq_table_id

  schema = jsonencode(var.table_schema)

  depends_on = [google_bigquery_dataset.dataset]
}




