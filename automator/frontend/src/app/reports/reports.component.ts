import { Component } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-reports",
  standalone: true,
  imports: [],
  templateUrl: "./reports.component.html",
  styleUrl: "./reports.component.sass",
})
export class ReportsComponent {
  error: string | undefined;
  url: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.error = undefined;
      const reportType = params.get("reportType");
      const dashboards: { [key: string]: string } = environment.dashboards;

      if (reportType == null || !dashboards[reportType])
        this.error = "Dashboard not found.";
      else
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          dashboards[reportType],
        );
    });
  }
}
