/*
Copyright 2023 Google LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

# Update values
organization_id              = "29428042487"   //update
project_id                   = "prj-21-376417" //update
region                       = "us-west1" //update
location                     = "US" //update
service_account_email        = "cost-attribution-solution@prj-21-376417.iam.gserviceaccount.com" //update
bigquery_dataset             = "cas_dataset_2"
bigquery_table               = "cas_table_2"
bigquery_table_view          = "cas_view_missing_labels_2"
cas_topic                    = "cas_topic_2"
scheduler_cas_job_name       = "cas_job_200"
cloud_function_cas_reporting = "casExportAssets1"
scheduler_cas_job_frequency  = "0 * * * *" //every hour
source_code_bucket           = "cas-source" //do not change
source_code_object           = "cas.zip" //do not change