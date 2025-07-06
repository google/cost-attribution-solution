Vertex AI Audit Log Cost Attribution
This solution captures and processes Vertex AI audit logs, storing them in BigQuery to enable detailed cost attribution and analysis. By tracking resource usage through audit logs, you can gain insights into which specific users or services are driving your Vertex AI costs.

Architecture
The solution is built on a serverless architecture using the following Google Cloud services:

Cloud Logging Sink: Captures specific Vertex AI audit logs (for services like documentai.googleapis.com and aiplatform.googleapis.com) and routes them to a Pub/Sub topic.

Pub/Sub: Acts as a messaging queue to receive logs from the logging sink and trigger the processing function.

Cloud Function: A Python-based function that is triggered by new messages in the Pub/Sub topic. It processes the log data and inserts it into a BigQuery table.

BigQuery: A data warehouse that stores the processed audit logs for analysis and reporting. A predefined table schema is included to structure the incoming log data.

1. Prerequisites
Before you begin, ensure you have the following:

Host Project: A Google Cloud project where the solution's resources will be deployed.

Permissions: The Owner role on the host project is required for the initial setup.

Google Cloud SDK: The gcloud command-line tool must be installed and authenticated. You can find detailed instructions here.

Terraform: Terraform version v0.14.6 or higher must be installed. Instructions can be found here.

2. Deployment
Follow these steps to deploy the solution.

Step 2.1: Initial Project and Environment Setup
Run these commands in your terminal to configure your project and local environment.

Bash

# Set your project ID
export PROJECT_ID="<YOUR_PROJECT_ID>"
gcloud config set project $PROJECT_ID

# Ensure all gcloud components are up to date
gcloud components update

# Enable all required APIs for the solution
gcloud services enable iam.googleapis.com \
    cloudbuild.googleapis.com \
    eventarc.googleapis.com \
    run.googleapis.com \
    cloudfunctions.googleapis.com \
    logging.googleapis.com \
    bigquery.googleapis.com \
    pubsub.googleapis.com \
    storage.googleapis.com \
    appengine.googleapis.com \
    cloudresourcemanager.googleapis.com \
    --project=$PROJECT_ID
Step 2.2: Configure Terraform Variables
Clone the repository and navigate to the correct directory:

Bash

git clone https://github.com/google/cost-attribution-solution.git
cd cost-attribution-solution/reactive-governance/audit-logs-attribution
Create a terraform.tfvars file from the example:

Bash

cp terraform.tfvars.example terraform.tfvars
Open terraform.tfvars and update the following variables with your specific values:

project_id

region

bq_region

bq_dataset_id

bq_table_id

bucket_name

cf_name

Step 2.3: Run Terraform
Initialize your Terraform workspace, which downloads the necessary providers and modules.

Bash

terraform init
Create an execution plan to preview the resources that will be created.

Bash

terraform plan
Apply the configuration to deploy the resources.

Bash

terraform apply
When prompted, type yes to confirm the deployment.

3. Verification
Once the Terraform deployment is complete, you can verify that the solution is working:

Trigger a Vertex AI Action: Perform an action in Vertex AI that generates an audit log (e.g., create a notebook, run a training job).

Check Pub/Sub: Go to the Pub/Sub section in the Google Cloud Console and check the topic for new messages.

Check Cloud Function Logs: View the logs for the deployed Cloud Function to ensure it is being triggered and running without errors.

Query BigQuery: After a few moments, query your BigQuery table to see if the new audit log data has been inserted.

