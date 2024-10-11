# GCP Labels for Enterprises
> This repository consists solutions and tools to effectively use labels for managing Google Cloud 
> resources at scale.

Do you run or administer applications on Google Cloud? Do you want to identify costs for individuals 
or application teams on Google Cloud? Do you want to automate billing for the enterprise with hundreds 
and thousands of employees using Google Cloud? If your answer is yes, this repository is for you. Google 
Cloud provides Labels to help enterprises identify and manage costs. Labels are a powerful tool to track 
your GCP usage and resources at scale, and with the granularity you need. 

## What are Labels?
[Labels](https://cloud.google.com/resource-manager/docs/creating-managing-labels) are key-value pairs 
that are supported by a number of GCP resources. You can attach a label to each resource, then filter the 
resources based on their labels. Labels provide a convenient way for developers and administrators to 
organize resources at scale. 

## Using labels to understand costs
Information about labels is forwarded to the billing system, so you can
[break down your billed charges](https://cloud.google.com/billing/docs/how-to/bq-examples) by label. 
When you enable the [export of billing data](https://cloud.google.com/billing/docs/how-to/export-data-bigquery) 
to [BigQuery](https://cloud.google.com/bigquery/), labels are exported to BigQuery with all corresponding 
GCP resources and their usage. This makes it easier for CIOs and managers to answer questions such as:
*   What does the shopping cart service in my application cost to run?
*   How much do I spend on developer test machines?

## Enforce labels: proactive and reactive governance
It is highly recommended to enforce labels and make sure each resource is labelled appropriately. Use 
proactive and reactive governance strategies with tools to enforce labels. Create a list of standard 
labels that have to be set to each resource and with proactive governance, ensure all newly created 
resources have this set of labels. You can use a streamlined pipeline to create a resource. Another 
approach is to have a tools in place that checks for mandatory labels and informs you or even shuts 
down the resources until labels are set as reactive governance on labels. 

This repository provides tools 
for [Proactive](https://github.com/google/cost-attribution-solution/tree/main/proactive-governance/) and
[Reactive](https://github.com/google/cost-attribution-solution/tree/main/reactive-governance/) governance 
of labels.  

