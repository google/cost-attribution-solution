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
import { ResourceTags, TagsController } from "../../../../core/model/models";
import { TagService } from "../../../../core/model/TagService";
import { EditComponent } from "../edit.component";

type EditTagData = {
  resource: ResourceTags;
  availableTags: TagsController;
};

@Component({
  selector: "app-single-edit",
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatSnackBarModule,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIconModule,
    MatProgressBarModule,
    EditComponent,
  ],
  templateUrl: "./single-edit.component.html",
  styleUrl: "./single-edit.component.sass",
})
export class SingleEditComponent {
  saving: boolean = false;
  valid: boolean = false;

  constructor(
    private service: TagService,
    public dialogRef: MatDialogRef<SingleEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EditTagData,
    private _snackBar: MatSnackBar,
  ) {}

  save() {
    this.saving = true;

    // Call backend
    this.service
      .updateResourceTags(
        this.data.resource.id,
        this.data.resource.location,
        this.data.resource.tags,
      )
      .subscribe({
        next: () => {
          this._snackBar.open("Tags updated with success.", "Close", {
            duration: 3000,
          });

          this.dialogRef.close(this.data.resource.tags);
        },

        error: (err) => {
          this._snackBar.open(
            `Fail to update tags: ${err.error.detail}`,
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
