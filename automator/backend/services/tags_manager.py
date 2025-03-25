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


tagKeysClient = resourcemanager_v3.TagKeysAsyncClient()
tagValuesClient = resourcemanager_v3.TagValuesAsyncClient()


def add_gcp_tag(name, description, scope):
    """Add a tag to GCP scope location."""

    client = resourcemanager_v3.TagKeysClient()

    tag = resourcemanager_v3.TagKey(
        short_name=name, description=description, parent=scope
    )

    response = client.create_tag_key(
        request=resourcemanager_v3.CreateTagKeyRequest(tag_key=tag)
    ).result()

    return response.name if response else None


def delete_tag_key(key):
    client = resourcemanager_v3.TagKeysClient()

    client.delete_tag_key(resourcemanager_v3.DeleteTagKeyRequest(name=key))


async def update_tag_values(key, values):
    """Update tag values for key."""

    client = resourcemanager_v3.TagValuesAsyncClient()

    async def delete_tag_value(name):
        request = resourcemanager_v3.DeleteTagValueRequest(
            name=name,
        )
        return await (await client.delete_tag_value(request=request)).result()

    async def create_tag_value(short_name):
        request = resourcemanager_v3.CreateTagValueRequest(
            tag_value=resourcemanager_v3.TagValue(parent=key, short_name=short_name)
        )
        return await (await client.create_tag_value(request=request)).result()

    current_values = await _getTagValues(key, client)

    # This is now a dict of short_name: key
    values_dict = {value: key for key, value in current_values.items()}

    # Set math to find new values not present to create, and old values to delete
    to_be_deleted = set(values_dict.keys()) - set(values)
    to_be_created = set(values) - set(values_dict.keys())

    # Delete takes the key
    delete_tasks = [
        delete_tag_value(values_dict[short_name]) for short_name in to_be_deleted
    ]

    # Create takes only the value
    create_tasks = [create_tag_value(short_name) for short_name in to_be_created]

    operations = await asyncio.gather(*delete_tasks, *create_tasks)

    # Assemble response with updated
    for res in operations:

        # If deletion was success, remove from current values
        if res.short_name in to_be_deleted:
            del current_values[res.name]

        # Otherwise, include it
        else:
            current_values[res.name] = res.short_name

    return _formatTagValues(current_values)


async def getTags(scope):
    """List tags from Resource Manager API."""

    response = []

    try:

        keys = await _getTagKeys(scope)

        # Create a list of tasks to fetch tag values concurrently
        client = tagValuesClient
        tasks = [_getTagValues(key.name, client) for key in keys]

        # Gather the results from all tasks
        values = await asyncio.gather(*tasks)

        for key, values_dict in zip(keys, values):
            response.append(
                {
                    "key": {"id": key.name, "value": key.short_name},
                    "values": _formatTagValues(values_dict),
                }
            )

    except Exception as e:
        print(f"Fail to list tags: {e}")
        return None

    return response


async def _getTagKeys(scope):
    """Internal method to list Tag Keys."""

    client = tagKeysClient
    response = await client.list_tag_keys(parent=scope)

    return [k async for k in response]


async def _getTagValues(key, client):
    """Internal method to list Tag Keys."""

    values = await client.list_tag_values(
        resourcemanager_v3.ListTagValuesRequest(parent=key)
    )

    return {value.name: value.short_name async for value in values}


def _formatTagValues(values_dict):
    """Format tag values for list of id/value objects"""
    return [{"id": k, "value": v} for k, v in values_dict.items()]
