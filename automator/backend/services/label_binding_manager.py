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

"""Module to handle resources label binding."""

from google.cloud import resourcemanager_v3
from google.protobuf.field_mask_pb2 import FieldMask


def update_gcp_labels(resource_name, new_labels, location=None):
    """Update the labels on a GCP resource."""

    client = resourcemanager_v3.ProjectsClient()

    project = resourcemanager_v3.Project(
        name=f"projects/{resource_name.split("/")[-1]}"
    )
    project.labels = {l["id"]: l["value"] for l in new_labels}

    client.update_project(
        project=project, update_mask=FieldMask(paths=["labels"])
    ).result()
