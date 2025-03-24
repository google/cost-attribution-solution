import os
import logging
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Body, Request, status
from fastapi.exceptions import RequestValidationError
from google.api_core.exceptions import GoogleAPICallError
from pydantic import BaseModel
from starlette.responses import JSONResponse

from add_tag import add_gcp_tag
from tags_manager import delete_tag_key, getTags, update_tag_values
from update_resources_tags import update_gcp_tags, bulk_update_gcp_tags
from list_resources_tags import formatResources, search_resources_by_type
from delete_resources_tags import del_gcp_tags

app = FastAPI()

scope = os.environ.get("SCOPE")

if not scope:
    raise Exception("SCOPE env variable must be provided.")

# TODO: filter it based on configuration screen
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


class Tag(BaseModel):
    name: str
    description: Optional[str]


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


class TagValues(BaseModel):
    key: str
    values: List[str]


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError):
    logging.error(exc)
    return JSONResponse(
        status_code=422,
        content={"detail": "missing or invalid input fields."},
    )


@app.exception_handler(GoogleAPICallError)
async def google_api_call_error_handler(_: Request, exc: GoogleAPICallError):
    logging.error(exc)
    return JSONResponse(
        status_code=500,
        content={"details": exc.message},
    )


@app.exception_handler(Exception)
async def generic_error_handler(_: Request, exc: Exception):
    logging.error(exc)
    return JSONResponse(
        status_code=500,
        content={"details": "internal error, please contact admin."},
    )


@app.get("/api/health")
def get_health():
    """Health endpoint"""
    return {"detail": "OK"}


@app.get("/api/resources")
def get_resources():
    """Retrieve resources based on filters."""
    instance_resources = search_resources_by_type(scope, asset_type)
    filtered_resources = formatResources(instance_resources)
    return filtered_resources


@app.post("/api/resource")
def update_resource_tags(resource: ResourceTags = Body(...)):
    """Update tags for a resource."""

    update_gcp_tags(
        resource.id, [t.model_dump() for t in resource.tags], resource.location
    )

    return {"detail": "Tag applied created successfully."}


@app.delete("/api/resources/tags")
def delete_tags_from_resources(bulk: BulkResource = Body(...)):
    """Delete tags from multiple resources."""
    response = del_gcp_tags(
        [r.model_dump() for r in bulk.resources],
        [t.model_dump() for t in bulk.tags],
    )

    # No errors on any of the resources deleted
    if not response:
        return {"detail": "Tags deleted successfully."}

    return 500, {"errors": response}


@app.post("/api/resources/tags")
def bulk_tags_from_resources(bulk: BulkResource = Body(...)):
    """Add tags to multiple resources."""

    response = bulk_update_gcp_tags(
        [r.model_dump() for r in bulk.resources],
        [t.model_dump() for t in bulk.tags],
        scope,
    )

    # No errors on any of the resources edited
    if not response:
        return {"detail": "Tag applied successfully."}

    return 500, {"errors": response}


@app.get("/api/tags")
async def get_tags_route():
    """List all available tags."""
    return await getTags(scope)


@app.post("/api/tag", status_code=status.HTTP_201_CREATED)
def add_tag_route(tag: Tag = Body(...)):
    """Create a given Tag."""
    response = add_gcp_tag(tag.name, tag.description, scope)

    # Couldn't get the TagKey
    if not response:
        raise HTTPException(
            status_code=500,
            detail=f"Error creating tag {tag.name}, please try again or check console.",
        )

    return {"key": response}


@app.delete("/api/tag/{key:path}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(key: str):
    """Delete a tag (must be with zero values)."""
    delete_tag_key(key)


@app.post("/api/tagValues")
async def edit_tag_values(tag_values: TagValues = Body(...)):
    """Edit tag values for a tag key."""
    values = await update_tag_values(tag_values.key, tag_values.values)
    return {"detail": values}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8080)
