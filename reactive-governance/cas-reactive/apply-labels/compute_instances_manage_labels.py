import pandas as pd
import re
import logging
import json
from tabulate import tabulate
from google.cloud import compute_v1

def update_compute_instance_labels_from_csv():
  """
  Processes labels from a CSV file and applies to GCE Instances:
    - Prompts the user for the CSV URL.
    - Reads and validates the labels.
    - Prints the labels in tabular and JSON format.
    - Asks for confirmation to apply labels.
    - Applies the labels to the instances.
  """
  # example url - gs://cost_attribution/gce_labels.csv
  csv_url = input("Enter the CSV URL: ")

  # 1. Read labels from CSV
  labels_dict = read_labels_from_csv(csv_url)
  if labels_dict is None:  # Check if there were errors in the CSV
    print("\nError reading labels from CSV. Exiting.")
    return

  # 2. Validate data in the labels dictionary
  if not validate_instances(labels_dict):
    print("\nError validating instances. Exiting.")
    return

  # 3. Parse and validate the CSV data
  error_count = parse_csv(labels_dict)
  if error_count > 0:
    print(f"\nFound {error_count} errors in the CSV. Please fix them and try again.")
    return
  else:
    print("\nvalidation completed successfully!")

  # 4. Ask user if they want to clear existing labels
  clear_labels = input("\nDo you want to clear existing labels before applying? (y/n): ")
  clear_existing = clear_labels.lower() == 'y'

  # 6. Apply labels to instances
  apply_labels_to_instances(labels_dict, clear_existing)


def read_labels_from_csv(csv_file):
  """Reads labels from a CSV file and creates a dictionary of labels.

  The CSV file should have the following format:
  - Column 1: Project ID
  - Column 2: Zone
  - Column 3: Instance ID
  - Subsequent columns: Label keys (each column header is a label key)

  Args:
    csv_file: Path to the CSV file.

  Returns:
    A dictionary where keys are tuples of (project_id, zone, instance_id)
    and values are dictionaries of labels {label_key: label_value}.
  """

  df = pd.read_csv(csv_file)
  print("\n=== Print CSV Snippet (This may not display full csv) ===")
  print("=========================================================")
  print(tabulate(df, headers='keys', tablefmt='psql'))
  label_keys = df.columns[3:].tolist()
  labels_dict = {}

  for index, row in df.iterrows():
    project_id = row[0]
    zone = row[1]
    instance_id = row[2]

    labels = {}
    for key in label_keys:
      if pd.notna(key) and key:  # Check if key is not NaN and not empty
        value = row[key]
        if pd.notna(value) and value:  # Check if value is not NaN and not empty
          labels[key] = value

    labels_dict[(project_id, zone, instance_id)] = labels

  return labels_dict


def validate_instances(labels_dict):
  """Validates the data in the labels dictionary.

  Checks if all project IDs, zones, and instance IDs are strings or numbers and non-empty.

  Args:
    labels_dict: The dictionary of labels.

  Returns:
    True if the data is valid, False otherwise.
  """

  for (project_id, zone, instance_id), labels in labels_dict.items():
    for x in [project_id, zone, instance_id]:
      if not isinstance(x, (str, int)):
        print("Error: Project ID, zone, and instance ID must be strings or numbers.")
        return False
      if not str(x):
        print("Error: Project ID, zone, and instance ID must be non-empty.")
        return False
  return True

