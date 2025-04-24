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

import { HttpClientModule } from "@angular/common/http";
import { ApplicationConfig, importProvidersFrom } from "@angular/core";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { environment } from "./../environments/environment";
import { routes } from "./app.routes";
import { MockConfigurationsService } from "./core/mocks/mock-configurations.service";
import { MockLabelService } from "./core/mocks/mock-label.service";
import { MockTagService } from "./core/mocks/mock-tag.service";
import { ConfigurationsService } from "./core/model/ConfigurationService";
import { LabelService } from "./core/model/LabelService";
import { TagService } from "./core/model/TagService";
import { SERVICE_CONFIG, TITLE } from "./core/model/values";
import { ConfigurationsBackendService } from "./core/services/configurations_backend.service";
import { LabelBackendService } from "./core/services/label_backend.service";
import { TagBackendService } from "./core/services/tag_backend.service";

export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: TagService,
            useClass: environment.production
                ? TagBackendService
                : MockTagService,
        },
        {
            provide: LabelService,
            useClass: environment.production
                ? LabelBackendService
                : MockLabelService,
        },
        {
            provide: ConfigurationsService,
            useClass: environment.production
                ? ConfigurationsBackendService
                : MockConfigurationsService,
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
