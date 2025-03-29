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

import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { LabelService } from "../../../../core/model/LabelService";
import { ResourceLabels, Binding } from "../../../../core/model/models";
import { EditComponent } from "../edit.component";

type EditLabelData = {
  resources: ResourceLabels[];
};

@Component({
  selector: "app-bulk-edit",
  standalone: true,
  imports: [
    MatDialogActions,
    MatSnackBarModule,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    EditComponent,
  ],
  templateUrl: "./bulk-edit.component.html",
  styleUrl: "./bulk-edit.component.sass",
})
export class BulkEditComponent {
  saving: boolean = false;
  valid: boolean = false;
  labels: Binding[] = [];

  constructor(
    private service: LabelService,
    public dialogRef: MatDialogRef<BulkEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditLabelData,
    private _snackBar: MatSnackBar,
  ) {}

  save() {
    this.saving = true;

    // Call backend
    this.service
      .addLabelsToResources(
        this.data.resources.map((r) => ({
          id: r.id,
          location: r.location,
        })),
        this.labels,
      )
      .subscribe({
        next: (resp) => {
          const resourcesCount = this.data.resources.length;
          const errorsCount = resp.errors?.length || 0;

          if (errorsCount > 0) {
            this._snackBar.open(
              `Fail to add labels to ${errorsCount} resources${errorsCount < resourcesCount ? ` (other ${resourcesCount - errorsCount} succeeded).` : "."}`,
              "Close",
              { duration: 30000 },
            );
          } else {
            this._snackBar.open(
              `Labels added to ${this.data.resources.length} resources.`,
              "Close",
              { duration: 3000 },
            );
          }

          this.dialogRef.close(this.labels);
        },
        error: (err) => {
          this._snackBar.open(
            `Fail to add labels: ${err.error.detail}`,
            "Close",
            {
              duration: 10000,
            },
          );

          this.saving = false;
        },
      });
  }
}
