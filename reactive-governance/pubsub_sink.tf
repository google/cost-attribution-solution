resource "google_pubsub_topic" "cattr-log-topic" {
  name = "cattr-log-topic"
  labels = { }
}

resource "google_logging_project_sink" "cattr-log-sink" {
  name = "cattr-log-sink"
  destination = "pubsub.googleapis.com/projects/cattr-reactive-governance/topics/cattr-log-sink"
  filter = 'log_id("cloudaudit.googleapis.com/activity") AND (protoPayload.methodName =~ ".*\.insert$" OR protoPayload.methodName =~ ".*\.create$")'
}

resource "google_monitoring_notification_channel" "email0" {
  display_name = "Oncall"
  type         = "email"
  #depends_on   = [module.project-services]
  labels = {
    email_address = var.notification_email_address
  }
}
