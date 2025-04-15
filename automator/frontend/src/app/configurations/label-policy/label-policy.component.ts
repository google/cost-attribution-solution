import { Component, ViewChild, AfterViewInit } from "@angular/core"; // Added AfterViewInit
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator"; // Imported MatPaginator
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort, MatSortModule } from "@angular/material/sort";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatFormFieldModule } from "@angular/material/form-field"; // Import MatFormFieldModule

// Define a type for better structure
type DisplayPolicyValue = { value: string };
type DisplayPolicy = {
  id: string;
  name: string;
  values?: DisplayPolicyValue[]; // Values are optional
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
    MatFormFieldModule, // Add MatFormFieldModule here
  ],
  templateUrl: './label-policy.component.html',
  styleUrl: './label-policy.component.scss',
})
export class LabelPolicyComponent implements AfterViewInit { // Implemented AfterViewInit
  dataSource: MatTableDataSource<DisplayPolicy> = new MatTableDataSource();
  displayedColumns: string[] = ['name', 'values', 'edit', 'delete'];
  loading: boolean = true; // Set initial state
  deleting: boolean = false; // Consider making this per-row if needed

  // Use ViewChild with static: false for elements inside ngIf/ngFor
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;

  constructor(private _snackBar: MatSnackBar) {
     // Simulate data loading
     this.loadData();
  }

  ngAfterViewInit() {
     // Assign sort and paginator after view initialization
     if (this.dataSource) {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
     }
  }

  loadData() {
    this.loading = true;
    // Replace with actual data fetching logic
    setTimeout(() => {
        const mockData: DisplayPolicy[] = [
          { id: '1', name: 'cost-center', values: [{ value: 'finops' }, { value: 'rnd' }] },
          { id: '2', name: 'environment', values: [{ value: 'prod' }, { value: 'dev' }, { value: 'staging' }] },
          { id: '3', name: 'owner' } // Example policy with no specific values (any allowed)
        ];
      this.dataSource.data = mockData;
      // Re-assign sort and paginator after data is loaded if needed
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.loading = false;
    }, 1500); // Simulate network delay
  }


  editResourceTags(policy: DisplayPolicy) { // Use specific type
       console.log("Edit Policy:", policy);
       // Add implementation (e.g., open dialog)
       this._snackBar.open(`Editing policy for ${policy.name}`, "Close", { duration: 2000 });
  }

  confirmDeleteTag(policy: DisplayPolicy) { // Use specific type
    this.deleting = true; // Consider row-specific deleting state
    console.log("Deleting Policy:", policy);
    // Add implementation, e.g., call a service then handle response
    setTimeout(() => {
        // Update dataSource.data by filtering out the deleted item
        this.dataSource.data = this.dataSource.data.filter(item => item.id !== policy.id);
        // Need to re-assign paginator after data change if using client-side pagination
        this.dataSource.paginator = this.paginator;
        this._snackBar.open(`Policy ${policy.name} deleted`, "Close", { duration: 2000 });
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

  createNew() {
    console.log("Create new label policy");
    // Add implementation (e.g., open dialog)
     this._snackBar.open("Opening policy creation form...", "Close", { duration: 2000 });
  }
}
