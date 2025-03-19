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

"""Module to handle adding new tags."""

import asyncio
from google.cloud import resourcemanager_v3


async def getTags(scope):
    """List tags from Resource Manager API."""

    response = []

    try:

        keys = _getTagKeys(scope)

        # Create a list of tasks to fetch tag values concurrently
        client = resourcemanager_v3.TagValuesAsyncClient()
        tasks = [_getTagValues(key.name, client) for key in keys]

        # Gather the results from all tasks
        values = await asyncio.gather(*tasks)

        for key, value_list in zip(keys, values):
            response.append(
                {
                    "key": {"id": key.name, "value": key.short_name},
                    "values": [
                        {"id": v.name, "value": v.short_name} for v in value_list
                    ],
                }
            )

    except Exception as e:
        print(f"Fail to list tags: {e}")
        return None

    return response


def _getTagKeys(scope):
    """Internal method to list Tag Keys."""

    client = resourcemanager_v3.TagKeysClient()

    return list(client.list_tag_keys(parent=scope))


async def _getTagValues(key, client):
    """Internal method to list Tag Keys."""

    response = []

    values = await client.list_tag_values(
        resourcemanager_v3.ListTagValuesRequest(parent=key)
    )

    async for value in values:
        response.append(value)

    return response
