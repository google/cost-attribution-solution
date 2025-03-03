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
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatFormField } from "@angular/material/select";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { Resource, TagBinding, TagsController } from "../../core/model/models";
import { AvailableTags } from "../available_tags";
import { combineLatest } from "rxjs";
import { TagService } from "../../core/model/Service";
import { SingleEditComponent } from "./edit/single-edit/single-edit.component";
import { BulkEditComponent } from "./edit/bulk-add/bulk-edit.component";
import { BulkRemoveComponent } from "./edit/bulk-remove/bulk-remove.component";
import { MatTooltipModule } from "@angular/material/tooltip";

type DisplayResource = Resource & { displayTags: string };

@Component({
  selector: "tags-bindings",
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
    MatTooltipModule,
  ],
  providers: [],
})
export class TagsBindingsComponent {
  // Resouces data Source
  dataSource: MatTableDataSource<DisplayResource> = new MatTableDataSource();
  displayedColumns: string[] = ["name", "type", "displayTags", "edit"];

  availableTags!: TagsController;
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
    private service: TagService,
    private dialog: MatDialog,
  ) {
    this.updateData();
  }

  updateData() {
    this.loading = true;

    // Fetch available tags and resources from service
    combineLatest([
      this.service.fetchTags(),
      this.service.fetchResources(),
    ]).subscribe(([tags, resources]) => {
      this.availableTags = new AvailableTags(tags);

      // Enrich with the display tags field!
      this.dataSource.data = resources.map((r) => ({
        ...r,
        displayTags: this.formatDisplayTags(r.tags),
      }));

      this.loading = false;
    });
  }

  addTagsToFiltered() {
    const filtered = this.dataSource.filteredData as DisplayResource[];

    this.dialog
      .open(BulkEditComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resources: filtered,
          availableTags: this.availableTags,
        },
      })
      .afterClosed()
      .subscribe((result: TagBinding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          const tagMap = new Map(result.map((t) => [t.id, t.value]));

          for (const resource of filtered) {
            // Remove any existing values for added keys
            resource.tags = resource.tags.filter((t) => !tagMap.has(t.id));

            // Add new tags to it
            resource.tags.push(...result);
            resource.displayTags = this.formatDisplayTags(resource.tags);
          }
        }
      });
  }

  removeTagsFromFiltered() {
    const filtered = this.dataSource.filteredData as DisplayResource[];

    this.dialog
      .open(BulkRemoveComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resources: filtered,
          availableTags: this.availableTags,
        },
      })
      .afterClosed()
      .subscribe((result: TagBinding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          const tagSet = new Set(result.map((t) => t.value));

          for (const resource of filtered) {
            // Remove the deleted tags
            resource.tags = resource.tags.filter((t) => !tagSet.has(t.value));
            resource.displayTags = this.formatDisplayTags(resource.tags);
          }
        }
      });
  }

  editResourceTags(resource: DisplayResource) {
    this.dialog
      .open(SingleEditComponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          resource: resource,
          availableTags: this.availableTags,
        },
      })
      .afterClosed()
      .subscribe((result: TagBinding[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          resource.tags = result;
          resource.displayTags = this.formatDisplayTags(resource.tags);
        }
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private formatDisplayTags(tags: TagBinding[]) {
    if (tags.length == 0) return "-";

    return tags
      .map(
        (tag) =>
          `${this.availableTags.getKeyName(tag.id)}: ${this.availableTags.getValueName(tag.id, tag.value)}`,
      )
      .join("\n");
  }
}
