# Copyright 2024 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import base64
import json
import logging

import base64
import json
import logging

def cas_alert(event, context):
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

            # Check if labels are missing and log a warning
            if not labels:
                logger.warning(
                    f"Resource with missing Label - Name: {asset.get('name')} | "
                    f"Asset Type: {asset.get('assetType')} | "
                    f"Parent: {resource.get('parent')}"
                )

        except json.JSONDecodeError as e:
            logger.error(f"Error decoding JSON: {e}. Raw message: {pubsub_message}")
    else:
        logger.info(f"Received non-JSON message: {pubsub_message}")