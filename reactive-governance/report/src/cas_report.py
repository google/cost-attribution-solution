# Copyright 2024 Google LLC

#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at

#        http://www.apache.org/licenses/LICENSE-2.0

#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.

import os
import logging

from google.cloud import asset_v1

# Configure environment variables
PROJECT_ID = os.getenv("PROJECT_ID")
BIGQUERY_DATASET = os.getenv("BIGQUERY_DATASET")
BIGQUERY_TABLE = os.getenv("BIGQUERY_TABLE")
PARENT = os.getenv("PARENT")

def cas_report(event, context):
    """
    Cloud Function to export organization assets to BigQuery table
    """
    logger = logging.getLogger(__name__)
    logger.setLevel(logging.INFO) # Or logging.DEBUG for even lower level
    logger.info("Asset export start")

    client = asset_v1.AssetServiceClient()

    # If org ID is provided, scan all projects in the org or scan the host project
    if PARENT and PARENT.strip():
        parent_id = f"organizations/{PARENT}"
    else:
        parent_id = f"projects/{PROJECT_ID}"

    output_config = asset_v1.OutputConfig(
        bigquery_destination=asset_v1.BigQueryDestination(
            dataset=f"projects/{PROJECT_ID}/datasets/{BIGQUERY_DATASET}",
            table=BIGQUERY_TABLE,
            force=True,
        )
    )

    request = asset_v1.ExportAssetsRequest(
        parent=parent_id,
        content_type=asset_v1.ContentType.RESOURCE,
        output_config=output_config,
    )

    operation = client.export_assets(request=request)
    response = operation.result()

    logger.info(response)
    logger.info("Asset export complete")

