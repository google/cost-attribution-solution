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

"""Module to load all available tags on scope."""

from google.cloud import asset_v1


def getTags(scope):
    """Fetch tags from Asset Inventory using the provided scope."""
    client = asset_v1.AssetServiceClient()

    request = asset_v1.SearchAllResourcesRequest(
        scope=scope,
        asset_types=["cloudresourcemanager.googleapis.com/TagValue"],
        read_mask="name,displayName,versionedResources",
    )

    tags = {}

    for result in client.search_all_resources(request):
        resource = result.versioned_resources[0].resource

        # IDs
        keyId, valueId = resource.get("parent"), resource.get("name")

        # Values, format here is project/key/value
        _, keyLabel, valueLabel = resource.get("namespacedName").split("/")

        tag = tags.setdefault(keyId, {"label": keyLabel, "values": []})
        tag["values"].append({"id": valueId, "value": valueLabel})

    return [
        {"key": {"id": k, "value": v["label"]}, "values": v["values"]}
        for k, v in tags.items()
    ]
