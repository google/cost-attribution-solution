import { Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatTabsModule } from "@angular/material/tabs";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatButtonModule } from "@angular/material/button";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { FileUpload, FileUploadStatus } from "../../core/model/models";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-upload",
  standalone: true,
  imports: [
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
      value: "a",
      viewValue: "A",
    },
    {
      value: "b",
      viewValue: "B",
    },
  ];

  readonly fields: { [key: string]: { header: string; rows: string } } = {
    a: {
      header: `A,project_id,cost-center,environment,app`,
      rows: `my-project-123,fin-ops,prod,shopping-cart\nmy-project-456,sre,dev,catalog`,
    },
    b: {
      header: `B,project_id,cost-center,environment,app`,
      rows: `my-project-123,fin-ops,prod,shopping-cart\nmy-project-456,sre,dev,catalog`,
    },
  };

  chosenType: string | undefined;
  file:
    | {
        name: string;
        contents: string;
      }
    | undefined;

  dataSource: MatTableDataSource<FileUpload> = new MatTableDataSource();
  displayedColumns: string[] = ["id", "name", "status", "details"];

  constructor(private _snackBar: MatSnackBar) {
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

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const contents = e.target.result;

      // TODO: validate the schema
      this.file = {
        name: file.name,
        contents,
      };
    };

    reader.onerror = (e: any) => {
      this._snackBar.open(
        "Failed to read the file, please try again.",
        "Close",
        { duration: 3000 },
      );
    };

    reader.readAsText(file);
  }

  viewDetails(element: FileUpload) {}
}
