import com.google.cloud.functions.CloudEventsFunction;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.cloudevents.CloudEvent;
import java.nio.charset.StandardCharsets;

import com.google.common.collect.ImmutableMap;

public class SimpleLabelCheck implements CloudEventsFunction {
  private static final Logger logger = Logger.getLogger(SimpleLabelCheck.class.getName());

  // TODO read from proactive-governance/policy/labels.yaml
  private static final String[] MANDATORY_LABELS = {

  }

  @Override
  public void accept(CloudEvent event) {
    if (event.getData() == null) return;

    logger.info("Event Type: " + event.getType());

    String cloudEventData = new String(event.getData().toBytes(), StandardCharsets.UTF_8);

    Gson gson = new Gson();
    JsonObject eventData = gson.fromJson(cloudEventData, JsonObject.class);

    // https://cloud.google.com/logging/docs/audit#audit_log_entry_structure
    JsonObject payload = eventData.getAsJsonObject("protoPayload");
    JsonObject resource = payload.getAsJsonObject("resource");

    // TODO check label against mandatory labels


  }
}
