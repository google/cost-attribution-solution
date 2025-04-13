import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { LabelService } from "../../core/model/LabelService";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { UploadResponse } from "../../core/model/models";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: "./upload.component.html",
  styleUrl: "./upload.component.scss",
})
export class UploadComponent {
  readonly types = [
    {
      value: "project",
      viewValue: "Project",
    },
  ];

  readonly fields: { [key: string]: { header: string; rows: string } } = {
    project: {
      header: `project_id,cost-center,environment,app`,
      rows: `my-project-123,fin-ops,prod,shopping-cart\nmy-project-456,sre,dev,catalog`,
    },
  };

  response: UploadResponse | undefined;

  loading: boolean = false;
  chosenType: string | undefined;
  clean_labels: boolean = true;

  constructor(
    private service: LabelService,
    private _snackBar: MatSnackBar,
  ) {}

  onFileSelected(event: Event) {
    const file: File = (event.target as any).files[0];

    this.loading = true;
    this.response = undefined;

    this.service
      .uploadCSV(file, this.clean_labels)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (resp) => {
          this.response = resp;

          this._snackBar.open(
            `Success on uploading and processing file.`,
            "Close",
            {
              duration: 10000,
            },
          );
        },
        error: (err) => {
          this._snackBar.open(
            `Fail to upload file: ${err.error.detail}`,
            "Close",
            {
              duration: 10000,
            },
          );
        },
      });
  }
}
