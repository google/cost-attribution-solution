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
import { ResourceLabels } from "../../../../core/model/models";
import { LabelService } from "../../../../core/model/LabelService";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

type EditLabelData = {
  resources: ResourceLabels[];
};

@Component({
  selector: "app-bulk-remove",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatDialogActions,
    MatSnackBarModule,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: "./bulk-remove.component.html",
  styleUrl: "./bulk-remove.component.sass",
})
export class BulkRemoveComponent {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  saving: boolean = false;
  labels: Set<string> = new Set();

  constructor(
    private service: LabelService,
    public dialogRef: MatDialogRef<BulkRemoveComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditLabelData,
    private _snackBar: MatSnackBar,
  ) {}

  add(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    if (value) {
      this.labels.add(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(value: string): void {
    this.labels.delete(value);
  }

  save() {
    this.saving = true;

    // Call backend
    this.service
      .removeLabelsFromResources(
        this.data.resources.map((r) => ({
          id: r.id,
          location: r.location,
        })),
        [...this.labels],
      )
      .subscribe({
        next: (resp) => {
          const resourcesCount = this.data.resources.length;
          const errorsCount = resp.errors?.length || 0;

          if (errorsCount > 0) {
            this._snackBar.open(
              `Fail to remove labels from ${errorsCount} resources${errorsCount < resourcesCount ? ` (other ${resourcesCount - errorsCount} succeeded).` : "."}`,
              "Close",
              { duration: 30000 },
            );
          } else {
            this._snackBar.open(
              `Labels removed from ${this.data.resources.length} resources.`,
              "Close",
              { duration: 3000 },
            );
          }

          this.dialogRef.close(this.labels);
        },
        error: (err) => {
          this._snackBar.open(
            `Fail to remove labels: ${err.error.detail}`,
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
