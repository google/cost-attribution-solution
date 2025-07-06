# import base64
# import json
# import os
# from google.cloud import bigquery
# from google.cloud import logging

# # Set up BigQuery client
# bq_client = bigquery.Client()
# dataset_id = os.environ.get("BQ_DATASET_ID", "vertex_ai_audit_logs")  # Get from env variable
# table_id = os.environ.get("BQ_TABLE_ID", "audit_events")  # Get from env variable
# table_ref = bq_client.dataset(dataset_id).table(table_id)

# # Set up Cloud Logging client
# logging_client = logging.Client()

# def process_log(event, context):
#     """
#     Triggered from a message on a Cloud Pub/Sub topic.
#     Args:
#         event (dict): Event payload.
#         context (google.cloud.functions.Context): Metadata for the event.
#     """
#     try:
#         # Decode the Pub/Sub message
#         pubsub_message = base64.b64decode(event['data']).decode('utf-8')
#         log_entry = json.loads(pubsub_message)

#         # Extract relevant fields
#         timestamp = log_entry.get('timestamp', '')
#         logName = log_entry.get('logName', '')
#         resource_type = log_entry.get('resource', {}).get('type', '')
#         resource_labels = log_entry.get('resource', {}).get('labels', {})
        
#         methodName = ''
#         principalEmail = ''
#         request = ''
#         response = ''
#         status_code = None
#         status_message = ''
#         status_details = []

#         if 'protoPayload' in log_entry:
#             protoPayload = log_entry['protoPayload']
#             methodName = protoPayload.get('methodName', '')
#             principalEmail = protoPayload.get('authenticationInfo', {}).get('principalEmail', '')
#             request = json.dumps(protoPayload.get('request', {}))
#             response = json.dumps(protoPayload.get('response', {}))

#             # Extract status details
#             if 'status' in protoPayload:
#                 status = protoPayload['status']
#                 status_code = status.get('code', None)
#                 status_message = status.get('message', '')
#                 status_details = status.get('details', [])

#         # Transform data for BigQuery
#         row_to_insert = {
#             "timestamp": timestamp,
#             "logName": logName,
#             "resource": {
#                 "type": resource_type,
#                 "labels": [
#                     {"key": k, "value": v} for k, v in resource_labels.items()
#                 ]
#             },
#             "protoPayload": {
#                 "methodName": methodName,
#                 "authenticationInfo": {
#                     "principalEmail": principalEmail
#                 },
#                 "request": request,
#                 "response": response,
#                 "status": {
#                     "code": status_code,
#                     "message": status_message,
#                     "details": [
#                         {"type": detail.get("type", ""), "data": detail.get("data", "")}
#                         for detail in status_details
#                     ]
#                 }
#             },
#             "severity": log_entry.get("severity", ""),
#             "receiveTimestamp": log_entry.get("receiveTimestamp", "")
#         }

#         # Insert data into BigQuery
#         errors = bq_client.insert_rows_json(table_ref, [row_to_insert])
#         if errors:
#             # Log detailed errors
#             for error in errors:
#                 logging_client.logger("bq-insertion-errors").log_struct(error)
#             raise Exception(f"Errors in BigQuery insertion: {errors}")
#         else:
#             print(f"Inserted row into BigQuery: {row_to_insert}")

#     except Exception as e:
#         # Log the entire exception stack trace
#         import traceback
#         logging_client.logger("function-errors").log_text(traceback.format_exc())
#         print(f"Error processing log: {e}")


################################

import base64
import json
import os
import traceback
from google.cloud import bigquery
from google.cloud import logging

# --- Initialization (runs once per container instance) ---
bq_client = bigquery.Client()
logging_client = logging.Client()

# Get configuration from environment variables
dataset_id = os.environ.get("BQ_DATASET_ID")
table_id = os.environ.get("BQ_TABLE_ID")

# Set up references if config is valid
table_ref = None
if dataset_id and table_id:
    table_ref = bq_client.dataset(dataset_id).table(table_id)

error_logger = logging_client.logger("function-errors")

def process_log(event, context):
    """
    Processes an audit log from a Pub/Sub message and inserts it into BigQuery.
    """
    if not table_ref:
        error_logger.log_text("Configuration error: BQ_DATASET_ID or BQ_TABLE_ID environment variables not set.")
        return

    try:
        # Decode the incoming Pub/Sub message
        pubsub_message = base64.b64decode(event['data']).decode('utf-8')
        log_entry = json.loads(pubsub_message)

        # --- Safely Extract All Fields from the Log ---
        protoPayload = log_entry.get('protoPayload', {})
        resource_info = log_entry.get('resource', {})
        authInfo = protoPayload.get('authenticationInfo', {})
        requestMetadata = protoPayload.get('requestMetadata', {})
        status = protoPayload.get('status', {}) # Can be None

        # --- Transform nested data structures for BigQuery ---
        # Convert the resource labels dictionary into a list of key-value records
        resource_labels = [{"key": k, "value": str(v)} for k, v in resource_info.get('labels', {}).items()]
        
        # Safely process status details only if a status object exists
        status_details = []
        if status:
            for detail in status.get('details', []):
                status_details.append({
                    "type": detail.get("@type"),
                    "data": json.dumps(detail) # Store the full detail object as a JSON string
                })

        # --- Construct the final row to insert ---
        row_to_insert = {
            "timestamp": log_entry.get('timestamp'),
            "logName": log_entry.get('logName'),
            "severity": log_entry.get('severity'),
            "receiveTimestamp": log_entry.get('receiveTimestamp'),
            "resource": {
                "type": resource_info.get('type'),
                "labels": resource_labels
            },
            "protoPayload": {
                "serviceName": protoPayload.get('serviceName'),
                "methodName": protoPayload.get('methodName'),
                "resourceName": protoPayload.get('resourceName'),
                "authenticationInfo": {
                    "principalEmail": authInfo.get('principalEmail')
                },
                "requestMetadata": {
                    "callerIp": requestMetadata.get('callerIp'),
                    "callerSuppliedUserAgent": requestMetadata.get('callerSuppliedUserAgent')
                },
                "request": json.dumps(protoPayload.get('request', {})),
                "response": json.dumps(protoPayload.get('response', {})),
                "status": {
                    "code": status.get('code') if status else None,
                    "message": status.get('message') if status else None,
                    "details": status_details
                }
            }
        }
        
        # --- Insert the row into BigQuery ---
        errors = bq_client.insert_rows_json(table_ref, [row_to_insert])
        if errors:
            error_logger.log_struct({"message": "Errors occurred during BigQuery insertion.", "errors": errors, "row_data": row_to_insert})
        else:
            print(f"Successfully inserted log for {protoPayload.get('methodName')} by {authInfo.get('principalEmail')}")

    except Exception as e:
        # Log any other exceptions to help with debugging
        error_logger.log_text(traceback.format_exc())
        print(f"An unexpected error occurred: {e}")