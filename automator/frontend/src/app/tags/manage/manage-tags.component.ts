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
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TagService } from "../../core/model/TagService";
import { Tag, TagsController, Value } from "../../core/model/models";
import { AvailableTags } from "../available_tags";
import { TagManageEditcomponent } from "./edit/edit.component";
import { NewTagComponent } from "./edit/new/new.component";
import { finalize } from "rxjs";

type DisplayTag = {
  name: string;
} & Tag;

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
    MatSortModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: "./manage-tags.component.html",
  styleUrl: "./manage-tags.component.scss",
})
export class ManageTagsComponent {
  dataSource: MatTableDataSource<DisplayTag> = new MatTableDataSource();
  displayedColumns: string[] = ["name", "values", "edit", "delete"];
  loading: boolean = true;
  deleting: boolean = false;

  availableTags!: TagsController;

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
    private _snackBar: MatSnackBar,
  ) {
    service.fetchTags().subscribe((tags) => {
      this.availableTags = new AvailableTags(tags);

      this.dataSource.data = tags.map(this.formatTag);

      this.loading = false;
    });
  }

  newTag() {
    this.dialog
      .open(NewTagComponent, {
        width: "20vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: {
          existingKeys: this.availableTags.keys.map((k) => k.value),
        },
      })
      .afterClosed()
      .subscribe((result: Tag | undefined) => {
        // Apply new result to the table
        if (result) {
          this.dataSource.data = [
            ...this.dataSource.data,
            this.formatTag(result),
          ];

          // Opens to edit the newly created tag
          this.editResourceTags(result);
        }
      });
  }

  editResourceTags(resource: Tag) {
    this.dialog
      .open(TagManageEditcomponent, {
        width: "40vw",
        enterAnimationDuration: 200,
        exitAnimationDuration: 200,
        data: resource,
      })
      .afterClosed()
      .subscribe((result: Value[] | undefined) => {
        // Apply edited result to the table
        if (result) {
          resource.values = result;
        }
      });
  }

  confirmDeleteTag(resource: Tag) {
    this.deleting = true;

    this.service
      .deleteTag(resource.key.id)
      .pipe(finalize(() => (this.deleting = false)))
      .subscribe({
        next: (_res) => {
          this.dataSource.data = this.dataSource.data.filter(
            (t) => t.key.id != resource.key.id,
          );
          this._snackBar.open("Tag deleted with success.", "Close", {
            duration: 3000,
          });
        },

        error: (err) => {
          this._snackBar.open(
            `Fail to delete tag: ${err.error.message}`,
            "Close",
            {
              duration: 10000,
            },
          );
        },
      });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  private formatTag(tag: Tag) {
    return {
      name: tag.key.value,
      ...tag,
    };
  }
}
