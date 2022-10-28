# GCP Labels for Enterprises
> This repository consists solutions and tools to effectively use labels for managing Google Cloud resources at scale.

Do you run or administer applications on Google Cloud? Do you want to identify costs for individuals or application teams on Google Cloud? Do you want to automate billing for the enterprise with hundreds and thousands of employees using Google Cloud? If your answer is yes, this repository is for you. Google Cloud provides Labels to help enterprises identify and manage costs. Labels are a powerful tool to track your GCP usage and resources at scale, and with the granularity you need. 

## What are Labels?
[Labels](https://cloud.google.com/resource-manager/docs/creating-managing-labels) are key-value pairs that are supported by a number of GCP resources. You can attach a label to each resource, then filter the resources based on their labels. Labels provide a convenient way for developers and administrators to organize resources at scale. 

## Using labels to understand costs
Information about labels is forwarded to the billing system, so you can [break down your billed charges](https://cloud.google.com/billing/docs/how-to/bq-examples) by label. When you enable the [export of billing data](https://cloud.google.com/billing/docs/how-to/export-data-bigquery) to [BigQuery](https://cloud.google.com/bigquery/), labels are exported to BigQuery with all corresponding GCP resources and their usage. This makes it easier for CIOs and managers to answer questions such as:
*   What does the shopping cart service in my application cost to run?
*   How much do I spend on developer test machines?

## Enforce labels: proactive and reactive governance
It is highly recommended to enforce labels and make sure each resource is labelled appropriately. Use proactive and reactive governance strategies with tools to enforce labels. Create a list of standard labels that have to be set to each resource and with proactive governance, ensure all newly created resources have this set of labels. You can use a streamlined pipeline to create a resource. Another approach is to have a script that checks for mandatory labels and informs you or even shuts down the resources until labels are set as reactive governance on labels. 

## Proactive governance: Terraform Validator
Automate label creation using centralized CI/CD pipeline and enforce labels using [Terraform validator](https://github.com/GoogleCloudPlatform/terraform-validator). Terraform validator automates and ensures that you never miss GCP labels on the resource while provisioning it. You can take labeling input while each resource gets provisioned using Terraform and CI/CD pipeline.

As your business shifts towards an infrastructure-as-code workflow, security and cloud administrators are concerned about misconfigurations that may cause security and governance violations.

Cloud Administrators need to be able to put up guardrails that follow security best practices and help drive the environment towards programmatic security and governance while enabling developers to go fast.

Config Validator allows your administrators to enforce constraints that validate whether deployments can be provisioned while still enabling developers to move quickly within these safe guardrails. Validator accomplishes this through a two key components:

### One way to define constraints

Constraints are defined so that they can work across an ecosystem of pre-deployment and monitoring tools. These constraints live in your organization's repository as the source of truth for your security and governance requirements. You can obtain constraints from the Policy Library, or build your own constraint templates.

### Pre-deployment check

Check for constraint violations during pre-deployment and provide warnings or halt invalid deployments before they reach production. The pre-deployment logic that Config Validator uses will be built into a number of deployment tools. For details, check out Terraform Validator.

### Terraform validator template for labels
Follow these steps to integrate validator with your CI/CD pipeline. These contrains will enforce labeling resources during provisioning. If resources are not validated as per the guidelines configured in the labels.yaml file, deployment using terraform will fail. 
*   Follow these [instructions](https://github.com/GoogleCloudPlatform/policy-library/blob/master/docs/user_guide.md) to :
    *   Setup policy library in delivery/policy.
    *   Install terraform validator
*   Copy proactive-goverance/policy/lables.yaml file to policy/policy-library/constraints.
*   Use following steps to run the validation check :
    *   terraform plan -out=<filename>.tfplan - To generate the state which needs to be verified.
    *   terraform show -json <filename>.tfplan > <filename>.json - To convert the state file to json.
    *   ./<path of terraform validator>terraform-validator validate --policy-path=<policy-folder-path> <filename>.json - To validate the json file against validator.

