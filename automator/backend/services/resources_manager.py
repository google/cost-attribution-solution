# Copyright 2024 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


"""Module to list all resources for scope."""

import re
from google.cloud import asset_v1


def search_resources_by_type(scope, asset_type):
    """Search for resources of a specific type within a GCP project.

    Args:
        scope (str): ID of the Google Cloud Project/Folder/Organization.
        asset_type (lst): Full resource type name
                           (e.g., ["compute.googleapis.com/Instance",...]).

    Returns:
        list: A list of ResourceSearchResult objects for the specified type.
    """
    client = asset_v1.AssetServiceClient()

    # Build the request, specifying the desired asset type
    request = asset_v1.SearchAllResourcesRequest(
        scope=scope,
        asset_types=asset_type,
        read_mask="displayName,location,assetType,tags,name,additionalAttributes,versionedResources",
    )

    # Iterate over the search results
    results = []
    for page in client.search_all_resources(request=request).pages:
        for result in page.results:
            results.append(result)

    return results


def formatResources(instance_resources):
    """Format resources into expected list format."""
    resources = []
    for resource in instance_resources:

        data_values = []
        if resource.tags:

            for tag in resource.tags:
                tag = {"id": tag.tag_key_id, "value": tag.tag_value_id}
                data_values.append(tag)

        data = {
            "id": format_asset_id(resource),
            "type": resource.asset_type,
            "name": resource.display_name,
            "location": resource.location,
            "tags": data_values,
        }

        resources.append(data)

    return resources


def _replace_last_part(original_string, new_part):
    """Replace the last part of a string separated by '/' with a new part."""
    parts = original_string.rsplit("/", 1)  # Split on the last '/'
    parts[-1] = new_part  # Replace the last part
    return "/".join(parts)  # Join the parts back together


# TODO: make this open-close
def format_asset_id(resource):
    """Format the ID based on need of each asset type."""
    if resource.asset_type == "container.googleapis.com/Cluster":
        return re.sub(r"\b(zones|regions)\b", "locations", resource.name, count=1)

    if resource.asset_type == "sqladmin.googleapis.com/Instance":
        return resource.name.replace("cloudsql", "sqladmin", 1)

    if resource.asset_type == "compute.googleapis.com/Instance":
        num_id = resource.additional_attributes.get("id")
        return _replace_last_part(resource.name, num_id)

    if resource.asset_type in [
        "compute.googleapis.com/Network",
        "compute.googleapis.com/Subnetwork",
    ]:
        num_id = resource.versioned_resources[0].resource.get("id")
        return _replace_last_part(resource.name, num_id)

    if resource.asset_type == "storage.googleapis.com/Bucket":
        return "//storage.googleapis.com/projects/_/buckets/" + resource.display_name

    return resource.name
