import { Component } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../environments/environment";
import { ConfigurationsService } from "../core/model/ConfigurationService";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [],
  templateUrl: "./reports.component.html",
  styleUrl: "./reports.component.scss",
})
export class ReportsComponent {
  error: string | undefined;
  url: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private service: ConfigurationsService,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.error = undefined;

      const reportType = params.get("reportType");
      const dashboards: { [key: string]: string } = environment.dashboards;

      // The path string must be present in the environment config file
      if (reportType == null || !dashboards[reportType]) {
        this.error = "Dashboard not found.";
        return;
      }

      this.service.fetchConfigurations().subscribe((configs) => {
        const report_url = configs.report_urls[dashboards[reportType]];

        // Get the correct report URL from the configurations
        if (!report_url)
          this.error =
            "Dashboard not configured - set it up on configurations page.";
        else
          this.url = this.sanitizer.bypassSecurityTrustResourceUrl(report_url);
      });
    });
  }
}
