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

import { Injectable } from "@angular/core";
import { Observable, delay, of } from "rxjs";
import { LabelService } from "../model/LabelService";
import {
  Binding,
  BulkResponse,
  ResourceLabels,
  Response,
  UploadResponse,
} from "../model/models";

@Injectable()
export class MockLabelService implements LabelService {
  private readonly DELAY = 0.5 * 1000;

  constructor() {
    console.log(
      "Using MockBackendService, use --configuration production to use server.",
    );
  }

  fetchResources(): Observable<ResourceLabels[]> {
    return of([
      {
        id: "//cloudresourcemanager.googleapis.com/projects/tag-automator-app",
        location: "global",
        name: "tag-automator-app",
        labels: [
          {
            id: "key321",
            value: "value321",
          },
          {
            id: "key123",
            value: "value123",
          },
        ],
        type: "cloudresourcemanager.googleapis.com/Project",
      },
    ]).pipe(delay(this.DELAY));
  }

  updateResourceLabels(): Observable<Response> {
    return of({
      detail: "success!",
    }).pipe(delay(this.DELAY));
  }

  addLabelsToResources(
    resources: { id: string; location: string }[],
    labels: Binding[],
  ): Observable<BulkResponse> {
    return of({ detail: "success!", errors: [] }).pipe(delay(this.DELAY));
  }

  removeLabelsFromResources(
    resources: { id: string; location: string }[],
    labels: string[],
  ): Observable<BulkResponse> {
    return of({ detail: "success!", errors: [] }).pipe(delay(this.DELAY));
  }

  uploadCSV(file: File, clean_labels: boolean): Observable<UploadResponse> {
    return of({
      project: {
        success: true,
        value: {
          key123: "value123",
        },
      },
    }).pipe(delay(this.DELAY));
  }
}
