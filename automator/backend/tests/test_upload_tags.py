import pytest
from unittest.mock import patch, call
from services.uploads.upload_tags import InvalidCsvFormatError, transform_tags_csv, process_tags_csv

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


SAMPLE_RESOURCE_TAGS = [
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
]

@patch("services.uploads.upload_tags.update_gcp_tags")
def test_process_tags_csv_success(mock_update_gcp_tags):
    """Tests successful processing of tags."""
    clean_tags = True
    response = process_tags_csv(SAMPLE_RESOURCE_TAGS, clean_tags)

    # Check mock calls
    expected_calls = [
        call("resource1", SAMPLE_RESOURCE_TAGS[0]["tags"], clean_tags=clean_tags, location="europe-west1"),
        call("resource2", SAMPLE_RESOURCE_TAGS[1]["tags"], clean_tags=clean_tags, location=None),
    ]
    mock_update_gcp_tags.assert_has_calls(expected_calls, any_order=False)
    assert mock_update_gcp_tags.call_count == 2

    # Check response structure and success status
    assert "resource1" in response
    assert "resource2" in response
    assert response["resource1"]["success"] is True
    assert response["resource2"]["success"] is True
    assert "details" not in response["resource1"]
    assert "details" not in response["resource2"]
    # Verify the 'value' field contains the processed tags correctly
    assert response["resource1"]["value"] == {"tagKeys/123": "valueA", "tagKeys/456": "valueB"}
    assert response["resource2"]["value"] == {"tagKeys/123": "valueC"}


@patch("services.uploads.upload_tags.update_gcp_tags")
def test_process_tags_csv_clean_tags_false(mock_update_gcp_tags):
    """Tests processing with clean_tags set to False."""
    clean_tags = False
    response = process_tags_csv(SAMPLE_RESOURCE_TAGS, clean_tags)

    # Check mock calls ensure clean_tags=False is passed
    expected_calls = [
        call("resource1", SAMPLE_RESOURCE_TAGS[0]["tags"], clean_tags=clean_tags, location="europe-west1"),
        call("resource2", SAMPLE_RESOURCE_TAGS[1]["tags"], clean_tags=clean_tags, location=None),
    ]
    mock_update_gcp_tags.assert_has_calls(expected_calls, any_order=False)
    assert mock_update_gcp_tags.call_count == 2

    # Check response structure and success status
    assert response["resource1"]["success"] is True
    assert response["resource2"]["success"] is True


@patch("services.uploads.upload_tags.update_gcp_tags")
@patch("logging.error")
def test_process_tags_csv_partial_failure(mock_log_error, mock_update_gcp_tags):
    """Tests processing where one update fails."""
    clean_tags = True
    error_message = "Simulated GCP API Error"
    # Configure the mock to raise an error on the second call
    mock_update_gcp_tags.side_effect = [None, Exception(error_message)]

    response = process_tags_csv(SAMPLE_RESOURCE_TAGS, clean_tags)

    # Check mock calls (should be called twice despite error)
    assert mock_update_gcp_tags.call_count == 2

    # Check logging
    mock_log_error.assert_called_once()
    # Check that the logged message is the exception instance
    args, _ = mock_log_error.call_args
    assert isinstance(args[0], Exception)
    assert str(args[0]) == error_message


    # Check response structure and status
    assert "resource1" in response
    assert "resource2" in response
    assert response["resource1"]["success"] is True
    assert response["resource2"]["success"] is False
    assert "details" not in response["resource1"]
    assert response["resource2"]["details"] == error_message
    # Verify 'value' field is still present even on failure
    assert response["resource1"]["value"] == {"tagKeys/123": "valueA", "tagKeys/456": "valueB"}
    assert response["resource2"]["value"] == {"tagKeys/123": "valueC"}


@patch("services.uploads.upload_tags.update_gcp_tags")
def test_process_tags_csv_empty_input(mock_update_gcp_tags):
    """Tests processing with an empty input list."""
    response = process_tags_csv([], clean_tags=True)

    # Check mock was not called
    mock_update_gcp_tags.assert_not_called()

    # Check response is an empty dictionary
    assert response == {}
