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
from fastapi import APIRouter, status
from pydantic import BaseModel

router = APIRouter()

class Configurations(BaseModel):
    asset_types: List[str]
    report_urls: dict[str, str]

@router.get("", status_code=status.HTTP_200_OK, response_model=dict)
async def fetch_configurations():
    """Fetch the configurations."""

    return {}

@router.post("", status_code=status.HTTP_201_CREATED, response_model=dict)
async def save_configurations(configurations: Configurations):
    """Save the configurations."""

    print(configurations)

    return {
        "details": 'OK'
    }
