

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable Cloud Functions API (Move this here)
resource "google_project_service" "cloud_functions_api" {
  service            = "cloudfunctions.googleapis.com"
  disable_on_destroy = true
}

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


module "cloud_function" {
  source            = "./modules/cloud_function"
  name              = var.cf_name
  project_id        = var.project_id
  region            = var.region
  cloud_function_sa = module.iam.cloud_function_sa_email
  function_bucket   = module.storage.bucket_name
  pubsub_topic_id   = module.pubsub.vertex_ai_audit_topic_id
  object_name       = module.storage.object_name
  depends_on = [
    module.storage # Ensures Cloud Function waits for the ZIP file to be uploaded
  ]
}


module "bigquery" {
  source        = "./modules/bigquery"
  project_id    = var.project_id
  bq_region     = var.bq_region
  bq_dataset_id = var.bq_dataset_id
  bq_table_id   = var.bq_table_id
}

module "iam" {
  source          = "./modules/iam"
  project_id      = var.project_id
  pubsub_sa_email = module.pubsub.pubsub_sa_email
}
