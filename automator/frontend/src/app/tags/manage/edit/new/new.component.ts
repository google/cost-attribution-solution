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
import {
  AbstractControl,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
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
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { TagService } from "../../../../core/model/Service";
import { TagManageEditcomponent } from "../edit.component";

type NewTagData = {
  existingKeys: string[];
};

function takenValueValidator(takenValues: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    return takenValues.includes(value)
      ? { takenKey: { value: control.value } }
      : null;
  };
}

@Component({
  selector: "app-tag-manage-new",
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TagManageEditcomponent,
  ],
  templateUrl: "./new.component.html",
  styleUrl: "./new.component.scss",
})
export class NewTagComponent {
  tagFormControl: FormControl;
  saving: boolean = false;

  constructor(
    private service: TagService,
    @Inject(MAT_DIALOG_DATA) data: NewTagData,
    public dialogRef: MatDialogRef<NewTagComponent>,
    private _snackBar: MatSnackBar,
  ) {
    this.tagFormControl = new FormControl("", [
      Validators.required,
      takenValueValidator(data.existingKeys),
    ]);
  }

  save() {
    this.saving = true;

    // Call backend
    // this.service
    //   .updateResourceTags(
    //     this.data.resource.id,
    //     this.data.resource.location,
    //     this.data.resource.tags,
    //   )
    //   .subscribe({
    //     next: () => {
    //       this._snackBar.open("Tags updated with success.", "Close", {
    //         duration: 3000,
    //       });

    //       this.dialogRef.close(this.data.resource.tags);
    //     },

    //     error: (err) => {
    //       this._snackBar.open(
    //         `Fail to update tags: ${err.error.message}`,
    //         "Close",
    //         {
    //           duration: 10000,
    //         },
    //       );

    //       this.saving = false;
    //     },
    //   });
  }
}
