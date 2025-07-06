# Cost Attribution for Vertex AI Workloads via Audit Log Analysis
This document outlines a solution for obtaining detailed cost analytics for Vertex AI workloads. The methodology involves the implementation of an automated data pipeline to capture, process, and archive Vertex AI audit logs within BigQuery. This process facilitates the attribution of expenditures directly to specific users and API calls, thereby providing granular financial insights.

# Architectural Overview
The proposed architecture establishes a serverless data pipeline designed to stream audit logs directly into BigQuery, which enables comprehensive analysis. This solution captures and processes Vertex AI audit logs, storing them in BigQuery to enable detailed cost attribution and analysis. By tracking resource usage through audit logs, you can gain insights into which specific users or services are driving your Vertex AI costs.
![architecture](../img/cas-reactive-audit-log-architecture.png)

# Prerequisites
Prior to implementation, the following prerequisites must be satisfied:

**Google Cloud Project** A designated project is required to host the solution's resources.

**Permissions** The user or service account executing the deployment must possess the Owner role on the host project.

**Google Cloud SDK** The gcloud command-line tool must be installed and authenticated.

**Terraform** Version v0.14.6 or a subsequent version is required.

# Deployment Instructions
The subsequent steps provide a comprehensive guide for deploying the requisite infrastructure utilizing Terraform.

# Step 1: Environment Preparation
The initial phase involves the configuration of the designated Google Cloud project and the activation of all necessary services.

 Define the Project ID as an environment variable
 ```sh
export PROJECT_ID="<YOUR_PROJECT_ID>"
```

 Configure the gcloud CLI to target the specified project
```sh
gcloud config set project $PROJECT_ID
```

 Ensure all gcloud components are updated to the latest version
 ```sh
gcloud components update
```

 Enable all required APIs for the solution's operation
 ```sh
gcloud services enable \
    iam.googleapis.com \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    cloudfunctions.googleapis.com \
    logging.googleapis.com \
    bigquery.googleapis.com \
    pubsub.googleapis.com \
    storage.googleapis.com \
    cloudresourcemanager.googleapis.com \
    --project=$PROJECT_ID
```    


# Step 2: Terraform Variable Configuration
This step involves cloning the source repository and defining the configuration parameters for the solution.

## 1. Clone the Source Repository:
```sh
git clone https://github.com/google/cost-attribution-solution.git
cd cost-attribution-solution/reactive-governance/audit-logs-attribution
```


## 2. Create a Variables File:
A local configuration file should be created by copying the provided example.
```sh
cp terraform.tfvars.example terraform.tfvars
```

## 3. Define Configuration in terraform.tfvars:
The terraform.tfvars file must be populated with values corresponding to the target environment.
```sh
project_id    = "your-gcp-project-id"
region        = "us-central1"
bq_region     = "US"
bq_dataset_id = "vertex_ai_audit_logs"
bq_table_id   = "audit_events_raw"
bucket_name   = "your-unique-bucket-name"
cf_name       = "process-vertex-audit-logs"
```

# Step 3: Infrastructure Deployment
Execution of the standard Terraform workflow is required to provision the specified Google Cloud resources.

## 1. Initialize Terraform:
This command initializes the working directory, downloading necessary providers and modules.
```sh
terraform init
```

## 2. Generate an Execution Plan:
This command creates an execution plan, which details the resources that will be created, modified, or destroyed.
```sh
terraform plan
```

## 3. Apply the Configuration:
This command applies the changes required to reach the desired state of the configuration. Confirmation is required before proceeding.
```sh
terraform apply
```
