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

import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "tags",
        children: [
            {
                path: "manage",
                loadComponent: () =>
                    import("./tags/manage/manage-tags.component").then(
                        (m) => m.ManageTagsComponent,
                    ),
            },
            {
                path: "bindings",
                loadComponent: () =>
                    import("./tags/bindings/bindings.component").then(
                        (m) => m.TagsBindingsComponent,
                    ),
            },
            {
                path: "upload",
                loadComponent: () =>
                    import("./tags/upload/upload.component").then(
                        (m) => m.UploadComponent,
                    ),
            },
        ],
    },
    {
        path: "labels",
        children: [
            {
                path: "bindings",
                loadComponent: () =>
                    import("./labels/bindings/bindings.component").then(
                        (m) => m.LabelBindingsComponent,
                    ),
            },
            {
                path: "upload",
                loadComponent: () =>
                    import("./labels/upload/upload.component").then(
                        (m) => m.UploadComponent,
                    ),
            },
        ],
    },
    {
        path: "reports/:reportType",
        loadComponent: () =>
            import("./reports/reports.component").then(
                (m) => m.ReportsComponent,
            ),
    },
    {
        path: "configurations",
        loadComponent: () =>
            import("./configurations/configurations.component").then(
                (m) => m.ConfigurationsComponent,
            ),
    },
    {
        path: "",
        loadComponent: () =>
            import("./home/home.component").then((m) => m.HomeComponent),
    },
    {
        path: "**",
        redirectTo: "",
    },
];
