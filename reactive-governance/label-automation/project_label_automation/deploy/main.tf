# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

provider "google" {
  project = var.project_id
  region  = var.region
  zone    = var.zone
}

resource "google_service_account" "cas_ca_service_account" {
  account_id   = var.service_account_id_clear_apply_labels
  display_name = var.service_account_name_clear_apply_labels
}

resource "google_folder_iam_member" "service_account_folder_viewer" {
  folder = var.folder_id
  role   = "roles/resourcemanager.folderViewer"
  member = "serviceAccount:${google_service_account.cas_ca_service_account.email}"
}

resource "google_folder_iam_member" "service_account_project_mover" {
  folder = var.folder_id
  role   = "roles/resourcemanager.projectMover"
  member = "serviceAccount:${google_service_account.cas_ca_service_account.email}"
}

resource "google_storage_bucket_iam_member" "member" {
  bucket = var.gcs_bucket
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${google_service_account.cas_ca_service_account.email}"
}

resource "google_compute_instance" "default" {
  name         = var.compute_instance_id
  machine_type = "n2-standard-2"
  zone         = "us-central1-a"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      labels = {
        cas = "clear-apply-labels"
      }
    }
  }

  // Local SSD disk
  scratch_disk {
    interface = "NVME"
  }

  network_interface {
    network = "default"

    access_config {
      // Ephemeral public IP
    }
  }

  service_account {
    email  = google_service_account.cas_ca_service_account.email
    scopes = ["cloud-platform"]
  }
}