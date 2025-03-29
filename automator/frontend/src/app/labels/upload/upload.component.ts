import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSelectModule } from "@angular/material/select";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { LabelService } from "../../core/model/LabelService";
import { FileUpload, FileUploadStatus } from "../../core/model/models";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [
    FormsModule,
    MatTabsModule,
    MatIconModule,
    MatSelectModule,
    MatCardModule,
    MatSlideToggleModule,
    MatTableModule,
    MatButtonModule,
    MatPaginatorModule,
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

  chosenType: string | undefined;
  clean_labels: boolean = false;

  dataSource: MatTableDataSource<FileUpload> = new MatTableDataSource();
  displayedColumns: string[] = ["id", "name", "status", "details"];

  constructor(
    private service: LabelService,
    private _snackBar: MatSnackBar,
  ) {
    this.dataSource.data = [
      {
        id: "123",
        file: "Upload 123",
        status: FileUploadStatus.Processing,
      },
      {
        id: "456",
        file: "Upload 456",
        status: FileUploadStatus.Error,
      },
      {
        id: "789",
        file: "Upload 789",
        status: FileUploadStatus.Success,
      },
    ];
  }

  onFileSelected(event: Event) {
    const file: File = (event.target as any).files[0];

    this.service.uploadCSV(file, this.clean_labels).subscribe({
      next: (resp) => {
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

    // const reader = new FileReader();

    // reader.onload = (e: any) => {
    //   const contents = e.target.result;

    //   // TODO: validate the schema
    //   this.file = {
    //     name: file.name,
    //     contents,
    //   };
    // };

    // reader.onerror = (e: any) => {
    //   this._snackBar.open(
    //     "Failed to read the file, please try again.",
    //     "Close",
    //     { duration: 3000 },
    //   );
    // };

    // reader.readAsText(file);
  }

  viewDetails(element: FileUpload) {}
}
