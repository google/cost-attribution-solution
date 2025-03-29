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

import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { Binding, Value } from "../../../core/model/models";

type LabelControl = {
  key: FormControl<string | null>;
  value: FormControl<string | null>;
};

@Component({
  selector: "app-label-binding-edit",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./edit.component.html",
  styleUrl: "./edit.component.sass",
})
export class EditComponent implements OnInit {
  @Input() labelBindings: Binding[] = [];
  @Output() valid = new EventEmitter<boolean>();
  @Output() labels = new EventEmitter<Value[]>();

  form = new FormGroup({
    labelBindings: new FormArray<FormGroup<LabelControl>>([]),
  });

  constructor() {
    // Emit labels and valid
    this.form.statusChanges.subscribe((status) => {
      this.valid.emit(status === "VALID");

      this.labels.emit(
        this.labelBindingsForm.controls.map((c) => ({
          id: c.value.key as string,
          value: c.value.value as string,
        })),
      );
    });
  }

  ngOnInit(): void {
    // Populate initial label bindings
    this.labelBindings.forEach((label: Binding) => {
      this.addLabelToForm(label);
    });
  }

  newBinding() {
    this.addLabelToForm({ id: "", value: "" });
  }

  deleteBinding(index: number) {
    this.labelBindingsForm.removeAt(index);
  }

  get labelBindingsForm() {
    return this.form.controls.labelBindings;
  }

  private addLabelToForm(label: Binding) {
    const keyControl = new FormControl<string | null>(label.id, {
      validators: [
        Validators.required,

        // Validate keys are unique for a resource
        (control: AbstractControl): ValidationErrors | null => {
          const currentValue = control.value;

          // Filter for controls with the same key value, excluding the current control itself
          const count = this.labelBindingsForm.controls.filter(
            (binding, index) => {
              const otherKeyValue = binding.get("key")?.value;
              return (
                index !== control.parent?.value.index &&
                otherKeyValue === currentValue
              );
            },
          ).length;

          return count > 1 ? { duplicateKey: true } : null;
        },
      ],
    });

    const valueControl = new FormControl<string | null>(
      { value: label.value, disabled: !label.id },
      Validators.required,
    );

    // Enable value only after key is selected
    keyControl.valueChanges.subscribe((_) => {
      valueControl.reset();
      valueControl.enable();
    });

    // Add to form
    this.labelBindingsForm.push(
      new FormGroup<LabelControl>({
        key: keyControl,
        value: valueControl,
      }),
    );
  }
}
