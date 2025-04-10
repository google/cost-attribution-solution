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

import googleapiclient.discovery


def update_gcp_labels(projectId, new_labels, clean_labels: bool = True):
    """Update the labels on a GCP resource."""

    # Fetch project
    manager = googleapiclient.discovery.build("cloudresourcemanager", "v1")
    project = manager.projects().get(projectId=projectId).execute()

    # First fetch all labels from the project
    current_labels = project.setdefault("labels", {})

    # Update current labels with new values
    current_labels.update(new_labels)

    # Remove old labels if flag set
    if clean_labels:
        keys_to_delete = [k for k in current_labels.keys() if k not in new_labels]

        for k in keys_to_delete:
            del current_labels[k]

    request = manager.projects().update(projectId=projectId, body=project)
    project = request.execute()


def bulk_update_gcp_labels(projectIds, labels):

    for project in projectIds:
        projectId = project.id.split("/")[-1]

        try:
            update_gcp_labels(projectId, labels, False)
        except Exception as e:
            print(f"Error updating labels for project {projectId}: {e}")


def bulk_delete_gcp_labels(projectIds, keys):

    manager = googleapiclient.discovery.build("cloudresourcemanager", "v1")

    for project in projectIds:
        projectId = project.id.split("/")[-1]

        try:
            # Fetch project
            project = manager.projects().get(projectId=projectId).execute()

            # First fetch all labels from the project
            current_labels = project.setdefault("labels", {})

            # Delete specified keys
            for k in keys:
                if k in current_labels:
                    del current_labels[k]

            request = manager.projects().update(projectId=projectId, body=project)
            project = request.execute()

        except Exception as e:
            print(f"Error updating labels for project {projectId}: {e}")
