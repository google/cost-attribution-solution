import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Component, ViewChild } from "@angular/core";
import { FormsModule } from "@angular/forms"; // Keep FormsModule
import { MatButtonModule } from "@angular/material/button";
import {
    MatChipInputEvent,
    MatChipsModule,
} from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input"; // Keep MatInputModule
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field"; // Keep MatFormFieldModule

type DisplayPolicyValue = { value: string };

type DisplayPolicy = {
    id: string;
    name: string;
    values?: DisplayPolicyValue[];
    isEditing?: boolean;
    _originalState?: { name: string; values?: DisplayPolicyValue[] };
};

@Component({
    selector: "app-label-policy",
    standalone: true,
    imports: [
        FormsModule, // Keep
        MatInputModule, // Keep
        MatButtonModule,
        MatTableModule,
        MatProgressBarModule,
        MatPaginatorModule,
        MatChipsModule,
        MatSortModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule, // Keep
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
    private newPolicyCounter = 0;

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

    get isAnyRowEditing(): boolean {
        return this.dataSource.data.some((p) => p.isEditing);
    }

    loadData() {
        this.loading = true;
        const mockData: DisplayPolicy[] = [
            { id: "1", name: "cost-center", values: [{ value: "finops" }, { value: "rnd" }] },
            { id: "2", name: "environment", values: [{ value: "prod" }, { value: "dev" }, { value: "staging" }] },
            { id: "3", name: "owner" },
        ];
        setTimeout(() => {
            this.dataSource.data = mockData.map((p) => ({ ...p, isEditing: false }));
            this.loading = false;
        }, 1500);
    }

    createNew() {
        if (this.isAnyRowEditing) {
            this._snackBar.open("Please save or cancel the current edit first.", "Close", { duration: 3000 });
            return;
        }
        this.newPolicyCounter++;
        const newPolicy: DisplayPolicy = { id: `new-${this.newPolicyCounter}`, name: "", values: [], isEditing: true };
        this.dataSource.data = [newPolicy, ...this.dataSource.data];
        if (this.dataSource.paginator) { this.dataSource.paginator.firstPage(); }
    }

    // Check if the key is a duplicate, excluding the row itself
    isDuplicateKey(policyToCheck: DisplayPolicy): boolean {
        const proposedKey = policyToCheck.name?.trim().toLowerCase();
        if (!proposedKey) return false; // Not a duplicate if empty

        return this.dataSource.data.some(
            existingPolicy =>
                existingPolicy.id !== policyToCheck.id && // Exclude self
                existingPolicy.name.trim().toLowerCase() === proposedKey
        );
    }

    savePolicy(policy: DisplayPolicy) {
        // Keep the basic empty check here as a safeguard, though the button should be disabled
        if (!policy.name || policy.name.trim() === "") {
            this._snackBar.open("Policy Key cannot be empty (save prevented).", "Close", { duration: 3000 });
            return;
        }
        // Duplicate check is now primarily handled by disabling the button,
        // but could be added here again as a final server-side style check if desired.

        console.log("Saving policy:", policy);
        if (policy.id.startsWith("new-")) { policy.id = `saved-${Date.now()}`; }
        policy.isEditing = false;
        delete policy._originalState;
        this.dataSource.data = [...this.dataSource.data];
        this._snackBar.open(`Policy ${policy.name} saved.`, "Close", { duration: 2000 });
    }

    cancelAdd(policyToCancel: DisplayPolicy) {
        this.dataSource.data = this.dataSource.data.filter((p) => p.id !== policyToCancel.id);
        console.log("Cancelled adding policy");
    }

    cancelEdit(policy: DisplayPolicy) {
        if (policy._originalState) {
            policy.name = policy._originalState.name;
            policy.values = policy._originalState.values ? policy._originalState.values.map(v => ({ ...v })) : [];
        }
        policy.isEditing = false;
        delete policy._originalState;
        this.dataSource.data = [...this.dataSource.data];
        console.log("Cancelled editing policy:", policy.id);
    }

    addValue(policy: DisplayPolicy, event: MatChipInputEvent): void {
        const value = (event.value || "").trim().toLowerCase();
        if (value) {
            if (!policy.values) { policy.values = []; }
            if (!policy.values.some((v) => v.value === value)) { policy.values.push({ value: value }); }
        }
        event.chipInput!.clear();
    }

    removeValue(policy: DisplayPolicy, valueToRemove: DisplayPolicyValue): void {
        if (policy.values) {
            policy.values = policy.values.filter((v) => v.value !== valueToRemove.value);
        }
    }

    editResourceTags(policy: DisplayPolicy) {
        if (this.isAnyRowEditing) {
            this._snackBar.open("Please save or cancel the current edit first.", "Close", { duration: 3000 });
            return;
        }
        policy._originalState = { name: policy.name, values: policy.values ? policy.values.map(v => ({ ...v })) : [] };
        policy.isEditing = true;
        this.dataSource.data = [...this.dataSource.data];
    }

    confirmDeleteTag(policy: DisplayPolicy) {
        if (policy.isEditing) {
            this._snackBar.open("Cannot delete a policy while it is being edited.", "Close", { duration: 3000 });
            return;
        }
        this.deleting = true;
        console.log("Deleting Policy:", policy);
        setTimeout(() => {
            this.dataSource.data = this.dataSource.data.filter((item) => item.id !== policy.id);
            this._snackBar.open(`Policy ${policy.name} deleted`, "Close", { duration: 2000 });
            this.deleting = false;
        }, 1000);
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) { this.dataSource.paginator.firstPage(); }
    }

    clearFilter(inputElement: HTMLInputElement) {
        inputElement.value = "";
        this.applyFilter({ target: inputElement } as any);
    }
}
