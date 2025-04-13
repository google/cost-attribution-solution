import logging
from typing import List
import pandas as pd
from io import BytesIO

from services.tag_binding_manager import update_gcp_tags

class InvalidCsvFormatError(ValueError):
    """Custom exception for invalid CSV format."""
    pass

def transform_tags_csv(file_bytes: bytes) -> List[dict]:

    df = pd.read_csv(BytesIO(file_bytes))

    if "resource_id" not in df.columns or "location" not in df.columns:
        raise InvalidCsvFormatError(
            "Invalid CSV format: Missing required columns 'resource_id' or 'location'."
        )

    all_resource_tags = []
    columns = df.columns[2:] if len(df.columns) > 2 else []

    for _, row in df.iterrows():

        resource_tags = {
            "id": row["resource_id"],
            "location": None if bool(pd.isna(row["location"])) else row["location"],
            "tags": [],
        }

        # Add key/value for that resource
        for column in columns:
            if bool(pd.notnull(row[column])):
                resource_tags["tags"].append({"key": column, "value": row[column]})

        all_resource_tags.append(resource_tags)

    return all_resource_tags


def process_tags_csv(resource_tags: List[dict], clean_tags: bool):

    print(f"Processing: {resource_tags}")

    response: dict[str, dict] = {}

    for resource_tag in resource_tags:

        resource_id = resource_tag["id"]
        location = resource_tag["location"]
        tags = resource_tag["tags"]

        # TODO: make this async to process multiple projects concurrently
        try:
            response[resource_id] = {
                "value": {t["key"]: t["value"] for t in tags},
                "success": True,
            }

            update_gcp_tags(resource_id, tags, clean_tags=clean_tags, location=location)

        except Exception as e:
            logging.error(e)
            response[resource_id]["success"] = False
            response[resource_id]["details"] = str(e)

    return response
