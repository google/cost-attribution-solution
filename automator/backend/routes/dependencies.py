import os
from typing import List

# TODO: scope could be received per request
scope = os.environ.get("SCOPE")

if not scope:
    raise Exception("SCOPE env variable must be provided.")

asset_types = [
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


# Inject on routes
def get_scope() -> str:
    global scope
    return scope


def get_asset_types() -> List[str]:
    global asset_types
    return asset_types
