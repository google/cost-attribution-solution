import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class GeneralComponent {
  chosenAssetTypes = new FormControl<string[]>([]); // Use array for multiple selection
  assetTypes: string[] = [
    "Project",
    "Compute Engine",
    "BigQuery",
    "Cloud Storage",
    "Cloud SQL",
    "Cloud Run",
  ];
  missingAttributionUrl = new FormControl("");
  billingUrl = new FormControl("");

  constructor(private _snackBar: MatSnackBar) {
    // Load existing configurations if available (e.g., from a service)
    // this.loadConfigurations();
  }

  loadConfigurations() {
    // Example: Fetch from a config service
    // const config = configService.getGeneralConfig();
    // this.chosenAssetTypes.setValue(config.assetTypes || []);
    // this.missingAttributionUrl.setValue(config.missingAttributionUrl || '');
    // this.billingUrl.setValue(config.billingUrl || '');
  }

  saveConfigurations() {
    // Add logic to save the form values
    const config = {
      assetTypes: this.chosenAssetTypes.value,
      missingAttributionUrl: this.missingAttributionUrl.value,
      billingUrl: this.billingUrl.value,
    };
    console.log("Saving configurations:", config);
    // Example: Call a service to save
    // configService.saveGeneralConfig(config).subscribe(() => { ... });

    this._snackBar.open("Configurations saved successfully!", "Close", {
      duration: 3000, // Duration in milliseconds
    });
  }
}