def parse_csv(labels_dict):
  """
  Validates the label keys and values in the labels_dict against the recommended patterns.

  Args:
      labels_dict: A dictionary where keys are tuples of (project_id, zone, instance_id)
                   and values are dictionaries of labels {label_key: label_value}.

  Returns:
      int: The number of errors found during validation.
  """
  print("\n=== Validating Labels ===")
  print("========================")
  key_pattern = r'^([a-z])([a-z0-9_-]{0,62})$'
  value_pattern = r'^([a-z0-9_-]{0,62})?$'
  error_count = 0
  warning_count = 0

  for (project_id, zone, instance_id), labels in labels_dict.items():
    for key, value in labels.items():
      if "Unnamed" in key:
        warning_count += 1
        logging.warning("Found empty column in the csv")
        print("WARNING: Found empty column in the csv")
      if not re.match(key_pattern, key):
        error_count += 1
        logging.error(f"Label Key '{key}' does not follow recommended pattern.")
        print(f"ERROR: Label Key '{key}' for instance {instance_id} in {zone} does not follow recommended pattern. "
              f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements")
      if not re.match(value_pattern, str(value)):
        error_count += 1
        logging.error(f"Label Value '{value}' does not follow recommended pattern.")
        print(f"ERROR: Label Value '{value}' for key '{key}' for instance {instance_id} in {zone} does not follow recommended pattern. "
              f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements")
  return error_count


def print_labels(labels_dict):
  """Prints the labels in a tabular format and as JSON.

  Args:
    labels_dict: The dictionary of labels.
  """

  table_data = []
  for (project_id, zone, instance_id), labels in labels_dict.items():
    row = [project_id, zone, instance_id]
    row.extend(labels.values())
    table_data.append(row)

  logging.info("Applying labels on projects listed in the csv file")
  print("\n=== New Labels to be applied ===")
  print("================================")

  # Convert tuple keys to strings
  json_compatible_dict = {str(key): value for key, value in labels_dict.items()}

  print(json.dumps(json_compatible_dict, indent=2))


def apply_labels_to_instance(client, project_id, zone, instance_id, labels, clear_existing):
  """Applies labels to a single instance.

  Args:
    client: The compute_v1.InstancesClient object.
    project_id: The ID of the project.
    zone: The zone of the instance.
    instance_id: The ID of the instance.
    labels: The labels to apply.
    clear_existing: Whether to clear existing labels.
  """

  try:
    instance_id = str(instance_id)
    instance = client.get(project=project_id, zone=zone, instance=instance_id)

    if clear_existing:
      labels_to_set = labels
    else:
      labels_to_set = instance.labels if instance.labels else {}
      labels_to_set.update(labels)

    label_fingerprint = instance.label_fingerprint
    data = compute_v1.InstancesSetLabelsRequest(
      labels=labels_to_set, label_fingerprint=label_fingerprint
    )

    operation = client.set_labels(
      project=project_id,
      zone=zone,
      instance=instance_id,
      instances_set_labels_request_resource=data,
    )
    wait_for_extended_operation(operation, "operation_set_labels")
    print(f"Labels applied to instance {instance_id} in {zone}")

  except Exception as e:
    print(f"Error applying labels to instance {instance_id} in {zone}: {e}")


def apply_labels_to_instances(labels_dict, clear_existing=False):
  """Applies labels to the specified instances.

  Args:
    labels_dict: The dictionary of labels.
    clear_existing: Whether to clear existing labels before applying new ones.
  """

  client = compute_v1.InstancesClient()

  print_labels(labels_dict)

  confirm = input("\nApply labels to these instances? (y/n): ")
  if confirm.lower() != 'y':
    print("Labeling cancelled.")
    return

  for (project_id, zone, instance_id), labels in labels_dict.items():
    apply_labels_to_instance(client, project_id, zone, instance_id, labels, clear_existing)


def wait_for_extended_operation(
    operation, verbose_name="operation", timeout=300
):
  """
  This method will wait for the extended (long-running) operation to
  complete. If the operation is successful, it will return its result.
  If the operation ends with an error, an exception will be raised.
  If there were any warnings during the execution of the operation
  they will be printed    to the console.

  Args:
    operation: a long-running operation you want to wait on.
    verbose_name: (optional) a more verbose name of the operation,
        used only during error and warning reporting.
    timeout: how long (in seconds) to wait for operation to finish.
        If None, wait indefinitely.

  Returns:
    Whatever the operation.result() returns.

  Raises:
    This method will raise the exception received from `operation.exception()`
    or RuntimeError if there is no exception set, but there is an `error_code`
    set for the `operation`.

    In case of an operation taking longer than `timeout` seconds to complete,
    a `concurrent.futures.TimeoutError` will be raised.
  """
  result = operation.result(timeout=timeout)

  if operation.error_code:
    print(
      f"Error during {verbose_name}: [Code: {operation.error_code}]: {operation.error_message}"
    )
    print(operation.error_details)
    raise operation.exceptions[operation.error_code]
  if operation.warnings:
    print(f"Warnings during {verbose_name}:\n{operation.warnings}")
  return result


if __name__ == "__main__":
  update_compute_instance_labels_from_csv()