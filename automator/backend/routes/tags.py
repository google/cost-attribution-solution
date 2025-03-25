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

from fastapi import APIRouter, Body, HTTPException, status, Depends
from typing import List, Optional
from pydantic import BaseModel
from dependencies import get_scope

from services.tags_manager import (
    getTags,
    update_tag_values,
    delete_tag_key,
    add_gcp_tag,
)

router = APIRouter()


class Tag(BaseModel):
    name: str
    description: Optional[str]


class TagValues(BaseModel):
    key: str
    values: List[str]


@router.get("", response_model=List[dict])
async def get_tags_route(scope: str = Depends(get_scope)):
    """List all available tags."""
    return await getTags(scope)


@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def add_tag_route(tag: Tag = Body(...), scope: str = Depends(get_scope)):
    """Create a given Tag."""
    response = add_gcp_tag(tag.name, tag.description, scope)
    if not response:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating tag {tag.name}, please try again.",
        )
    return {"key": response}


@router.delete("/{key:path}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(key: str):
    """Delete a tag (must be with zero values)."""
    delete_tag_key(key)


@router.post("/tagValues", response_model=dict)
async def edit_tag_values(tag_values: TagValues = Body(...)):
    """Edit tag values for a tag key."""
    values = await update_tag_values(tag_values.key, tag_values.values)
    return {"detail": values}
