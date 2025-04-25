# Copyright 2025 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Module to manage configuration and its persistence via GCS."""

import json
import logging
from google.api_core.exceptions import NotFound
from services.clients import ClientFactory

## Configurations
CONFIG_FILE_PATH = "app_config.json"
DEFAULT_CONFIG = {"asset_types": [], "report_urls": {}}

## Label policies
POLICY_LABELS_FILE_PATH = "label_policies.json"
DEFAULT_POLICY_LABEL = {}


def load_configurations(gcs_bucket_name, config_file_path=CONFIG_FILE_PATH) -> dict:
    """Loads configurations from a JSON file in GCS."""
    return _load_dict_from_gcs(gcs_bucket_name, config_file_path, DEFAULT_CONFIG)


def store_configurations(configurations: dict, gcs_bucket_name: str, config_file_path=CONFIG_FILE_PATH):
    """Saves configurations as a JSON file to GCS."""
    _store_dict_to_gcs(configurations, gcs_bucket_name, config_file_path)


def load_policy_labels(gcs_bucket_name, file_path=POLICY_LABELS_FILE_PATH) -> dict:
    """Loads policy from a JSON file in GCS."""
    return _load_dict_from_gcs(gcs_bucket_name, file_path, DEFAULT_POLICY_LABEL)


def update_policy_labels(policy: dict, gcs_bucket_name, file_path=POLICY_LABELS_FILE_PATH):
    """Update policy from a JSON file in GCS."""
    policies = load_policy_labels(gcs_bucket_name)

    # Add or update the given policy
    policies.update(policy)

    _store_dict_to_gcs(policies, gcs_bucket_name, POLICY_LABELS_FILE_PATH)

def delete_policy_labels(policy_key: str, gcs_bucket_name, file_path=POLICY_LABELS_FILE_PATH):
    """Delete policy from a JSON file in GCS."""
    policies = load_policy_labels(gcs_bucket_name)

    # Delete the given policy key
    if policy_key in policies:
        policies.pop(policy_key)

    _store_dict_to_gcs(policies, gcs_bucket_name, POLICY_LABELS_FILE_PATH)

def _load_dict_from_gcs(gcs_bucket_name: str, file_path: str, default=None) -> dict:
    """Loads a JSON file from GCS."""
    client = ClientFactory.get_storage_client()

    try:
        bucket = client.get_bucket(gcs_bucket_name)
        blob = bucket.blob(file_path)
        config_str = blob.download_as_text()
        return json.loads(config_str)
    except (NotFound, json.JSONDecodeError) as e:
        if not default:
            raise e

        logging.error(f"Not found or invalid JSON in file gs://{gcs_bucket_name}/{file_path}. Using defaults.")
        return default


def _store_dict_to_gcs(content: dict, gcs_bucket_name: str, file_path: str):
    """Saves dict as a JSON file to GCS."""

    client = ClientFactory.get_storage_client()

    bucket = client.get_bucket(gcs_bucket_name)
    blob = bucket.blob(file_path)
    config_str = json.dumps(content, indent=2)
    blob.upload_from_string(config_str, content_type="application/json")
