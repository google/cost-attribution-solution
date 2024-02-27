/*
Copyright 2024 Google LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

package functions;

import com.google.cloud.functions.CloudEventsFunction;
import com.google.events.cloud.pubsub.v1.Message;
import com.google.events.cloud.pubsub.v1.MessagePublishedData;
import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.cloudevents.CloudEvent;
import java.util.Base64;
import java.util.logging.Logger;

public class CasAlert implements CloudEventsFunction {
  private static final Logger logger = Logger.getLogger(CasAlert.class.getName());

  @Override
  public void accept(CloudEvent event) {
    // Get cloud event data as JSON string
    String cloudEventData = new String(event.getData().toBytes());
    // Decode JSON event data to the Pub/Sub MessagePublishedData type
    Gson gson = new Gson();
    MessagePublishedData data = gson.fromJson(cloudEventData, MessagePublishedData.class);
    // Get the message from the data
    Message message = data.getMessage();
    // Get the base64-encoded data from the message & decode it
    String encodedData = message.getData();
    String decodedData = new String(Base64.getDecoder().decode(encodedData));
    // Log the json message with complete detail of the resource
    logger.info("Pub/Sub message: " + decodedData);
    // Parse Json
    JsonElement jsonElement = JsonParser.parseString(decodedData);
    JsonObject asset = jsonElement.getAsJsonObject()
        .getAsJsonObject("asset");
    JsonObject resource = asset.getAsJsonObject("resource");
    JsonObject labels = resource
        .getAsJsonObject("data")
        .getAsJsonObject("labels");
    // Log Resource and labels info
    logger.info("Asset Type: "+ asset.get("assetType") );
    logger.info("Name: "+asset.get("name"));
    logger.info("Parent: "+resource.get("parent"));
    logger.info("Labels count: "+ ((labels == null) ? 0: labels.size()));
    // Log if resource is missing label
    if(labels == null){
      logger.info("Resource with missing Label - Name: "+asset.get("name")+" | Asset Type: "+asset.get("assetType")+" | Parent: "+resource.get("parent"));
    }
  }
}

