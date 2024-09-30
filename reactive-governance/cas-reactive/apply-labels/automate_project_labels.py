# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from google.cloud import resourcemanager_v3
import googleapiclient.discovery
import pandas as pd
from tabulate import tabulate
import json
import re
import sys
import logging


# Create resource manager client
client = resourcemanager_v3.ProjectsClient()


def clear_and_apply_project_labels(csv_url):
    """
    Clear and Apply labels on project with data from CSV.
    The program first parses CSV file and validates the data for labels key:value pair
        Parameters:
            csv_url (str): GCS location of the csv file
    """
    # read projects and labels from csv file and convert into data frame
    logging.info("Reading csv file..")
    df = read_csv(csv_url)
    logging.info("Clearing labels from projects listed in the csv file")
    print("\n=== Clearing Labels ===")
    print("========================")
    print("\nProjects with labels:")
    projects_with_labels = list_project_id(df)
    logging.info(f"Total {len(projects_with_labels)} "
                 f"projects found to clear labels.")
    print(f"Total {len(projects_with_labels)} "
          f"projects found to clear labels.\n")

    # clear labels from projects that has labels
    if len(projects_with_labels) > 0:
        cont = input("---> Do you want to clear labels? ENTER Y: ")
        if cont.lower() == "y":
            print("Deleting current labels...\n")
            for project_id in projects_with_labels:
                delete_labels(project_id)

    # apply new labels
    logging.info("Applying labels on projects listed in the csv file")
    print("\n=== New Labels to be applied ===")
    print("================================")
    all_project_labels = build_labels_dict(df)
    cont = input("---> Do you want to apply labels? ENTER Y: ")
    if cont.lower() == 'y':
        print("Applying new labels...\n")
        apply_labels(all_project_labels)
    logging.info("Applying labels on all projects completed successfully")


def read_csv(csv_url):
    """
    Read csv file from GCS bucket. The csv file contains project ids and new
    labels to be applied
        Parameters:
            csv_url (str): GCS location of the csv file
        Returns:
            data frame (data frame): Data frame with csv data
    """
    # option 1: Panda accessing local file
    # storage_client = storage.Client()
    # bucket = storage_client.bucket("cost_attribution")
    # blob = bucket.blob("labels_update.csv")
    # blob.download_to_filename("labels_update_local.csv")

    # option 2: Access csv from gcs directly using url
    df = pd.read_csv(csv_url)
    # print csv file content as table on console
    print("\n=== Print CSV Snippet (This may not display full csv) ===")
    print("=========================================================")
    print(tabulate(df, headers='keys', tablefmt='psql'))
    # Parse CSV and if there is any error in the data, exit program
    csv_error_count = parse_csv(df)
    if csv_error_count > 0:
        exit_program()
    else:
        logging.info("CSV parsing completed successfully")
        print("CSV parsing completed successfully:\n")
    return df


def list_project_id(df):
    """
    Build list of projects from which label needs to be cleared
        Parameters:
            df (data frame): CSV data converted to data frame
        Returns:
            projects with labels (list): returns all projects with labels
    """
    projects_with_labels = []
    for index, row in df.iterrows():
        # get all rows from column[0] of csv (or dataframe)
        # considering column[0] is 'project_id'
        project_id = row[df.columns[0]]
        # add project on the list if the project has labels
        if project_labeled(project_id):
            projects_with_labels.append(project_id)
            logging.info(project_id)
            print(project_id)
    return projects_with_labels


def project_labeled(project_id):
    """
    Check if the project has any labels
        Parameters:
            project_id (str): project id
        Returns:
            TRUE or FALSE (boolean): returns TRUE if project has any label,
            else FALSE
    """
    request = resourcemanager_v3.GetProjectRequest(
        name=f"projects/{project_id}"
    )
    response = client.get_project(request=request)
    labels = response.labels
    if not labels:
        return False
    else:
        return True


def delete_labels(project_id):
    """
    Clear all labels from a project
        Parameters:
            project_id (str): project id to delete all labels from the project
    """
    manager = googleapiclient.discovery.build('cloudresourcemanager', 'v1')
    request = manager.projects().get(projectId=project_id)
    project = request.execute()
    del project['labels']
    request = manager.projects().update(projectId=project_id, body=project)
    project = request.execute()
    logging.info(f"Labels deleted successfully for project_id: {project_id}")
    print(f"Labels deleted successfully for project_id: {project_id}")


def apply_project_labels(project_id, new_labels):
    """
    Apply new Labels to a project
        Parameters:
            project_id (str): project id
            new_labels (dict): new labels as dictionary
    """
    request = resourcemanager_v3.GetProjectRequest(
        name=f"projects/{project_id}"
    )
    # Make the request
    response = client.get_project(request=request)
    labels = response.labels
    labels.update(new_labels)
    response.labels = labels
    update_request = resourcemanager_v3.UpdateProjectRequest(
        project=response,
        update_mask="labels"
    )
    update_response = client.update_project(request=update_request)
    # todo - error handling
    logging.info(f"Labels applied successfully for project_id: {project_id}")
    print(f"Labels applied successfully for project_id: {project_id}")


def build_labels_dict(df):
    """
    Build dictionary object with project id as key and dictionary of labels as value
        Parameters:
            df (data frame): CSV data converted to data frame
        Returns:
            all project labels (dict): returns dict with project_id as key and
            nested dict of labels as key:value pair for each project_id
    """
    all_projects_labels = {}
    columns = df.columns
    for index, row in df.iterrows():
        project_labels = {}
        for column in columns:
            # skip project columns and cells where value is empty
            if column != "project_id" and not pd.isnull(row[column]):
                project_labels[column] = row[column]
        json_str = json.dumps(project_labels, indent=4)
        print(f"project_id: {row[columns[0]]}, \nlabels: {json_str}\n")
        all_projects_labels[row[columns[0]]] = project_labels
    return all_projects_labels


def apply_labels(all_project_labels):
    """
    Apply labels for all project_ids extracted from the csv
        Parameters:
            all_project_labels (nested dictionary): dictionary contains project_ids
            and corresponding labels
    """
    for project_id in all_project_labels.keys():
        labels = all_project_labels[project_id]
        # print(f"key: {project_id}, \nvalue: {labels}\n")
        apply_project_labels(project_id, labels)


def parse_csv(df):
    columns = df.columns
    print("\n=== Validating CSV ===")
    print("========================")
    key_pattern = r'^([a-z])([a-z0-9_-]{0,62})$'
    value_pattern = r'^([a-z0-9_-]{0,62})?$'
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
            print(f"ERROR: Label Key '{key}' does not follow recommended pattern. "
                  f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements")
    for index, row in df.iterrows():
        for column in columns:
            if not pd.isnull(row[column]) and not re.match(value_pattern, row[column]):
                error_count += 1
                logging.error(f" Label Value '{row[column]}' does not follow recommended pattern.")
                print(f"ERROR: Label Value '{row[column]}' does not follow recommended pattern. "
                      f"Refer https://cloud.google.com/resource-manager/docs/labels-overview#requirements")
    return error_count


def exit_program():
    print("Exiting the program...")
    sys.exit(0)


# ENTER CSV file url from GCS bucket
CSV_GS_LOCATION = "gs://cost_attribution/labels_update.csv"
#CSV_GS_LOCATION = "gs://cost_attribution/labels_update_with_error.csv"

if __name__ == "__main__":
    clear_and_apply_project_labels(CSV_GS_LOCATION)