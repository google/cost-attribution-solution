/*
   Copyright 2025 Google LLC

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       https://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { Injectable } from "@angular/core";
import { Observable, delay, of } from "rxjs";
import { ConfigurationsService } from "../model/ConfigurationService";
import { Configurations, Response } from "../model/models";

@Injectable()
export class MockConfigurationsService implements ConfigurationsService {
  private readonly DELAY = 0.5 * 1000;

  constructor() {
    console.log(
      "Using MockBackendService, use --configuration production to use server.",
    );
  }

  assetTypes(): Observable<string[]> {
    return of([
      "compute.googleapis.com/Instance",
      "storage.googleapis.com/Bucket",
      "bigquery.googleapis.com/Table",
      "bigquery.googleapis.com/Dataset",
      "sqladmin.googleapis.com/Instance",
      "cloudresourcemanager.googleapis.com/Folder",
      "cloudresourcemanager.googleapis.com/Organization",
      "cloudresourcemanager.googleapis.com/Project",
      "run.googleapis.com/Service",
      "container.googleapis.com/Cluster",
      "compute.googleapis.com/Network",
      "compute.googleapis.com/Subnetwork",
    ]).pipe(delay(this.DELAY));
  }

  fetchConfigurations(): Observable<Configurations> {
    return of({
      asset_types: [
        "compute.googleapis.com/Instance",
        "storage.googleapis.com/Bucket",
        "compute.googleapis.com/Network",
      ],

      report_urls: {
        missing_attribution:
          "https://lookerstudio.google.com/embed/reporting/e4cd9ef5-dfb0-4dd2-8332-e8ebbe980299/page/6zXD",
        billing:
          "https://lookerstudio.google.com/embed/reporting/e4cd9ef5-dfb0-4dd2-8332-e8ebbe980299/page/p_nk4rm2e9pd",
      },
    }).pipe(delay(this.DELAY));
  }

  saveConfigurations(_: Configurations): Observable<Response> {
    return of({
      detail: "OK",
    }).pipe(delay(this.DELAY));
  }
}
