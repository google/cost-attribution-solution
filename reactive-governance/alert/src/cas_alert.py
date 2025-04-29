# Copyright 2025 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import os
import base64
import json
import logging

from google.cloud import storage

GCS_BUCKET = f"{os.environ.get("GOOGLE_CLOUD_PROJECT")}-cas-config"
ALLOWED_LABELS_FILE = os.environ.get("ALLOWED_LABELS_FILE", "label_policies.json")

def read_dict_from_gcs(bucket_name, file_path, logger):
    """Reads a JSON file from GCS and returns it as a dictionary."""
    try:
        storage_client = storage.Client()
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(file_path)

        if not blob.exists():
            logger.error(f"GCS file not found: gs://{bucket_name}/{file_path}")
            return None

        content = blob.download_as_text()
        data = json.loads(content)
        logger.info(f"Successfully read dictionary from gs://{bucket_name}/{file_path}")
        return data
    except json.JSONDecodeError as e:
        logger.error(f"Error decoding JSON from GCS file gs://{bucket_name}/{file_path}: {e}")
        return None
    except Exception as e:
        logger.error(f"Error reading from GCS gs://{bucket_name}/{file_path}: {e}")
        return None

def cas_alert(event, _):
    """Cloud Function to process CAS alerts from Pub/Sub.

    Args:
        event (dict):  The dictionary with data that will be passed to the function by the trigger.
        context (google.cloud.functions.Context): The Cloud Functions event metadata.
    """
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO) # Or logging.DEBUG for even lower level

    # Get the Pub/Sub message data
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    # logger.info(f"Pub/Sub message: {pubsub_message}")

    # Check if the message is valid JSON
    if pubsub_message.startswith('{') or pubsub_message.startswith('['):
        try:
            # Parse the JSON message
            message_data = json.loads(pubsub_message)
            asset = message_data.get('asset', {})
            resource = asset.get('resource', {})
            labels = resource.get('data', {}).get('labels', {})

            # Log asset and resource information
            logger.info(f"Asset Type: {asset.get('assetType')}")
            logger.info(f"Name: {asset.get('name')}")
            logger.info(f"Parent: {resource.get('parent')}")
            logger.info(f"Labels count: {len(labels) if labels else 0}")

            allowed_labels_config = read_dict_from_gcs(GCS_BUCKET, ALLOWED_LABELS_FILE, logger)

            if allowed_labels_config is not None:
                # Check if labels are valid and log a warning if not
                if not validate_labels(labels, allowed_labels_config):
                    logger.warning(
                        f"Resource with invalid labels - Name: {asset.get('name')} | "
                        f"Asset Type: {asset.get('assetType')} | "
                        f"Parent: {resource.get('parent')}"
                    )
            # Verify if it has any labels at all
            else:
                if not labels:
                    logger.warning(
                        f"Resource with missing Labels - Name: {asset.get('name')} | "
                        f"Asset Type: {asset.get('assetType')} | "
                        f"Parent: {resource.get('parent')}"
                    )

        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON: {e}. Raw message: {pubsub_message}")
    else:
        logger.info(f"Received non-JSON message: {pubsub_message}")


def validate_labels(resource_labels: dict, allowed_labels_config: dict):
    """
    Validates if resource labels meet the criteria defined in allowed_labels_config.

    Args:
        resource_labels (dict | None): The labels found on the resource.
        allowed_labels_config (dict): The configuration dict read from GCS,
                                     defining required/allowed labels.

    Returns:
        bool: True if labels are valid, False otherwise.
    """

    # Empty policies, resource labels must not be empty
    if not allowed_labels_config:
        return len(resource_labels) > 0

    # First, check if keys are allowed
    if not set(resource_labels).issubset(allowed_labels_config):
      return False

    # Finally, check if values are allowed
    for k, v in resource_labels.items():
        if allowed_labels_config[k] and v not in allowed_labels_config[k]:
            return False

    return True
