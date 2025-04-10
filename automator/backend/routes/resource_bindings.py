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

import enum
from fastapi import APIRouter, Body, Depends, HTTPException
from typing import List, Optional, Set
from pydantic import BaseModel
from services.label_binding_manager import (
    bulk_delete_gcp_labels,
    bulk_update_gcp_labels,
    update_gcp_labels,
)
from routes.dependencies import get_asset_types, get_scope

from services.tag_binding_manager import (
    update_gcp_tags,
    bulk_update_gcp_tags,
    del_gcp_tags,
)
from services.resources_manager import (
    formatLabelResources,
    formatTagResources,
    search_resources_by_type,
)

router = APIRouter()


class Binding(BaseModel):
    id: str
    value: str


class Resource(BaseModel):
    id: str
    location: Optional[str] = None


class ResourceTags(BaseModel):
    id: str
    location: Optional[str] = None
    tags: List[Binding]


class ResourceLabels(BaseModel):
    id: str
    location: Optional[str] = None
    labels: List[Binding]


class BulkResourceLabels(BaseModel):
    resources: List[Resource]
    labels: List[Binding]


class BulkDeleteResourceLabels(BaseModel):
    resources: List[Resource]
    labels: Set[str]


class BulkResourceTags(BaseModel):
    resources: List[Resource]
    tags: List[Binding]


class Type(str, enum.Enum):
    labels = "labels"
    tags = "tags"


@router.get("", response_model=List[dict])
def get_resources(
    scope: str = Depends(get_scope),
    asset_types: List[str] = Depends(get_asset_types),
    type: Type = Type.labels,
):
    """Retrieve resources based on filters (TODO) and type."""
    match type:
        case Type.tags:
            instance_resources = search_resources_by_type(scope, asset_types)
            return formatTagResources(instance_resources)

        case Type.labels:
            # TODO: type is hardcoded for projects just for now
            instance_resources = search_resources_by_type(
                scope, ["cloudresourcemanager.googleapis.com/Project"]
            )
            return formatLabelResources(instance_resources)

        case _:
            return HTTPException(400, f"Invalid type ({type})")


@router.patch("/tags", response_model=dict)
def update_resource_tags(resource: ResourceTags = Body(...)):
    """Update tags for a resource."""
    update_gcp_tags(
        resource.id, [t.model_dump() for t in resource.tags], resource.location
    )
    return {"detail": "Tag applied created successfully."}


@router.delete("/tags", response_model=dict)
def delete_tags_from_resources(bulk: BulkResourceTags = Body(...)):
    """Delete tags from multiple resources."""
    response = del_gcp_tags(
        [r.model_dump() for r in bulk.resources],
        [t.model_dump() for t in bulk.tags],
    )
    if not response:
        return {"detail": "Tags deleted successfully."}

    return {"errors": response}


@router.post("/tags", response_model=dict)
def bulk_tags_from_resources(
    bulk: BulkResourceTags = Body(...), scope: str = Depends(get_scope)
):
    """Add tags to multiple resources."""
    response = bulk_update_gcp_tags(
        [r.model_dump() for r in bulk.resources],
        [t.model_dump() for t in bulk.tags],
        scope,
    )
    if not response:
        return {"detail": "Tag applied successfully."}

    return {"errors": response}


@router.patch("/labels", response_model=dict)
def update_resource_labels(resource: ResourceLabels = Body(...)):
    """Update labels for a resource."""

    # Adjust the correct labels expected API format
    labels = {l.id: l.value for l in resource.labels}

    # TODO: support other types, projects only for now
    projectId = resource.id.split("/")[-1]
    update_gcp_labels(projectId, labels)

    return {"detail": "Labels applied successfully."}


@router.post("/labels", response_model=dict)
def bulk_update_resource_labels(bulk: BulkResourceLabels = Body(...)):
    """Bulk update labels for a resource."""

    # Adjust the correct labels expected API format
    labels = {l.id: l.value for l in bulk.labels}

    bulk_update_gcp_labels(bulk.resources, labels)

    return {"detail": "Labels updated in bulk successfully."}


@router.delete("/labels", response_model=dict)
def bulk_dekete_resource_labels(bulk: BulkDeleteResourceLabels = Body(...)):
    """Bulk delete labels for a resource."""

    bulk_delete_gcp_labels(bulk.resources, bulk.labels)

    return {"detail": "Labels deleted in bulk successfully."}
