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
import { TagService } from "../model/TagService";
import {
  BulkResponse,
  Resource,
  Response,
  Tag,
  TagBinding,
} from "../model/models";
import { SERVICE_CONFIG } from "../model/values";

@Injectable()
export class BackendService implements TagService {
  private apiUrl: string;

  constructor(private http: HttpClient) {
    this.apiUrl = inject(SERVICE_CONFIG).apiUrl;
  }

  deleteTag(key: string): Observable<Response> {
    return this.http.delete<Response>(this.apiUrl + "/tag/" + key);
  }

  editTag(key: string, values: string[]): Observable<Response> {
    return this.http.post<Response>(this.apiUrl + "/tagValues", {
      key,
      values,
    });
  }

  addTag(name: string, description: string): Observable<{ key: string }> {
    return this.http.post<{ key: string }>(this.apiUrl + "/tag", {
      name,
      description,
    });
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
