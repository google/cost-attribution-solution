/*
   Copyright 2024 Google LLC

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
import { LabelService } from "../model/LabelService";
import {
  Binding,
  BulkResponse,
  ResourceLabels,
  Response,
} from "../model/models";
import { SERVICE_CONFIG } from "../model/values";

@Injectable()
export class LabelBackendService implements LabelService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = inject(SERVICE_CONFIG).apiUrl;
  }

  fetchResources(): Observable<ResourceLabels[]> {
    return this.http.get<Array<ResourceLabels>>(this.apiUrl + `/resources`, {
      params: { type: "labels" },
    });
  }

  updateResourceLabels(
    id: string,
    location: string,
    labels: Binding[],
  ): Observable<Response> {
    return this.http.patch<Response>(this.apiUrl + "/resources/labels", {
      id,
      location,
      labels,
    });
  }

  addLabelsToResources(
    resources: { id: string; location: string }[],
    labels: Binding[],
  ): Observable<BulkResponse> {
    return this.http.post<BulkResponse>(this.apiUrl + "/resources/labels", {
      resources,
      labels,
    });
  }

  removeLabelsFromResources(
    resources: { id: string; location: string }[],
    labels: Binding[],
  ): Observable<BulkResponse> {
    return this.http.delete<BulkResponse>(this.apiUrl + "/resources/labels", {
      body: {
        resources,
        labels,
      },
    });
  }
}
