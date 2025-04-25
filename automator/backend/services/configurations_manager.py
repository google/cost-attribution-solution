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

CONFIG_FILE_PATH = "app_config.json"
DEFAULT_CONFIG = {"asset_types": [], "report_urls": {}}


def load_configurations(gcs_bucket_name, config_file_path=CONFIG_FILE_PATH) -> dict:
    """Loads configurations from a JSON file in GCS."""
    client = ClientFactory.get_storage_client()

    try:
        bucket = client.get_bucket(gcs_bucket_name)
        blob = bucket.blob(config_file_path)
        config_str = blob.download_as_text()
        return json.loads(config_str)
    except NotFound:
        logging.warning(f"Config file gs://{gcs_bucket_name}/{config_file_path} not found. Using default.")
        return DEFAULT_CONFIG
    except json.JSONDecodeError:
        logging.error(f"Invalid JSON in config file gs://{gcs_bucket_name}/{config_file_path}. Using default.")
        return DEFAULT_CONFIG


def store_configurations(configurations: dict, gcs_bucket_name: str, config_file_path=CONFIG_FILE_PATH):
    """Saves configurations as a JSON file to GCS."""

    client = ClientFactory.get_storage_client()

    bucket = client.get_bucket(gcs_bucket_name)
    blob = bucket.blob(config_file_path)
    config_str = json.dumps(configurations, indent=2)
    blob.upload_from_string(config_str, content_type="application/json")
