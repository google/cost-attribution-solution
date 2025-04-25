import os
from typing import List

# TODO: scope could be received per request
scope = os.environ.get("SCOPE")
gcs_bucket_name = os.environ.get("CONFIG_BUCKET")


if not scope or not gcs_bucket_name:
    raise Exception("SCOPE and CONFIG_BUCKET env variables must be provided.")

# Inject on routes
def get_scope() -> str:
    global scope
    return scope

def get_gcs_bucket_name() -> str:
    global gcs_bucket_name
    return gcs_bucket_name


def get_asset_types() -> List[str]:
    return [
        "compute.googleapis.com/Instance",
        "storage.googleapis.com/Bucket",
        "bigquery.googleapis.com/Table",
        "bigquery.googleapis.com/Dataset",
        "sqladmin.googleapis.com/Instance",
        "cloudresourcemanager.googleapis.com/Folder",
        "cloudresourcemanager.googleapis.com/Organization",
        "cloudresourcemanager.googleapis.com/Project",
        "run.googleapis.com/Service",
        "container.googleapis.com/Cluster",
        "compute.googleapis.com/Network",
        "compute.googleapis.com/Subnetwork",
    ]
