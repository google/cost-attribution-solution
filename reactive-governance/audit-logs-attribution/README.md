1. Prerequisites
Host Project: A Google Cloud project where the solution's resources will be deployed.

Target Node: The Organization, folder, or project that will be scanned for assets.

Permissions: Your user account must have the Owner role on the host project to perform the initial setup.

Google Cloud SDK: The gcloud command-line tool must be installed and authenticated. Detailed instructions can be found here.

Terraform: Terraform version >= 0.14.6 must be installed. Instructions can be found here.

Verify your Terraform version after installing:

terraform -version

2. Initial Project Setup
These steps prepare your project and local environment for deployment. Run these commands from your terminal.

Step 2.1: Set Project Configuration
Replace <YOUR_PROJECT_ID> with your actual Google Cloud project ID.

export PROJECT_ID="<YOUR_PROJECT_ID>"
gcloud config set project $PROJECT_ID

The output should be: Updated property [core/project].

Step 2.2: Ensure SDK Components are Updated
This ensures you have the latest gcloud components.

gcloud components update

Step 2.3: Proactively Enable All Required APIs
This critical step enables every service the solution depends on, preventing API-related errors during the Terraform deployment.

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

3. Service Account and Permission Setup
This is the most critical phase. These commands create the necessary service accounts and assign all the required permissions before you run Terraform.

Important: Ensure you are running as your own user, not impersonating another account.

gcloud config unset auth/impersonate_service_account

Step 3.1: Create the Deployment Service Account
This account will be impersonated by Terraform to create all other resources.

# Set environment variables for the new service account
export DEPLOYMENT_SA_ID="sa-"$PROJECT_ID
export DEPLOYMENT_SA_EMAIL="$DEPLOYMENT_SA_ID@$PROJECT_ID.iam.gserviceaccount.com"

# Create the service account
gcloud iam service-accounts create $DEPLOYMENT_SA_ID \
    --display-name="Terraform Deployment SA" \
    --project=$PROJECT_ID

Step 3.2: Grant Permissions to the Deployment Service Account
This account needs a comprehensive set of roles to manage all the different services in the solution.

# Define the list of roles
export SA_ROLES="roles/bigquery.admin roles/cloudfunctions.admin roles/cloudscheduler.admin roles/pubsub.admin roles/iam.serviceAccountUser roles/iam.serviceAccountAdmin roles/iam.serviceAccountCreator roles/resourcemanager.projectIamAdmin roles/serviceusage.serviceUsageAdmin roles/monitoring.notificationChannelEditor roles/monitoring.alertPolicyEditor roles/logging.configWriter roles/logging.logWriter roles/monitoring.viewer roles/monitoring.metricWriter roles/cloudasset.owner roles/storage.admin"

# Apply the roles in a loop
for role in $SA_ROLES; do
  echo "Assigning $role to $DEPLOYMENT_SA_EMAIL"
  gcloud projects add-iam-policy-binding $PROJECT_ID \
      --member="serviceAccount:$DEPLOYMENT_SA_EMAIL" \
      --role=$role \
      --condition=None
done

Step 3.3: Grant Permissions to Google-Managed Service Accounts
This key step fixes the persistent build failures by giving Google's own service accounts the permissions they need.

# Get the project number
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Define the Google-managed service accounts
export CLOUD_BUILD_SA="serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"
export COMPUTE_SA="serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# Grant roles for building and deploying the function
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$CLOUD_BUILD_SA --role="roles/run.admin"
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$CLOUD_BUILD_SA --role="roles/cloudfunctions.developer"

# Grant roles for build process tasks
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$COMPUTE_SA --role="roles/logging.logWriter"
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$COMPUTE_SA --role="roles/storage.objectViewer"
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$COMPUTE_SA --role="roles/artifactregistry.reader"
gcloud projects add-iam-policy-binding $PROJECT_ID --member=$COMPUTE_SA --role="roles/artifactregistry.writer"

Step 3.4: Grant Your User Permission to Impersonate
Your own user account needs the Service Account Token Creator role to act as the deployment service account.

export PROJECT_USER=$(gcloud config get-value core/account)
gcloud iam service-accounts add-iam-policy-binding $DEPLOYMENT_SA_EMAIL \
    --member="user:$PROJECT_USER" \
    --role="roles/iam.serviceAccountTokenCreator"

4. Terraform Deployment
Now you are ready to deploy the infrastructure.

Download Source Code and Configure

git clone https://github.com/google/cost-attribution-solution.git
cd cost-attribution-solution/reactive-governance/audit-logs-attribution

# Create your variables file from the example
cp terraform.tfvars.example terraform.tfvars

Now, open terraform.tfvars in a text editor and ensure the project_id and other variables are correct for your new environment.

Initialize Terraform
This prepares your local directory for the deployment.

terraform init

Set Impersonation and Generate Token
These commands tell Terraform to authenticate as the deployment service account.

gcloud config set auth/impersonate_service_account $DEPLOYMENT_SA_EMAIL
export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)

Apply Terraform Configuration
This command will build and deploy all the resources defined in your .tf files.

terraform apply

When prompted, type yes to approve the plan.

Stop Impersonating
After the deployment is finished, it's a best practice to return to your user account.

gcloud config unset auth/impersonate_service_account

Your solution is now fully deployed and operational.