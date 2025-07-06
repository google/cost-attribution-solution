provider "google" {
  project = var.project_id
  region  = var.region
}

# Declares the project data source at the root level
data "google_project" "project" {}

module "pubsub" {
  source     = "./modules/pubsub"
  project_id = var.project_id
}

module "storage" {
  source      = "./modules/storage"
  project_id  = var.project_id
  region      = var.region
  bucket_name = var.bucket_name
}

# Corrected module call with only the required variables
module "iam" {
  source          = "./modules/iam"
  project_id      = var.project_id
  pubsub_sa_email = module.pubsub.pubsub_sa_email
}

module "cloud_function" {
  source            = "./modules/cloud_function"
  name              = var.cf_name
  project_id        = var.project_id
  region            = var.region
  cloud_function_sa = module.iam.cloud_function_sa_email
  function_bucket   = module.storage.bucket_name
  pubsub_topic_id   = module.pubsub.vertex_ai_audit_topic_id
  object_name       = module.storage.object_name
  bq_dataset_id     = var.bq_dataset_id
  bq_table_id       = var.bq_table_id

  # Ensures the function waits for its service account and the code upload
  depends_on = [
    module.iam,
    module.storage
  ]
}

module "bigquery" {
  source        = "./modules/bigquery"
  project_id    = var.project_id
  bq_region     = var.bq_region
  bq_dataset_id = var.bq_dataset_id
  bq_table_id   = var.bq_table_id
}

module "logging_sink" {
  source            = "./modules/logging_sink"
  project_id        = var.project_id
  pubsub_topic_name = module.pubsub.vertex_ai_audit_topic_name
  depends_on = [
    module.pubsub
  ]
}

# This resource creates the final invoker permission AFTER the function exists
resource "google_cloud_run_service_iam_member" "function_invoker" {
  project  = var.project_id
  location = var.region
  service  = module.cloud_function.cloud_function_name
  role     = "roles/run.invoker"
  # member   = "serviceAccount:service-${data.google_project.project.number}@gcp-sa-eventarc.iam.gserviceaccount.com"
  member   = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"

  depends_on = [
    module.cloud_function
  ]
}