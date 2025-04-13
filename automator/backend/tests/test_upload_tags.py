import pytest
from services.uploads.upload_tags import InvalidCsvFormatError, transform_tags_csv

CSV_DATA_SIMPLE = """resource_id,location,tagKeys/123,tagKeys/456
resource1,europe-west1,valueA,valueB
resource2,,valueC,
resource3,us-central1,,valueD
"""

CSV_DATA_NO_TAG_COLUMNS = """resource_id,location
resource1,europe-west1
"""

CSV_DATA_EMPTY = """resource_id,location,tagKeys/123
"""

CSV_DATA_MISSING_COLUMN = """resource_id,tagKey1\nres1,val1""" # Missing 'location'

def test_transform_tags_csv_missing_required_column():
    """Tests transformation raises error for missing required columns."""
    file_bytes = CSV_DATA_MISSING_COLUMN.encode("utf-8")
    with pytest.raises(InvalidCsvFormatError, match="Invalid CSV format: Missing required columns"):
        transform_tags_csv(file_bytes)

def test_transform_tags_csv_simple():
    """Tests transformation with typical data."""
    file_bytes = CSV_DATA_SIMPLE.encode("utf-8")
    expected_output = [
        {
            "id": "resource1",
            "location": "europe-west1",
            "tags": [
                {"key": "tagKeys/123", "value": "valueA"},
                {"key": "tagKeys/456", "value": "valueB"},
            ],
        },
        {
            "id": "resource2",
            "location": None,
            "tags": [{"key": "tagKeys/123", "value": "valueC"}],
        },
        {
            "id": "resource3",
            "location": "us-central1",
            "tags": [{"key": "tagKeys/456", "value": "valueD"}],
        },
    ]
    actual_output = transform_tags_csv(file_bytes)
    assert actual_output == expected_output


def test_transform_tags_csv_no_tags():
    """Tests transformation with no tag columns."""
    file_bytes = CSV_DATA_NO_TAG_COLUMNS.encode("utf-8")
    expected_output = [
        {
            "id": "resource1",
            "location": "europe-west1",
            "tags": [],  # Expect empty list when no tag columns
        }
    ]
    actual_output = transform_tags_csv(file_bytes)
    assert actual_output == expected_output


def test_transform_tags_csv_empty_data():
    """Tests transformation with headers but no data."""
    file_bytes = CSV_DATA_EMPTY.encode("utf-8")
    expected_output = []  # Expect empty list for no data rows
    actual_output = transform_tags_csv(file_bytes)
    assert actual_output == expected_output
