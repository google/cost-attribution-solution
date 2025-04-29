# Copyright 2025 Google LLC

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from cas_alert import validate_labels

def test_empty_config_with_resource_labels():
    """Test validation when allowed_labels_config is empty."""
    resource_labels = {"env": "prod", "owner": "team-a"}
    allowed_labels_config = {}

    assert validate_labels(resource_labels, allowed_labels_config) is True

def test_empty_config_without_resource_labels():
    """Test validation when allowed_labels_config is empty."""
    resource_labels = {}
    allowed_labels_config = {}

    assert validate_labels(resource_labels, allowed_labels_config) is False


def test_config_without_resource_labels():
    """Test validation when policy allows but resource labels are empty."""
    resource_labels = {}
    allowed_labels_config = {"env": ["prod"], "team": ["team-a"]}

    assert validate_labels(resource_labels, allowed_labels_config) is True

def test_resouce_not_allowed_keys_allowed_values():
    """Test validation when policy allows the key but not the value."""
    resource_labels = {"env": "prod", "owner": "team-a"}
    allowed_labels_config = {"env": ["prod"], "team": ["team-a"]}

    assert validate_labels(resource_labels, allowed_labels_config) is False

def test_resouce_allowed_keys_not_values():
    """Test validation when policy allows the key but not the value."""
    resource_labels = {"env": "prod", "owner": "team-a"}
    allowed_labels_config = {"env": ["prod"], "owner": ["team-b"]}

    assert validate_labels(resource_labels, allowed_labels_config) is False

def test_resouce_allowed_keys_and_values():
    """Test validation when policy allows the key and also the value."""
    resource_labels = {"env": "prod", "owner": "team-a"}
    allowed_labels_config = {"env": ["prod"], "owner": ["team-a"]}

    assert validate_labels(resource_labels, allowed_labels_config) is True

def test_resouce_allowed_keys_policy_empty_values():
    """Test validation when policy allows the key and has empty value."""
    resource_labels = {"env": "prod", "owner": "team-a"}
    allowed_labels_config = {"env": ["prod"], "owner": []}

    assert validate_labels(resource_labels, allowed_labels_config) is True
