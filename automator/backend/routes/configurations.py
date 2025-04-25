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

from typing import Dict, List
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, RootModel
from routes.dependencies import get_gcs_bucket_name
from services import configurations_manager

router = APIRouter()

class Configurations(BaseModel):
    asset_types: List[str]
    report_urls: dict[str, str]

class LabelPolicy(RootModel[Dict[str, List[str]]]):
    pass

@router.get("", status_code=status.HTTP_200_OK, response_model=Configurations)
def fetch_configurations(gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Fetch the configurations."""

    config_data = configurations_manager.load_configurations(gcs_bucket_name)
    return Configurations(**config_data)

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
def save_configurations(configurations: Configurations, gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Save the configurations."""

    configurations_manager.store_configurations(configurations.model_dump(), gcs_bucket_name)
    return {"detail": "Configurations saved successfully."}

@router.get("/policy/label", status_code=status.HTTP_200_OK, response_model=dict)
def fetch_label_policy(gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Fetch label policies."""
    return configurations_manager.load_policy_labels(gcs_bucket_name)

@router.post("/policy/label", status_code=status.HTTP_204_NO_CONTENT)
def update_label_policy(policy: LabelPolicy, gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Update label policy."""
    configurations_manager.update_policy_labels(policy.model_dump(), get_gcs_bucket_name)

@router.delete("/policy/label/{key}", status_code=status.HTTP_204_NO_CONTENT)
def delete_label_policy(key: str, gcs_bucket_name: str = Depends(get_gcs_bucket_name)):
    """Delete label policy."""
    configurations_manager.delete_policy_labels(key, get_gcs_bucket_name)
