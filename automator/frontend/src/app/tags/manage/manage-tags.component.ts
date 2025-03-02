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
import { MatIconModule } from "@angular/material/icon";
import { Tag } from "../../core/model/models";
import { MatButtonModule } from "@angular/material/button";
import { Service } from "../../core/model/Service";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatChipsModule } from "@angular/material/chips";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-manage-tags",
  standalone: true,
  imports: [
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatChipsModule,
    MatIconModule,
  ],
  templateUrl: "./manage-tags.component.html",
  styleUrl: "./manage-tags.component.scss",
})
export class ManageTagsComponent {
  dataSource: MatTableDataSource<Tag> = new MatTableDataSource();
  displayedColumns: string[] = ["key", "values", "edit", "delete"];
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

  constructor(service: Service) {
    service.fetchTags().subscribe((tags) => {
      this.dataSource.data = tags;
      this.loading = false;
    });
  }

  editResourceTags(_resource: Tag) {
    // this.dialog
    //   .open(SingleEditComponent, {
    //     width: "40vw",
    //     enterAnimationDuration: 200,
    //     exitAnimationDuration: 200,
    //     data: {
    //       resource: resource,
    //       availableTags: this.availableTags,
    //     },
    //   })
    //   .afterClosed()
    //   .subscribe((result: TagBinding[] | undefined) => {
    //     // Apply edited result to the table
    //     if (result) {
    //       resource.tags = result;
    //       resource.displayTags = this.formatDisplayTags(resource.tags);
    //     }
    //   });
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  formatTagValues(tag: Tag) {
    return tag.values.map((v) => v.value).join(", ");
  }
}
