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

"""Client factory for Google Cloud APIs."""

from google.cloud import resourcemanager_v3, asset_v1, storage
from google.api_core.client_options import ClientOptions


class ClientFactory:
    """Factory class for creating and managing Google Cloud API clients."""

    _instances = {}

    @classmethod
    def get_client(cls, client_class, endpoint=None):
        """
        Get a singleton instance of the specified client class.
        Lazily creates the client if it doesn't exist.
        Optionally sets a location based endpoint.
        """

        # Check endpoint to generate a unique instance key
        key = (client_class, endpoint)
        if key not in cls._instances:

            # Optional default endpoint based on location
            if endpoint:
                client_options = ClientOptions(api_endpoint=endpoint)
                cls._instances[key] = client_class(client_options=client_options)
            else:
                cls._instances[key] = client_class()

        return cls._instances[key]

    @classmethod
    def get_tag_keys_client(cls) -> resourcemanager_v3.TagKeysClient:
        """Gets Tag Key client with location endpoint if needed"""
        return cls.get_client(resourcemanager_v3.TagKeysClient)

    @classmethod
    def get_tag_keys_async_client(cls) -> resourcemanager_v3.TagKeysAsyncClient:
        """Gets Async Tag Key client with location endpoint if needed"""
        return cls.get_client(resourcemanager_v3.TagKeysAsyncClient)

    @classmethod
    def get_tag_values_client(cls) -> resourcemanager_v3.TagValuesClient:
        """Gets Tag Value client with location endpoint if needed"""
        return cls.get_client(resourcemanager_v3.TagValuesClient)

    @classmethod
    def get_tag_values_async_client(cls) -> resourcemanager_v3.TagValuesAsyncClient:
        """Gets Async Tag Value client with location endpoint if needed"""
        return cls.get_client(resourcemanager_v3.TagValuesAsyncClient)

    @classmethod
    def get_tag_bindings_client(
        cls, location=None
    ) -> resourcemanager_v3.TagBindingsClient:
        """Gets Tag Binding client with location endpoint if needed"""
        endpoint = "cloudresourcemanager.googleapis.com"
        if location is not None and location != "global":
            endpoint = location + "-" + endpoint

        return cls.get_client(resourcemanager_v3.TagBindingsClient, endpoint)

    @classmethod
    def get_asset_client(cls) -> asset_v1.AssetServiceClient:
        """Gets Asset client"""
        return cls.get_client(asset_v1.AssetServiceClient)

    @classmethod
    def get_storage_client(cls) -> storage.Client:
        """Get Cloud Storage client."""
        return cls.get_client(storage.Client)
