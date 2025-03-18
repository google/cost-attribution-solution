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

import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, Inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import {
  MatChipEditedEvent,
  MatChipInputEvent,
  MatChipsModule,
} from "@angular/material/chips";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { TagService } from "../../../core/model/TagService";
import { Tag, Value } from "../../../core/model/models";

@Component({
  selector: "app-tag-manage-edit",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatDialogActions,
    MatDialogTitle,
    MatDialogClose,
    MatDialogContent,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.scss",
})
export class TagManageEditcomponent {
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  values: Set<string>;
  saving: boolean = false;

  constructor(
    private service: TagService,
    @Inject(MAT_DIALOG_DATA) public data: Tag,
    public dialogRef: MatDialogRef<TagManageEditcomponent>,
    private _snackBar: MatSnackBar,
  ) {
    this.values = new Set(data.values.map((v) => v.value));
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();

    if (value) {
      this.values.add(value);
    }

    // Clear the input value
    event.chipInput!.clear();
  }

  remove(value: string): void {
    this.values.delete(value);
  }

  edit(value: string, event: MatChipEditedEvent) {
    const newValue = event.value.trim();

    if (!newValue) {
      // this.remove(fruit);
      return;
    }

    // Edit existing fruit
    // const index = this.fruits.indexOf(fruit);
    // if (index >= 0) {
    //   this.fruits[index].name = value;
    // }
  }

  save() {
    this.saving = true;

    // TODO: CALL API and return the tag
  }
}
