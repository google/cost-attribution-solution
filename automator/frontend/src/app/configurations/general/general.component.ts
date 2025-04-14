import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

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
  chosenAssetTypes = new FormControl("");
  assetTypes: string[] = ["Project", "Compute Engine", "Big Query"];
}
