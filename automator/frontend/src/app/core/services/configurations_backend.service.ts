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

import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { ConfigurationsService } from "../model/ConfigurationService";
import { Configurations, LabelPolicy, Response } from "../model/models";
import { SERVICE_CONFIG } from "../model/values";

@Injectable()
export class ConfigurationsBackendService implements ConfigurationsService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = inject(SERVICE_CONFIG).apiUrl;
  }

  assetTypes(): Observable<string[]> {
    return this.http.get<Array<string>>(this.apiUrl + "/asset_types");
  }

  fetchConfigurations(): Observable<Configurations> {
    return this.http.get<Configurations>(this.apiUrl + "/configurations");
  }

  saveConfigurations(configurations: Configurations): Observable<Response> {
    return this.http.post<Response>(
      this.apiUrl + "/configurations",
      configurations,
    );
  }

  fetchLabelPolicies(): Observable<LabelPolicy> {
    return this.http.get<LabelPolicy>(
      this.apiUrl + "/configurations/policy/label",
    );
  }

  updateLabelPolicies(policy: LabelPolicy): Observable<void> {
    return this.http.post<void>(
      this.apiUrl + "/configurations/policy/label",
      policy,
    );
  }

  deleteLabelPolicies(policy_key: string): Observable<void> {
    return this.http.delete<void>(
      this.apiUrl + "/configurations/policy/label/" + policy_key,
    );
  }
}
