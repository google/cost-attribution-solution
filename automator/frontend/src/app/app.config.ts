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

import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { provideRouter } from "@angular/router";
import { HttpClientModule } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { routes } from "./app.routes";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { TagService } from "./core/model/TagService";
import { SERVICE_CONFIG, TITLE } from "./core/model/values";
import { environment } from "./../environments/environment";
import { BackendService } from "./core/services/tag_backend.service";
import { MockBackendService } from "./core/mocks/mock-backend";

export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: TagService,
            useClass: environment.production
                ? BackendService
                : MockBackendService,
        },
        provideRouter(routes),
        provideAnimationsAsync(),
        importProvidersFrom(HttpClientModule),
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                subscriptSizing: "dynamic",
            },
        },
        { provide: TITLE, useValue: "Tag Automator" },
        {
            provide: SERVICE_CONFIG,
            useValue: {
                apiUrl: environment.apiUrl,
            },
        },
    ],
};
