# Installing

This document outlines the steps required to install and deploy the application.

## Pre-requisites

Before proceeding with the installation, ensure you have the following prerequisites in place:

-   **Docker:** Docker is required to build the container images.
-   **Terraform:** Terraform is needed to deploy the infrastructure.
-   **gcloud CLI:** The Google Cloud SDK (`gcloud`) must be installed and authenticated.
-   **Google Cloud Project:** A Google Cloud Project where the solution will be deployed.
-   **Domain Name:** A registered domain name with the ability to modify DNS settings.
-   **IAM Roles:** The authenticated user must have the following IAM roles assigned:
    -   `roles/xxxx`
    -   `roles/yyyy`

## Deploy

Follow these steps to deploy the application:

1.  **Configure Terraform Variables:**
    -   Navigate to the `terraform` directory.
    -   Fill in the `terraform.tfvars` file with your project-specific values:

    ```terraform
    organization_id              = "XXXXXXXXXXX" # ""   //update (leave empty if scanning only host project)  
    project_id                   = "my-project-id" 
    region                       = "us-central1"
    domain                       = "cas.mydomain.com"
    lb_name                      = "cas-fe"
    support_email_address        = "myuser@domain.com"
    iap_members                  =  [
                                    "user:myuser@domain.com", # user and/or groups which will have access to the solution
                                    "group:mygroup@domain.com",
                                    ]
    ```

2.  **Build and Push Backend Docker Image:**
    -   Navigate to the `backend` directory.
    -   Build the Docker image:

    ```bash
    cd backend
    docker build -t gcr.io/${YOUR_PROJECT_ID}/tag-automator-backend:latest .
    docker push gcr.io/${YOUR_PROJECT_ID}/tag-automator-backend:latest
    ```

3.  **Build and Push Frontend Docker Image:**
    -   Navigate to the `frontend` directory.
    -   Build the Docker image:

    ```bash
    cd frontend
    docker build -t gcr.io/${YOUR_PROJECT_ID}/tag-automator-frontend:latest . 
    docker push gcr.io/${YOUR_PROJECT_ID}/tag-automator-frontend:latest
    ```

4.  **Deploy with Terraform:**
    -   Navigate to the `terraform` directory.
    -   Initialize Terraform:

    ```bash
    cd terraform
    terraform init
    ```

    -   Review the planned changes:

    ```bash
    terraform plan
    ```

    -   Apply the changes:

    ```bash
    terraform apply
    ```

5.  **Note Load Balancer IP:**
    -   After the Terraform apply command completes, note the IP address of the load balancer. You will need this for the post-deployment DNS configuration.

## Post-deployment

After the deployment is complete, follow these steps:

1.  **Configure DNS Records:**
    -   Update the DNS records for your domain name to point to the load balancer's IP address.
    -   Create an "A" record for your subdomain (e.g., `cas.mydomain.com`) pointing to the load balancer's IPv4 address.
    -   Allow 10-30 minutes for the DNS changes to propagate and the load balancer to become active.

### Troubleshooting

**Error: Error creating Brand: googleapi: Error 409: Requested entity already exists**

This error indicates that the IAP Brand already exists in your project. To resolve this:

1.  **Retrieve the Brand Number:**
    -   Run the following command, replacing `${YOUR_PROJECT_ID}` with your project ID:

    ```bash
    gcloud iap oauth-brands list --project ${YOUR_PROJECT_ID}
    ```

    -   Note the `BRAND_NUM` from the output.

2.  **Import the Existing Brand into Terraform State:**
    -   Since this resource cannot be modified via terraform, you must import the existing brand into the terraform state.
    -   Run the following command, replacing `${YOUR_PROJECT_ID}` and `${BRAND_NUM}` with the appropriate values:

    ```bash
    terraform import google_iap_brand.project_brand projects/${YOUR_PROJECT_ID}/brands/${BRAND_NUM}
    ```

    -   This will align your Terraform state with the existing resource
