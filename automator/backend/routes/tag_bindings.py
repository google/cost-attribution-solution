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

from fastapi import APIRouter, Body, Depends
from typing import List, Optional
from pydantic import BaseModel
from dependencies import get_asset_types, get_scope

from services.tag_binding_manager import (
    update_gcp_tags,
    bulk_update_gcp_tags,
    del_gcp_tags,
)
from services.resources_manager import formatResources, search_resources_by_type

router = APIRouter()


class TagBinding(BaseModel):
    id: str
    value: str


class Resource(BaseModel):
    id: str
    location: Optional[str] = None


class ResourceTags(BaseModel):
    id: str
    location: Optional[str] = None
    tags: List[TagBinding]


class BulkResource(BaseModel):
    resources: List[Resource]
    tags: List[TagBinding]


@router.get("", response_model=List[dict])
def get_resources(
    scope: str = Depends(get_scope), asset_types: List[str] = Depends(get_asset_types)
):
    """Retrieve resources based on filters."""
    instance_resources = search_resources_by_type(scope, asset_types)
    filtered_resources = formatResources(instance_resources)
    return filtered_resources


@router.patch("/tags", response_model=dict)
def update_resource_tags(resource: ResourceTags = Body(...)):
    """Update tags for a resource."""
    update_gcp_tags(
        resource.id, [t.model_dump() for t in resource.tags], resource.location
    )
    return {"detail": "Tag applied created successfully."}


@router.delete("/tags", response_model=dict)
def delete_tags_from_resources(bulk: BulkResource = Body(...)):
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
    bulk: BulkResource = Body(...), scope: str = Depends(get_scope)
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
