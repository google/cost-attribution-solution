import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from "@angular/common";
import { finalize } from "rxjs";
import { UploadResponse } from "../../core/model/models";
import { TagService } from "../../core/model/TagService";

@Component({
  selector: "app-tags-upload",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: "./upload.component.html",
  styleUrl: "./upload.component.scss",
})
export class UploadComponent {
  readonly fields: { header: string; rows: string } = {
    header: `resource_id,location,tagKeys/123,tagKeys/456`,
    rows: `//compute.googleapis.com/projects/project-1/zones/us-east1-b/instances/123,us-east1-b,tagValues/123,tagValues/456
//compute.googleapis.com/projects/project-1/global/networks/123,global,tagValues/111,tagValues222`,
  };

  response: UploadResponse | undefined;

  loading: boolean = false;
  clean_tags: boolean = true;

  constructor(
    private service: TagService,
    private _snackBar: MatSnackBar,
  ) {}

  onFileSelected(event: Event) {
    const file: File = (event.target as any).files[0];

    this.loading = true;
    this.response = undefined;

    this.service
      .uploadCSV(file, this.clean_tags)
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
