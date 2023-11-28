# Cost Attribution Reactive Solution - Reporting

> An easy-to-deploy Looker Studio Dashboard with showing
resources with missing labels in an organization, folder or project.

Do you run or administer applications on Google Cloud? Do you want to identify costs for individuals or application teams on Google Cloud? Do you want to automate billing for the enterprise with hundreds and thousands of employees using Google Cloud? If your answer is yes, this guide is for you. Google Cloud provides Labels to help enterprises identify and manage costs. Labels are a powerful tool to track your GCP usage and resources at scale, and with the granularity you need.

## What are Labels?

[Labels](https://cloud.google.com/resource-manager/docs/creating-managing-labels) are key-value pairs that are supported by a number of GCP resources. You can attach a label to each resource, then filter the resources based on their labels. Labels provide a convenient way for developers and administrators to organize resources at scale. By adding labels such as costcenter=c23543, service=playlist, and environment=test to your VMs or GCS buckets it’s easy to understand, for example, where your resources are deployed, for what purpose and which cost center they should be charged to.
Here’s a list of all the things you can do with labels:
* Identify resources used by individual teams or cost centers (for example, team:research and team:analytics)
* Distinguish deployment environments (for example, env:prod and env:dev)
* Identify owners, state labels.
* Use for cost allocation and billing breakdowns.
* Monitor resource groups via Cloud Monitoring, which can use labels accessible in the resource metadata


## Using Labels to understand costs 

Information about labels is forwarded to the billing system, so you can break down your billed charges by label. When you enable the export of billing data to BigQuery, labels are exported to BigQuery with all corresponding GCP resources and their usage. This makes it easier for CIOs and managers to answer questions such as:
* What does the shopping cart service in my application cost to run?
* How much do I spend on developer test machines?

You can use BigQuery in combination with labels such as costcenter=c23543, service=playlist, and environment=test on your VMs or GCS buckets, to understand exactly what all test systems resources cost versus production resources, or how much the playlist service costs.

## Best practices for Labels

Refer [Best Practices for Labels](https://cloud.google.com/resource-manager/docs/best-practices-labels) on GCP

## Solutions to enforce Labels
It is highly recommended to have clear guidelines for labels naming conventions during the foundation phase. In addition to guidelines, using enforcement with automation can aid your teams in setting up templates to attach appropriate GCP labels to resources within your organization.

### Proactive Governance
Sometimes when creating a new resource like compute engine or storage, one can forget to add a label with the resources and then it is missing till accounting comes back asking about some expense on your billing. To avoid this, make sure labeling is part of the workflow to always apply labels when resources are being created and ensure it is done in an automated way. This ensures that labels are never missed for resources.
Refer [Proactive Governance solution](https://cloud.google.com/resource-manager/docs/best-practices-labels)

### Reactive Governance
If your enterprise is in the phase of running workloads on GCP and there are resources that are missing labels, use reactive governance. As a best practice, it is recommended to use reactive governance along with proactive governance to ensure all resources are labeled appropriately. To implement reactive governance, frequently scan the platform for constraint violations on labels and send notifications when a violation is found.

First part of the solution is reporting resources with missing labels. In future releases, we are going to provide solutions for alerting and programmatically enforcing labels. 

#### Reporting Architecture 
![architecture](img/cas-reactive-reporting-architecture.png)

The architecture is built using Google Cloud managed services - Cloud Scheduler,
Functions, Pub/Sub, BigQuery and Looker studio.

*   The solution is architected to scale using Pub/Sub.
*   Cloud Scheduler is used to trigger Cloud Functions. This is also an user
    interface to configure frequency, parent nodes etc.
*   Cloud Function is used to export list of organization assets into BigQuery table.
*   BigQuery is used to store data and create view with resources that do not have labels.
*   Easy to get started and deploy with Looker Studio Dashboard. In addition to
    Looker Studio, other visualization tools can be configured.
*   The Looker Studio report can be scheduled to be emailed to appropriate team
    for weekly/daily reporting.

### 1. Prerequisites

1.  Host Project - A project where the BigQuery instance, Cloud Function and
    Cloud Scheduler will be deployed. For example Project A.
2.  Target Node - The Organization or folder or project which will be scanned
    for Assets. For example Org A and Folder A.
3.  Project Owner role on host Project A. IAM Admin role in target Org A and
    target Folder A.
4.  Google Cloud SDK is installed. Detailed instructions to install the SDK
    [here](https://cloud.google.com/sdk/docs/install#mac). See the Getting Started
    page for an introduction to using gcloud and terraform.
5.  Terraform version >= 0.14.6 installed. Instructions to install terraform here
    *   Verify terraform version after installing.

    ```sh
    terraform -version
    ```

    The output should look like:

    ```sh
    Terraform v0.14.6
    + provider registry.terraform.io/hashicorp/google v3.57.0
    ```

    *Note - Minimum required version v0.14.6. Lower terraform versions may not work.*

### 2. Initial Setup

1.  In local workstation create a new directory to run terraform and store
    credential file

    ```sh
    mkdir <directory name like quota-monitoring-dashboard>
    cd <directory name>
    ```

2.  Set default project in config to host project A

    ```sh
    gcloud config set project <HOST_PROJECT_ID>
    ```

    The output should look like:

    ```sh
    Updated property [core/project].
    ```

3.  Ensure that the latest version of all installed components is installed on
    the local workstation.

    ```sh
    gcloud components update
    ```

4.  Cloud Scheduler depends on the App Engine application. Create an App Engine
    application in the host project. Replace the region. List of regions where
    App Engine is available can be found
    [here](https://cloud.google.com/about/locations#region).

    ```sh
    gcloud app create --region=<region>
    ```

    Note: Cloud Scheduler (below) needs to be in the same region as App Engine.
    Use the same region in terraform as mentioned here.

    The output should look like:

    ```sh
    You are creating an app for project [quota-monitoring-project-3].
    WARNING: Creating an App Engine application for a project is irreversible and the region
    cannot be changed. More information about regions is at
    <https://cloud.google.com/appengine/docs/locations>.

    Creating App Engine application in project [quota-monitoring-project-1] and region [us-east1]....done.

    Success! The app is now created. Please use `gcloud app deploy` to deploy your first app.
    ```

### 3. Create Service Account

1.  In local workstation, setup environment variables. Replace the name of the
    Service Account in the commands below

    ```sh
    export DEFAULT_PROJECT_ID=$(gcloud config get-value core/project 2> /dev/null)
    export SERVICE_ACCOUNT_ID="sa-"$DEFAULT_PROJECT_ID
    export DISPLAY_NAME="sa-"$DEFAULT_PROJECT_ID
    ```

2.  Verify host project Id.

    ```sh
    echo $DEFAULT_PROJECT_ID
    ```

3.  Create Service Account

    ```sh
    gcloud iam service-accounts create $SERVICE_ACCOUNT_ID --description="Service Account to deploy cost attribution solution and export assets" --display-name=$DISPLAY_NAME
    ```

    The output should look like:

    ```sh
    Created service account [sa-quota-monitoring-project-1].
    ```

### 4. Grant Roles to Service Account

#### 4.1 Grant Roles in the Host Project

The following roles need to be added to the Service Account in the host
project i.e. Project A:

*   BigQuery
    *   BigQuery Admin
*   Cloud Functions
    *   Cloud Functions Admin
*   Cloud Scheduler
    *   Cloud Scheduler Admin
*   Pub/Sub
    *   Pub/Sub Admin
*   Run Terraform
    *   Service Account User

1.  Run following commands to assign the roles:

    ```sh
    gcloud projects add-iam-policy-binding $DEFAULT_PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/bigquery.admin" --condition=None

    gcloud projects add-iam-policy-binding $DEFAULT_PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudfunctions.admin" --condition=None

    gcloud projects add-iam-policy-binding $DEFAULT_PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudscheduler.admin" --condition=None

    gcloud projects add-iam-policy-binding $DEFAULT_PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/pubsub.admin" --condition=None

    gcloud projects add-iam-policy-binding $DEFAULT_PROJECT_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser" --condition=None
    ```

#### 4.2 Grant Roles in the Target Organization

If you want to scan projects in the org, add following roles to the Service
Account created in the previous step at the Org A:

*   Cloud Asset Viewer

1.  Set target organization id

    ```sh
    export TARGET_ORG_ID=<target org id ex. 38659473572>
    ```

2.  Run the following commands to add to the roles to the service account

    ```sh
    gcloud organizations add-iam-policy-binding  $TARGET_ORG_ID --member="serviceAccount:$SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com" --role="roles/cloudasset.assets.searchAllResources" --condition=None
    ```

### 4.3 Download the Source Code

1.  Clone the Cost attribute Solution repo

    ```sh
    git clone https://github.com/google/quota-monitoring-solution.git quota-monitorings-solution
    ```

2.  Change directories into the Terraform example

    ```sh
    cd ./quota-monitorings-solution/terraform/module
    ```

### 4.4 Set OAuth Token Using Service Account Impersonization

Impersonate your host project service account and set environment variable
using temporary token to authenticate terraform. You will need to make
sure your user has the
[Service Account Token Creator role](https://cloud.google.com/iam/docs/service-account-permissions#token-creator-role)
to create short-lived credentials.

```sh
gcloud config set auth/impersonate_service_account \
    $SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com

export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)
```

*   **TIP**: If you get an error saying *unable to impersonate*, you will
    need to unset the impersonation. Have the role added similar to below, then
    try again.

    ```sh
    # unset impersonation
    gcloud config unset auth/impersonate_service_account

    # set your current authenticated user as var
    PROJECT_USER=$(gcloud config get-value core/account)

    # grant IAM role serviceAccountTokenCreator
    gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_ID@$DEFAULT_PROJECT_ID.iam.gserviceaccount.com \
        --member user:$PROJECT_USER \
        --role roles/iam.serviceAccountTokenCreator \
        --condition=None
    ```
    
## Configure Terraform

1.  Verify that you have these 3 files in your local directory:
    *   main.tf
    *   variables.tf
    *   terraform.tfvars

2.  Open [terraform.tfvars](terraform/example/terraform.tfvars) file in your
    favourite editor and change values for the variables.

    ```sh
    vi terraform.tfvars
    ```

3.  For `region`, use the same region as used for App Engine in earlier steps.

    The variables `source_code_base_url`, `cas_version`, `source_code_zip`
    on the QMS module are used to download
    the source for the CAS Cloud Functions from the latest GitHub [release](https://github.com/google/cost-attribution-solution/releases).

    To deploy the latest unreleased code from a local clone of the CAS
    repository, set `cas_version` to `main`

## Run Terraform

1.  Run terraform commands
    *   `terraform init`
    *   `terraform plan`
    *   `terraform apply`
        *   On Prompt Enter a value: `yes`

2.  This will:
    *   Enable required APIs
    *   Create all resources and connect them.

    Note: In case terraform fails, run terraform plan and terraform apply again

3.  Stop impersonating service account (when finished with terraform)

    ```sh
    gcloud config unset auth/impersonate_service_account
    ```

## Testing

1.  Initiate first job run in Cloud Scheduler.

    **Console**

    Click 'Force Run' on Cloud Job scheduler.

    *Note: The status of the ‘Run Now’ button changes to ‘Running’ for a fraction
    of seconds.*

    ![run-cloud-scheduler](img/cas-scheduler.png)

    **Terminal**

    ```sh
    gcloud scheduler jobs run cas-scheduler --location <region>
    ```

2.  To verify that the program ran successfully, check the BigQuery Table. The
    time to load data in BigQuery might take a few minutes. The execution time
    depends on the number of projects to scan. 

## Looker Studio Dashboard setup

1.  Go to the [Looker Studio dashboard template](https://lookerstudio.google.com/s/l2haE0mW5cc).
    A Looker Studio dashboard will look like this:
    ![ds-cas-reporting-dashboard](img/cas-dashboard.png)
2.  Make a copy of the template from the copy icon at the top bar (top - right
    corner)
3.  Click on ‘Copy Report’ button **without changing datasource options**
4.  This will create a copy of the report and open in Edit mode. If not click on
‘Edit’ button on top right corner in copied template
5.  Select any one table. On the
    right panel in ‘Data’ tab, click on icon ‘edit data source’
    It will open the data source details
6.  Replace the BigQuery with view created by the solutions.
7.  After making sure that query is returning results, replace it in the Data
    Studio, click on the ‘Reconnect’ button in the data source pane.
8.  In the next window, click on the ‘Done’ button.
9.  Once the data source is configured, click on the ‘View’ button on the top
    right corner.
    Note: make additional changes in the layout like which metrics to be displayed
    on Dashboard, color shades for consumption column, number of rows for each
    table etc in the ‘Edit’ mode.

## Scheduled Reporting

Cost Attribution reports can be scheduled from the Looker Studio dashboard using
‘Schedule email delivery’. The screenshot of the Looker Studio dashboard will be
delivered as a pdf report to the configured email Ids.


You should now receive alerts in your Slack channel whenever a quota reaches
the specified threshold limit.

## What is Next?

1.  Alerting for resources missing labels 
2.  Enforcing labels

## Getting Support

Cost Attribution Solution is a project based on open source contributions. We'd
love for you to [report issues, file feature requests][new-issue], and
[send pull requests][new-pr] (see [Contributing](README.md#7-contributing)). Quota
Monitoring Solution is not officially covered by the Google Cloud product support.

## Contributing

*   [Contributing guidelines][contributing-guidelines]
*   [Code of conduct][code-of-conduct]

<!-- LINKS: https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[code-of-conduct]: code-of-conduct.md
[contributing-guidelines]: CONTRIBUTING.md
[new-issue]: https://github.com/google/quota-monitoring-solution/issues/new
[new-pr]: https://github.com/google/quota-monitoring-solution/compare
