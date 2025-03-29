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

import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialog } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatFormField } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { LabelService } from "../../core/model/LabelService";
import { Binding, ResourceLabels } from "../../core/model/models";
import { BulkEditComponent } from "./edit/bulk-add/bulk-edit.component";
import { BulkRemoveComponent } from "./edit/bulk-remove/bulk-remove.component";
import { SingleEditComponent } from "./edit/single-edit/single-edit.component";

type DisplayResource = ResourceLabels;

@Component({
  selector: "labels-bindings",
  templateUrl: "./bindings.component.html",
  styleUrl: "./bindings.component.css",
  standalone: true,
  imports: [
    MatTableModule,
    MatInputModule,
    MatSortModule,
    MatButtonModule,
    MatFormField,
    MatIconModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  providers: [],
})
export class LabelBindingsComponent {
  // Resouces data Source
  dataSource: MatTableDataSource<DisplayResource> = new MatTableDataSource();
  displayedColumns: string[] = ["name", "type", "displayLabels", "edit"];

  loading: boolean = true;

  // Pagination
  @ViewChild(MatPaginator, { static: false }) set contentPaginator(
    pag: MatPaginator,
  ) {
    this.dataSource.paginator = pag;
  }

  // Sorting
  @ViewChild(MatSort, { static: false }) set content(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  constructor(
    private service: LabelService,
    private dialog: MatDialog,
  ) {
    this.updateData();
  }

  updateData() {
    this.loading = true;

    // Fetch available labels and resources from service
    this.service.fetchResources().subscribe((resources) => {
      this.dataSource.data = resources;

      this.loading = false;
    });
  }

  addLabelsToFiltered() {
    const filtered = this.dataSource.filteredData as DisplayResource[];

    this.dialog
      .open(BulkEditComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resources: filtered,
        },
      })
      .afterClosed()
      .subscribe((result: Binding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          const labelMap = new Map(result.map((t) => [t.id, t.value]));

          for (const resource of filtered) {
            // Remove any existing values for added keys
            resource.labels = resource.labels.filter(
              (t) => !labelMap.has(t.id),
            );

            // Add new labels to it
            resource.labels.push(...result);
          }
        }
      });
  }

  removeLabelsFromFiltered() {
    const filtered = this.dataSource.filteredData as DisplayResource[];

    this.dialog
      .open(BulkRemoveComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resources: filtered,
        },
      })
      .afterClosed()
      .subscribe((result: Binding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          const labelSet = new Set(result.map((t) => t.value));

          for (const resource of filtered) {
            // Remove the deleted labels
            resource.labels = resource.labels.filter(
              (t) => !labelSet.has(t.value),
            );
          }
        }
      });
  }

  editResourceLabels(resource: DisplayResource) {
    this.dialog
      .open(SingleEditComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resource: { ...resource },
        },
      })
      .afterClosed()
      .subscribe((result: Binding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          resource.labels = result;
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
