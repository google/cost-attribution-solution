variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "bq_region" {
  description = "The region for BigQuery resources"
  type        = string
}

variable "bq_dataset_id" {
  description = "The BigQuery dataset ID"
  type        = string
}

variable "bq_table_id" {
  description = "The BigQuery table ID"
  type        = string
}

variable "table_schema" {
  description = "The schema for the BigQuery table that matches the audit log structure"
  type        = any
  default = [
    {
      name = "protoPayload",
      type = "RECORD",
      mode = "NULLABLE",
      fields = [
        { name = "serviceName", type = "STRING", mode = "NULLABLE" },
        { name = "methodName", type = "STRING", mode = "NULLABLE" },
        { name = "resourceName", type = "STRING", mode = "NULLABLE" },
        {
          name = "authenticationInfo",
          type = "RECORD",
          mode = "NULLABLE",
          fields = [
            { name = "principalEmail", type = "STRING", mode = "NULLABLE" }
          ]
        },
        {
          name = "requestMetadata",
          type = "RECORD",
          mode = "NULLABLE",
          fields = [
            { name = "callerIp", type = "STRING", mode = "NULLABLE" },
            { name = "callerSuppliedUserAgent", type = "STRING", mode = "NULLABLE" }
          ]
        },
        { name = "request", type = "STRING", mode = "NULLABLE" },
        { name = "response", type = "STRING", mode = "NULLABLE" },
        {
          name = "status",
          type = "RECORD",
          mode = "NULLABLE",
          fields = [
            { name = "code", type = "INTEGER", mode = "NULLABLE" },
            { name = "message", type = "STRING", mode = "NULLABLE" },
            {
              name = "details",
              type = "RECORD",
              mode = "REPEATED",
              fields = [
                { name = "type", type = "STRING", mode = "NULLABLE" },
                { name = "data", type = "STRING", mode = "NULLABLE" }
              ]
            }
          ]
        }
      ]
    },
    {
      name = "resource",
      type = "RECORD",
      mode = "NULLABLE",
      fields = [
        { name = "type", type = "STRING", mode = "NULLABLE" },
        {
          name = "labels",
          type = "RECORD",
          mode = "REPEATED",
          fields = [
            { name = "key", type = "STRING", mode = "NULLABLE" },
            { name = "value", type = "STRING", mode = "NULLABLE" }
          ]
        }
      ]
    },
    { name = "timestamp", type = "TIMESTAMP", mode = "NULLABLE" },
    { name = "severity", type = "STRING", mode = "NULLABLE" },
    { name = "logName", type = "STRING", mode = "NULLABLE" },
    { name = "receiveTimestamp", type = "TIMESTAMP", mode = "NULLABLE" }
  ]
}