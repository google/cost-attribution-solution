resource "google_project_service" "bigquery_api" {
  service = "bigquery.googleapis.com"
  disable_on_destroy = false
}

resource "google_bigquery_dataset" "dataset" {
  dataset_id = var.bq_dataset_id
  location   = var.bq_region
  depends_on = [google_project_service.bigquery_api]
}

resource "google_bigquery_table" "table" {
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  project    = var.project_id
  table_id   = var.bq_table_id
  deletion_protection = false
  schema = jsonencode(var.table_schema)

  depends_on = [google_bigquery_dataset.dataset]
}




