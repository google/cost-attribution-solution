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

import { Observable } from "rxjs";
import { BulkResponse, Resource, Response, Tag, TagBinding } from "./models";

export abstract class TagService {
  abstract fetchTags(): Observable<Array<Tag>>;
  abstract addTag(
    name: string,
    description: string,
  ): Observable<{ key: string }>;
  abstract editTag(key: string, values: string[]): Observable<Response>;

  abstract fetchResources(): Observable<Array<Resource>>;

  abstract updateResourceTags(
    id: string,
    location: string,
    tags: TagBinding[],
  ): Observable<Response>;

  abstract addTagsToResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse>;

  abstract removeTagsFromResources(
    resources: { id: string; location: string }[],
    tags: TagBinding[],
  ): Observable<BulkResponse>;
}
