import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field";

type DisplayPolicyValue = { value: string };
type DisplayPolicy = {
  id: string;
  name: string;
  values?: DisplayPolicyValue[];
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
    MatFormFieldModule,
  ],
  templateUrl: "./label-policy.component.html",
  styleUrl: "./label-policy.component.scss",
})
export class LabelPolicyComponent {
  dataSource: MatTableDataSource<DisplayPolicy> = new MatTableDataSource();
  displayedColumns: string[] = ["name", "values", "edit", "delete"];
  loading: boolean = true;
  deleting: boolean = false;

  constructor(private _snackBar: MatSnackBar) {
    this.loadData();
  }

  @ViewChild(MatPaginator, { static: false }) set contentPaginator(
    pag: MatPaginator,
  ) {
    this.dataSource.paginator = pag;
  }

  @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  loadData() {
    this.loading = true;

    setTimeout(() => {
      const mockData: DisplayPolicy[] = [
        {
          id: "1",
          name: "cost-center",
          values: [{ value: "finops" }, { value: "rnd" }],
        },
        {
          id: "2",
          name: "environment",
          values: [{ value: "prod" }, { value: "dev" }, { value: "staging" }],
        },
        { id: "3", name: "owner" },
      ];

      this.dataSource.data = mockData;

      this.loading = false;
    }, 1500);
  }

  editResourceTags(policy: DisplayPolicy) {
    console.log("Edit Policy:", policy);

    this._snackBar.open(`Editing policy for ${policy.name}`, "Close", {
      duration: 2000,
    });
  }

  confirmDeleteTag(policy: DisplayPolicy) {
    this.deleting = true;

    console.log("Deleting Policy:", policy);

    setTimeout(() => {
      this.dataSource.data = this.dataSource.data.filter(
        (item) => item.id !== policy.id,
      );

      this._snackBar.open(`Policy ${policy.name} deleted`, "Close", {
        duration: 2000,
      });
      this.deleting = false;
    }, 1000);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter(inputElement: HTMLInputElement) {
    inputElement.value = "";
    this.applyFilter({ target: inputElement } as any);
  }

  createNew() {
    console.log("Create new label policy");

    this._snackBar.open("Opening policy creation form...", "Close", {
      duration: 2000,
    });
  }
}
