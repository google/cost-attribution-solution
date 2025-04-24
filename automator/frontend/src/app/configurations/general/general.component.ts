import { Component, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { CommonModule } from "@angular/common";
import { ConfigurationsService } from "../../core/model/ConfigurationService";
import { forkJoin, finalize } from "rxjs";

@Component({
  selector: "app-general",
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatProgressBarModule,
  ],
  templateUrl: "./general.component.html",
  styleUrl: "./general.component.scss",
})
export class GeneralComponent implements OnInit {
  loading: boolean = true;
  saving: boolean = false;

  // This will hold all available asset types for the dropdown
  availableAssetTypes: string[] = [];
  // This form control will hold the *selected* asset types
  chosenAssetTypes = new FormControl<string[]>([]);

  missingAttributionUrl = new FormControl("");
  billingUrl = new FormControl("");

  constructor(
    private _snackBar: MatSnackBar,
    private configService: ConfigurationsService, // Corrected service name
  ) {}

  ngOnInit(): void {
    this.loadConfigurations();
  }

  loadConfigurations() {
    this.loading = true;

    forkJoin({
      config: this.configService.fetchConfigurations(),
      allTypes: this.configService.assetTypes(),
    })
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: ({ config, allTypes }) => {
          // Set all available types for the dropdown
          this.availableAssetTypes = allTypes;

          // Set the currently selected types from the fetched configuration
          this.chosenAssetTypes.setValue(config.asset_types || []);

          // Set the report URLs from the fetched configuration
          this.missingAttributionUrl.setValue(
            config.missing_attribution_report_url || "",
          );
          this.billingUrl.setValue(config.billing_report_url || "");

          console.log("Configurations and Asset Types loaded:", {
            config,
            allTypes,
          });
        },
        error: (err) => {
          console.error("Error loading configurations or asset types:", err);
          this._snackBar.open(
            "Failed to load configurations. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }

  saveConfigurations() {
    const configToSave = {
      asset_types: this.chosenAssetTypes.value || [],
      missing_attribution_report_url: this.missingAttributionUrl.value || "",
      billing_report_url: this.billingUrl.value || "",
    };

    this.saving = true;

    this.configService
      .saveConfigurations(configToSave)
      .pipe(
        finalize(() => {
          this.saving = false;
        }),
      )
      .subscribe({
        next: () => {
          this._snackBar.open("Configurations saved successfully!", "Close", {
            duration: 3000,
          });
        },
        error: (err) => {
          this._snackBar.open(
            "Failed to save configurations. Please try again.",
            "Close",
            {
              duration: 5000,
            },
          );
        },
      });
  }
}
