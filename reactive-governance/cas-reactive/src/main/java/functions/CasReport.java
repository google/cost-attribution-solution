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

import com.google.cloud.asset.v1.AssetServiceClient;
import com.google.cloud.asset.v1.BigQueryDestination;
import com.google.cloud.asset.v1.ContentType;
import com.google.cloud.asset.v1.ExportAssetsRequest;
import com.google.cloud.asset.v1.ExportAssetsResponse;
import com.google.cloud.asset.v1.OrganizationName;
import com.google.cloud.asset.v1.OutputConfig;
import com.google.cloud.asset.v1.ProjectName;
import com.google.cloud.functions.CloudEventsFunction;
import io.cloudevents.CloudEvent;
import java.io.IOException;
import java.util.Arrays;
import java.util.concurrent.ExecutionException;
import java.util.logging.Logger;

/**
 * Export organization assets to BigQuery table
 */
public class CasReport implements CloudEventsFunction {
  private static final String PROJECT_ID = System.getenv("PROJECT_ID");
  private static final String BIGQUERY_DATASET = System.getenv("BIGQUERY_DATASET");
  private static final String BIGQUERY_TABLE = System.getenv("BIGQUERY_TABLE");
  private static final String PARENT = System.getenv("PARENT");
  private static final Logger logger = Logger.getLogger(CasReport.class.getName());

  /**
   * API to export organization assets to BigQuery table
   * @param event
   */
  public void accept(CloudEvent event) {
    logger.info("Asset export start");
    try {
      AssetServiceClient client = AssetServiceClient.create();
     
      String parentId = "";
     //If org id is provided, scan all projects in the org or scan host project
      if(PARENT != null && !PARENT.trim().isEmpty()){
        parentId = OrganizationName.of(PARENT).toString();
      } else {
        parentId  = ProjectName.of(PROJECT_ID).toString();
      } 

      OutputConfig outputConfig =
          OutputConfig.newBuilder()
              .setBigqueryDestination(
                  BigQueryDestination.newBuilder()
                      .setDataset("projects/"+PROJECT_ID+"/datasets/"+BIGQUERY_DATASET)
                      .setTable(BIGQUERY_TABLE)
                      .setForce(true)
                      .build())
              .build();

      ExportAssetsRequest.Builder exportAssetsRequestBuilder = ExportAssetsRequest.newBuilder()
          .setParent(parentId).setContentType(ContentType.RESOURCE).setOutputConfig(outputConfig);

      ExportAssetsRequest request = exportAssetsRequestBuilder.build();
      ExportAssetsResponse response = client.exportAssetsAsync(request).get();
      logger.info(response.toString());
      logger.info("Asset export complete");
    } catch (IOException | InterruptedException | ExecutionException e) {
      logger.severe(Arrays.toString(e.getStackTrace()));
    }
  }

}
