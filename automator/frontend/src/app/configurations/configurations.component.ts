import { Component } from "@angular/core";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: "app-configurations",
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./configurations.component.html",
  styleUrl: "./configurations.component.scss",
})
export class ConfigurationsComponent {
  chosenAssetTypes = new FormControl("");
  assetTypes: string[] = ["Project", "Compute Engine", "Big Query"];
}
