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

  dataSource: MatTableDataSource<FileUpload> = new MatTableDataSource();
  displayedColumns: string[] = ["id", "name", "status", "details"];

  constructor() {
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

  viewDetails(element: FileUpload) {}
}
