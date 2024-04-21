# Proactive governance: Terraform Validator
Automate label creation using centralized CI/CD pipeline and enforce labels using 
[Terraform Policy Validation](https://cloud.google.com/docs/terraform/policy-validation). Terraform 
policy validator automates and ensures that you never miss GCP labels on the resource while provisioning 
it. You can take labeling input while each resource gets provisioned using Terraform and CI/CD pipeline.

Businesses are shifting towards infrastructure-as-code, and with that change comes a concern that 
configuration errors can cause security and governance violations. To address this, security and cloud 
administrators need to be able to set up guardrails that make sure everyone in their organization follows 
security best practices. These guardrails are in the form of *constraints*.

Constraints define your organization's source of truth for security and governance requirements. 
The constraints must be compatible with tools across every stage of the application lifecycle, from 
development, to deployment, and even to an audit of deployed resources.

## One way to define constraints

Constraints are defined so that they can work across an ecosystem of pre-deployment and monitoring tools. 
These constraints live in your organization's repository as the source of truth for your security and 
governance requirements. You can obtain constraints from the Policy Library, or build your own constraint 
templates.

## Pre-deployment check

Check for constraint violations during pre-deployment and provide warnings or halt invalid deployments 
before they reach production. 

## Integrate Terraform Policy Validator
Follow these steps to integrate validator with your CI/CD pipeline. These constraint will enforce labeling 
resources during provisioning. If resources are not validated as per the guidelines configured in the 
labels.yaml file, deployment using terraform will fail.
1. Go to Cloud Shell and clone the policy library.
    ```sh
    git clone https://github.com/GoogleCloudPlatform/policy-library.git
    ```
2. Copy the sample Enforce Labels constraint into the policies/constraints directory.
    ```sh
    cp samples/enforce_label.yaml policies/constraints/enforce_label.yaml
    ```
3. Update enforce labels constraint with a sample constraint provided with this repository file 
[enforce_label.yaml](/policies/constraints/enforce_label.yaml)
This sample is based on the [Best Practices for Labels](https://cloud.google.com/resource-manager/docs/best-practices-labels#example_labels_table) on GCP.
4. To verify that the policy works as expected, create the following Terraform main.tf file in the 
current directory and copy contents with the sample [main.tf](/proactive-governance/main.tf) provided 
with this repository  
   ```sh
    vi main.tf
    ``` 
5. Initialize Terraform and generate a Terraform plan using the following:
    ```sh
    terraform init
    ```
6. Export the Terraform plan, if asked, click Authorize when prompted:
    ```sh
    terraform plan -out=test.tfplan
    ```
7. Convert the Terraform plan to JSON:
    ```sh
    terraform show -json ./test.tfplan > ./tfplan.json
    ```
8. Install the terraform-tools component:
    ```sh
    sudo apt-get install google-cloud-sdk-terraform-tools
    ```
9. Enter the following command to validate that your Terraform plan complies with your policies:
    ```sh
    gcloud beta terraform vet tfplan.json --policy-library=. --format=json
    ```
    Since the labels are not applied to the resource, the plan violates the constraint you set up and 
     throws error.
10. Now apply label on the resource in the main.tf 
    ```sh
    resource "google_compute_instance" "default" {
      name         = "my-instance"
      machine_type = "n2-standard-2"
      zone         = "us-central1-a"

      tags = ["foo", "bar"]
      labels ={
        altostrat-environment = "dev"
        altostrat-data-classification = "na"
        altostrat-cost-center = "it-jp"
        altostrat-team = "shopping-cart"
        altostrat-component = "frontend"
        altostrat-app = "shopping-cart-payment"
        altostrat-compliance = "pci"
    }
    ...
    ```
11. Now validate your Terraform plan again, and this should result in no violations found:
    ```sh
    gcloud beta terraform vet tfplan.json --policy-library=. --format=json
    ```
    Expected output:
    ```sh
    []
    ```
    
>Note: In this sample use case, only non-compliant projects, buckets and VMs would be flagged. Read 
instructions and update resource list to be scanned for labels in policies/constraints/enforce_label.yaml. 
Also, update replace 'alostrat' with your organization name and label keys/values as per your labeling strategy. 

## CI/CD Example
A bash script for using gcloud beta terraform vet in a CI/CD pipeline might look like this 
[CI/CD example](https://cloud.google.com/docs/terraform/policy-validation/validate-policies#cicd_example).











