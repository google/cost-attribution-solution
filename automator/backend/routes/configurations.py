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

from typing import List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from routes.dependencies import get_gcs_bucket_name
from services.configurations_manager import load_configurations, store_configurations

router = APIRouter()

class Configurations(BaseModel):
    asset_types: List[str]
    report_urls: dict[str, str]

@router.get("", status_code=status.HTTP_200_OK, response_model=Configurations)
async def fetch_configurations(gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Fetch the configurations."""

    config_data = load_configurations(gcs_bucket_name)
    return Configurations(**config_data)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def save_configurations(configurations: Configurations, gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Save the configurations."""

    store_configurations(configurations.model_dump(), gcs_bucket_name)
    return {"detail": "Configurations saved successfully."}
