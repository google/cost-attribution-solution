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

import re
import logging
import pandas as pd
from io import BytesIO


def parse_labels_csv(file_bytes: bytes):
    """Parse the label CSV upload file and report error count."""

    df = pd.read_csv(BytesIO(file_bytes))
    df = df.astype(str)  # Convert DataFrame to string

    columns = df.columns
    print("\n=== Validating CSV ===")
    print("========================")
    key_pattern = r"^([a-z])([a-z0-9_-]{0,62})$"
    value_pattern = r"^([a-z0-9_-]{0,62})?$"
    warning_count = 0
    error_count = 0

    for key in columns:
        if "Unnamed" in key:
            warning_count += 1
            logging.warning("Found empty column in the csv")
            print("WARNING: Found empty column in the csv")
        if not re.match(key_pattern, key):
            error_count += 1
            logging.error(f"Label Key '{key}' does not follow recommended pattern.")
            print(
                f"ERROR: Label Key '{key}' does not follow recommended pattern. "
                f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements"
            )
    for index, row in df.iterrows():
        for column in columns:
            if not pd.isnull(row[column]) and not re.match(value_pattern, row[column]):
                error_count += 1
                logging.error(
                    f" Label Value '{row[column]}' does not follow recommended pattern."
                )
                print(
                    f"ERROR: Label Value '{row[column]}' does not follow recommended pattern. "
                    f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements"
                )
    return error_count
