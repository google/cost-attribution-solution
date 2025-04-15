import { Component } from '@angular/core';
import { LabelPolicyComponent } from './label-policy/label-policy.component';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { GeneralComponent } from './general/general.component';

@Component({
  selector: 'app-configurations',
  standalone: true,
  imports: [
    MatIconModule,
    MatTabsModule,

    // Components in the tabs
    GeneralComponent,
    LabelPolicyComponent,
  ],
  templateUrl: './configurations.component.html',
  styleUrl: './configurations.component.scss',
})
export class ConfigurationsComponent {}
