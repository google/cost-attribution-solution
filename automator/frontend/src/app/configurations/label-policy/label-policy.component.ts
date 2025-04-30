import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatChipInputEvent, MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { finalize } from "rxjs";
import { ConfigurationsService } from "../../core/model/ConfigurationService";

type DisplayPolicy = {
    name: string;
    values: string[];
    isEditing?: boolean;
    _originalState?: { name: string; values: string[] };
};

@Component({
    selector: "app-label-policy",
    standalone: true,
    imports: [
        FormsModule,
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

    readonly separatorKeysCodes = [ENTER, COMMA] as const;

    constructor(
        private _snackBar: MatSnackBar,
        private service: ConfigurationsService,
    ) {
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

    get isAnyRowEditing(): boolean {
        return this.dataSource.data.some((p) => p.isEditing);
    }

    loadData() {
        this.loading = true;

        this.service
            .fetchLabelPolicies()
            .pipe(finalize(() => (this.loading = false)))
            .subscribe({
                next: (policies) => {
                    this.dataSource.data = Object.entries(policies).map(
                        ([k, v]) => ({
                            name: k,
                            values: v,
                        }),
                    );
                },
                error: (err) => {
                    console.error(err);

                    this._snackBar.open(
                        `Failed to fetch policies. Please try again.`,
                        "Close",
                        {
                            duration: 10000,
                        },
                    );
                },
            });
    }

    createNew() {
        if (this.isAnyRowEditing) {
            this._snackBar.open(
                "Please save or cancel the current edit first.",
                "Close",
                { duration: 3000 },
            );
            return;
        }

        const newPolicy: DisplayPolicy = {
            name: "",
            values: [],
            isEditing: true,
        };

        this.dataSource.data = [newPolicy, ...this.dataSource.data];

        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    isDuplicateKey(policyToCheck: DisplayPolicy): boolean {
        const proposedKey = policyToCheck.name?.trim().toLowerCase();

        return (
            this.dataSource.data.filter(
                (existingPolicy) =>
                    existingPolicy.name.trim().toLowerCase() === proposedKey,
            ).length > 1
        );
    }

    savePolicy(policy: DisplayPolicy) {
        if (!policy.name || policy.name.trim() === "") {
            this._snackBar.open(
                "Policy Key cannot be empty (save prevented).",
                "Close",
                { duration: 3000 },
            );
            return;
        }

        this.service
            .updateLabelPolicies({ [policy.name]: policy.values })
            .subscribe({
                next: (_) => {
                    policy.isEditing = false;
                    delete policy._originalState;

                    this._snackBar.open(
                        `Policy ${policy.name} saved.`,
                        "Close",
                        {
                            duration: 3000,
                        },
                    );
                },
                error: (err) => {
                    console.error(err);

                    this._snackBar.open(
                        `Failed to update policy. Please try again.`,
                        "Close",
                        {
                            duration: 10000,
                        },
                    );
                },
            });
    }

    cancelEdit(policy: DisplayPolicy) {
        // It's an edit
        if (policy._originalState) {
            policy.name = policy._originalState.name;
            policy.values = policy._originalState.values;

            policy.isEditing = false;
            delete policy._originalState;
        } else {
            this.dataSource.data = this.dataSource.data.filter(
                (p) => !p.isEditing,
            );
        }
    }

    addValue(policy: DisplayPolicy, event: MatChipInputEvent): void {
        const value = (event.value || "").trim().toLowerCase();
        if (value) {
            if (!policy.values.includes(value)) {
                policy.values.push(value);
            }
        }
        event.chipInput!.clear();
    }

    removeValue(policy: DisplayPolicy, valueToRemove: string): void {
        if (policy.values) {
            policy.values = policy.values.filter((v) => v !== valueToRemove);
        }
    }

    editResourceTags(policy: DisplayPolicy) {
        if (this.isAnyRowEditing) {
            this._snackBar.open(
                "Please save or cancel the current edit first.",
                "Close",
                { duration: 3000 },
            );
            return;
        }

        policy._originalState = {
            name: policy.name,
            values: [...policy.values],
        };

        policy.isEditing = true;
    }

    confirmDeleteTag(policy: DisplayPolicy) {
        if (policy.isEditing) {
            this._snackBar.open(
                "Cannot delete a policy while it is being edited.",
                "Close",
                { duration: 3000 },
            );
            return;
        }

        this.deleting = true;

        this.service
            .deleteLabelPolicies(policy.name)
            .pipe(finalize(() => (this.deleting = false)))
            .subscribe({
                next: (_) => {
                    this.dataSource.data = this.dataSource.data.filter(
                        (item) => item.name !== policy.name,
                    );
                    this._snackBar.open(
                        `Policy ${policy.name} deleted`,
                        "Close",
                        {
                            duration: 2000,
                        },
                    );
                },

                error: (err) => {
                    console.error(err);

                    this._snackBar.open(
                        `Failed to delete policy. Please try again.`,
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
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }

    clearFilter(inputElement: HTMLInputElement) {
        inputElement.value = "";
        this.applyFilter({ target: inputElement } as any);
    }
}
