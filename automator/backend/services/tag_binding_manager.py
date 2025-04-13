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

"""Module to handle resources tag binding."""

from google.cloud import resourcemanager_v3
from services.clients import ClientFactory
from services.list_possible_tags import getTags


def update_gcp_tags(resource_name, new_tags, clean_tags=False, location=None):
    """Update the tags on a GCP resource."""

    client = ClientFactory.get_tag_bindings_client(location)

    # Retrieve existing tag bindings (handling NotFound for missing resources)
    current_bindings = client.list_tag_bindings(parent=resource_name)

    existing_tag_values = {binding.tag_value for binding in current_bindings}
    new_tag_values = {new_binding["value"] for new_binding in new_tags}

    tag_bindings_to_add = []
    for _tag in new_tags:
        tag_value = _tag["value"]
        if tag_value not in existing_tag_values:
            tag_binding = resourcemanager_v3.TagBinding(
                tag_value=tag_value, parent=resource_name
            )
            tag_bindings_to_add.append(tag_binding)

    if clean_tags:
        tag_bindings_to_remove = []

        for binding in current_bindings:
            if binding.tag_value not in new_tag_values:
                tag_bindings_to_remove.append(binding)

        for tag_binding in tag_bindings_to_remove:
            client.delete_tag_binding(name=tag_binding.name)

    for tag_binding in tag_bindings_to_add:
        client.create_tag_binding(tag_binding=tag_binding)


def bulk_update_gcp_tags(resources, add_tags, scope):
    """Add tag to multiple resources."""
    error_list = []
    dic_tags = _transform_tags(getTags(scope))

    for resource in resources:
        id = resource.get("id")
        location = resource.get("location")

        client = ClientFactory.get_tag_bindings_client(location)

        try:

            current_bindings = client.list_tag_bindings(parent=id)
            existing_tag_keys = {
                dic_tags.get(binding.tag_value): binding for binding in current_bindings
            }

            for tag_binding in add_tags:
                if tag_binding["id"] in existing_tag_keys:
                    client.delete_tag_binding(
                        name=existing_tag_keys[tag_binding["id"]].name
                    )

                client.create_tag_binding(
                    tag_binding=resourcemanager_v3.TagBinding(
                        tag_value=tag_binding["value"], parent=id
                    )
                )

        except Exception as e:
            print(f"Fail to edit tags: {e}")
            error_list.append(id)

    return error_list


def del_gcp_tags(resources, del_tags):
    """Update the tags on a GCP resource."""
    error_list = []
    tag_values = {new_binding["value"] for new_binding in del_tags}

    for resource in resources:
        id = resource.get("id")
        location = resource.get("location")

        client = ClientFactory.get_tag_bindings_client(location)

        # Retrieve existing tag bindings (handling NotFound for missing resources)
        try:
            current_bindings = client.list_tag_bindings(parent=id)

            tag_bindings_to_remove = []
            for binding in current_bindings:
                if binding.tag_value in tag_values:
                    tag_bindings_to_remove.append(binding)

            for tag_binding in tag_bindings_to_remove:
                client.delete_tag_binding(name=tag_binding.name)

        except Exception as e:
            print(f"Fail to delete tags: {e}")
            error_list.append(id)

    return error_list


def _transform_tags(tags):
    """Transform tags from key/values to values/key."""
    # Initialize an empty dictionary to store the results
    result_dict = {}

    # Iterate through the main list of dictionaries
    for item in tags:
        # Get the "key" id for this item
        key_id = item["key"]["id"]

        # Iterate through the list of "values" dictionaries within this item
        for value_dict in item["values"]:
            # Get the "id" from the "values" dictionary
            value_id = value_dict["id"]

            # Add the "value" id as the key and the "key" id as the value to the result dictionary
            result_dict[value_id] = key_id

    return result_dict
