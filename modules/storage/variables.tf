variable "project_id" {
  description = "The ID of the GCP project"
  type        = string
}

variable "region" {
  description = "The region where the resources are located"
  type        = string
}

variable "bucket_name" {
  description = "The name of the storage bucket"
  type        = string
}

variable "object_name" {
  description = "The name of the object to upload"
  type        = string
}

variable "source_file_path" {
  description = "The path to the source file to be uploaded"
  type        = string
}
