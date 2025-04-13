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

from typing import Annotated
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from services.uploads.upload_tags import InvalidCsvFormatError, process_tags_csv, transform_tags_csv
from services.uploads_manager import parse_labels_csv, process_labels_csv

router = APIRouter()


@router.post("/labels", status_code=status.HTTP_201_CREATED, response_model=dict)
async def upload_labels_route(
    file: UploadFile = File(...),
    clean_labels: Annotated[
        bool,
        Query(
            description="Whether of not to delete all current labels before applying."
        ),
    ] = False,
):
    """Process the labels upload CSV file."""

    df, errors = parse_labels_csv(await file.read())

    if errors > 0:
        raise HTTPException(
            status_code=400,
            detail=f"invalid CSV schema for {file.filename}",
        )

    response = process_labels_csv(df, clean_labels)

    return response


@router.post("/tags", status_code=status.HTTP_201_CREATED, response_model=dict)
async def upload_tags_route(
    file: UploadFile = File(...),
    clean_tags: Annotated[
        bool,
        Query(
            description="Whether of not to delete all current tags before applying."
        ),
    ] = False,
):
    """Process the tags upload CSV file."""

    try:
        resource_tags = transform_tags_csv(await file.read())
    except InvalidCsvFormatError:
        raise HTTPException(
            status_code=400,
            detail=f"invalid CSV schema for {file.filename}",
        )


    return process_tags_csv(resource_tags, clean_tags)
