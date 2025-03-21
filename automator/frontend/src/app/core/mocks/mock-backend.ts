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
import { TagService } from "../model/TagService";
import {
  BulkResponse,
  Resource,
  Response,
  Tag,
  TagBinding,
} from "../model/models";

@Injectable()
export class MockBackendService implements TagService {
  private readonly DELAY = 0.5 * 1000;

  constructor() {
    console.log(
      "Using MockBackendService, use --configuration production to use server.",
    );
  }

  deleteTag(key: string): Observable<Response> {
    return of({
      message: "success!",
    }).pipe(delay(this.DELAY));
  }

  editTag(key: string, values: string[]): Observable<Response> {
    return of({
      message: "success!",
    }).pipe(delay(this.DELAY));
  }

  addTag(name: string, description: string): Observable<{ key: string }> {
    return of({ key: "abc123", errors: [] }).pipe(delay(this.DELAY));
  }

  fetchResources(): Observable<Resource[]> {
    return of([
      {
        id: "//compute.googleapis.com/projects/tag-automator-app/zones/southamerica-east1-a/instances/8355509907069725591",
        location: "southamerica-east1-a",
        name: "gke-cluster-1-default-pool-164e1eea-hxjr",
        tags: [],
        type: "compute.googleapis.com/Instance",
      },
      {
        id: "//run.googleapis.com/projects/tag-automator-app/locations/us-central1/services/hello",
        location: "us-central1",
        name: "hello",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281483840234079",
          },
          {
            id: "tagKeys/281484915300179",
            value: "tagValues/281483040599450",
          },
        ],
        type: "run.googleapis.com/Service",
      },
      {
        id: "//container.googleapis.com/projects/tag-automator-app/locations/southamerica-east1-a/clusters/cluster-1",
        location: "southamerica-east1-a",
        name: "cluster-1",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281484755593939",
          },
        ],
        type: "container.googleapis.com/Cluster",
      },
      {
        id: "//sqladmin.googleapis.com/projects/tag-automator-app/instances/test",
        location: "us-east1",
        name: "test",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281483840234079",
          },
        ],
        type: "sqladmin.googleapis.com/Instance",
      },
      {
        id: "//compute.googleapis.com/projects/tag-automator-app/zones/southamerica-east1-b/instances/7732211548561519133",
        location: "southamerica-east1-b",
        name: "sample-vm-1",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281482523434374",
          },
          {
            id: "tagKeys/281484915300179",
            value: "tagValues/281483040599450",
          },
        ],
        type: "compute.googleapis.com/Instance",
      },
      {
        id: "//compute.googleapis.com/projects/tag-automator-app/regions/southamerica-east1/subnetworks/4790392300669678196",
        location: "southamerica-east1",
        name: "sb-tags",
        tags: [
          {
            id: "tagKeys/281484915300179",
            value: "tagValues/281483020437286",
          },
        ],
        type: "compute.googleapis.com/Subnetwork",
      },
      {
        id: "//compute.googleapis.com/projects/tag-automator-app/global/networks/3999054789813908075",
        location: "global",
        name: "vpc-tags",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281483840234079",
          },
        ],
        type: "compute.googleapis.com/Network",
      },
      {
        id: "//storage.googleapis.com/projects/_/buckets/tag-automator-app.appspot.com",
        location: "us-east1",
        name: "tag-automator-app.appspot.com",
        tags: [],
        type: "storage.googleapis.com/Bucket",
      },
      {
        id: "//cloudresourcemanager.googleapis.com/projects/tag-automator-app",
        location: "global",
        name: "tag-automator-app",
        tags: [
          {
            id: "tagKeys/281480339478982",
            value: "tagValues/281484755593939",
          },
        ],
        type: "cloudresourcemanager.googleapis.com/Project",
      },
    ]).pipe(delay(this.DELAY));
  }

  fetchTags(): Observable<Tag[]> {
    return of([
      {
        key: {
          id: "tagKeys/281480339478982",
          value: "Tag Teste",
        },
        values: [
          {
            id: "tagValues/281482523434374",
            value: "Valor C",
          },
          {
            id: "tagValues/281483840234079",
            value: "Valor B",
          },
          {
            id: "tagValues/281484755593939",
            value: "Valor A",
          },
        ],
      },
      {
        key: {
          id: "tagKeys/281484915300179",
          value: "UnidadeDeNegocio",
        },
        values: [
          {
            id: "tagValues/281483020437286",
            value: "digital",
          },
          {
            id: "tagValues/281483040599450",
            value: "concierge",
          },
          {
            id: "tagValues/281483182417574",
            value: "corp",
          },
        ],
      },
    ]).pipe(delay(this.DELAY));
  }

  updateResourceTags(): Observable<Response> {
    return of({
      message: "success!",
    }).pipe(delay(this.DELAY));
  }

  addTagsToResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse> {
    return of({ message: "success!", errors: [] }).pipe(delay(this.DELAY));
  }

  removeTagsFromResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse> {
    return of({ message: "success!", errors: [] }).pipe(delay(this.DELAY));
  }
}
