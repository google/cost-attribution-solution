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

"""Tag Automator to easily manage tags from GCP resources."""
from http import HTTPStatus
import os
import logging
from flask import Flask, jsonify, request, Blueprint
from google.api_core.exceptions import GoogleAPICallError
from add_tag import add_gcp_tag

from tags_manager import delete_tag_key, getTags, update_tag_values
from update_resources_tags import update_gcp_tags, bulk_update_gcp_tags
from list_resources_tags import formatResources, search_resources_by_type
from delete_resources_tags import del_gcp_tags

scope = os.environ.get("SCOPE")

if not scope:
    raise Exception("SCOPE env variable must be provided.")

asset_type = os.environ.get(
    "ASSET_TYPES",
    [
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
    ],
)

api = Blueprint("api", __name__, url_prefix="/api")


# Endpoint 2: GET /resources
@api.route("/resources", methods=["GET"])
def get_resources():
    """Retrieve resources based on filters."""
    instance_resources = search_resources_by_type(scope, asset_type)
    filtered_resources = formatResources(instance_resources)
    return jsonify(filtered_resources)


# Endpoint 3: GET /tags
@api.route("/tags", methods=["GET"])
async def get_tags():
    """List all available tags."""
    return jsonify(await getTags(scope))


# Endpoint 4: POST /resource
@api.route("/resource", methods=["POST"])
def create_resource():
    """Create a new resource."""
    data = request.get_json()

    if not all(key in data for key in ("id", "tags")):
        return jsonify({"error": "Missing required fields (id, tags)"}), 400

    response = update_gcp_tags(data.get("id"), data.get("tags"), data.get("location"))

    if response:
        return (jsonify({"message": "Tag applied created successfully"}), 200)

    return (jsonify({"message": "Fail to apply tags on resource"}), 500)


# Endpoint 4: DEL /resource
@api.route("/resources/tags", methods=["DELETE"])
def delete_tags_from_resources():
    """Delete tags from multiple resources."""
    data = request.get_json()

    response = del_gcp_tags(data.get("resources"), data.get("tags"))

    if not response:
        return (
            jsonify({"message": "Tags delete successfully", "errors": response}),
            200,
        )
    else:
        return (
            jsonify(
                {
                    "message": "Fail to apply tags on resources",
                    "errors": response,
                }
            ),
            200,
        )


# Endpoint : POST /resource/tags
@api.route("/resources/tags", methods=["POST"])
def bulk_tags_from_resources():
    """Add tags to multiple resources."""
    data = request.get_json()

    if not all(key in data for key in ("resources", "tags")):
        return jsonify({"error": "Missing required fields (id, tags)"}), 400

    response = bulk_update_gcp_tags(data.get("resources"), data.get("tags"), scope)

    if not response:
        return (
            jsonify(
                {"message": "Tag applied created successfully", "errors": response}
            ),
            200,
        )
    else:
        return (
            jsonify({"message": "Fail to apply tags on resource", "errors": response}),
            200,
        )


# Endpoint : POST /resource/tags
@api.route("/tag", methods=["POST"])
def add_tag():
    """Add tags to multiple resources."""
    data = request.get_json()

    name = data.get("name")
    description = data.get("description")

    if not name:
        return jsonify({"message": "missing required field (name)"}), 400

    response = add_gcp_tag(name, description, scope)

    if not response:
        return (
            jsonify(
                {"message": "Internal error when creating tag.", "errors": response}
            ),
            500,
        )

    return (
        jsonify({"key": response}),
        201,
    )


# Endpoint : POST /resource/tags
@api.route("/tag/<path:key>", methods=["DELETE"])
def delete_tag(key):
    """Delete a tag (must be with zero values)."""

    try:
        delete_tag_key(key)
        return "", HTTPStatus.NO_CONTENT
    except GoogleAPICallError as e:
        logging.error(e)
        return (
            jsonify({"message": e.message}),
            500,
        )


# Endpoint : POST /resource/tags
@api.route("/tagValues", methods=["POST"])
async def edit_tag_values():
    """Edit tag values for a tag key."""
    data = request.get_json()

    key = data.get("key")
    values = data.get("values")

    if not key:
        return jsonify({"message": "missing required field (key)"}), 400

    try:
        values = await update_tag_values(key, values)

        return (
            jsonify({"message": values}),
            201,
        )
    except GoogleAPICallError as e:
        logging.error(e)
        return (
            jsonify({"message": e.message}),
            500,
        )


app = Flask(__name__)
app.register_blueprint(api)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)
