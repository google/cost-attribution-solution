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

import { Injectable, inject } from "@angular/core";
import { SERVICE_CONFIG } from "../model/values";
import { Observable } from "rxjs";
import {
  BulkResponse,
  Resource,
  Response,
  Tag,
  TagBinding,
} from "../model/models";
import { TagService } from "../model/Service";
import { HttpClient } from "@angular/common/http";

@Injectable()
export class BackendService implements TagService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = inject(SERVICE_CONFIG).apiUrl;
  }

  fetchResources(): Observable<Resource[]> {
    return this.http.get<Array<Resource>>(this.apiUrl + `/resources`);
  }

  fetchTags(): Observable<Tag[]> {
    return this.http.get<Array<Tag>>(this.apiUrl + `/tags`);
  }

  updateResourceTags(
    id: string,
    location: string,
    tags: TagBinding[],
  ): Observable<Response> {
    return this.http.post<Response>(this.apiUrl + "/resource", {
      id,
      location,
      tags,
    });
  }

  addTagsToResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse> {
    return this.http.post<BulkResponse>(this.apiUrl + "/resources/tags", {
      resources,
      tags,
    });
  }

  removeTagsFromResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse> {
    return this.http.delete<BulkResponse>(this.apiUrl + "/resources/tags", {
      body: {
        resources,
        tags,
      },
    });
  }
}
