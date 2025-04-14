import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";

type DisplayTag = {
  name: string;
};

@Component({
  selector: "app-label-policy",
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
  ],
  templateUrl: "./label-policy.component.html",
  styleUrl: "./label-policy.component.scss",
})
export class LabelPolicyComponent {
  dataSource: MatTableDataSource<DisplayTag> = new MatTableDataSource();
  displayedColumns: string[] = ["name", "values", "edit", "delete"];
  loading: boolean = true;
  deleting: boolean = false;

  @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(private _snackBar: MatSnackBar) {}

  editResourceTags(resource: any) {}

  confirmDeleteTag(resource: any) {
    this.deleting = true;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
