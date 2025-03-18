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

from google.cloud import resourcemanager_v3


def add_gcp_tag(name, description, scope):
    """Add a tag to GCP scope location."""

    client = resourcemanager_v3.TagKeysClient()

    try:

        tag = resourcemanager_v3.TagKey(
            short_name=name, description=description, parent=scope
        )

        response = client.create_tag_key(
            request=resourcemanager_v3.CreateTagKeyRequest(tag_key=tag)
        ).result()

        return response.name if response else None

    except Exception as e:
        print(f"Fail to create tag: {e}")
        return None
