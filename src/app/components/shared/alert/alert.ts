import { Component, inject } from "@angular/core";
import { AlertService } from "./alert.service";
import { LucideAngularModule, TriangleAlert } from "lucide-angular";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmButtonImports } from "@spartan-ng/helm/button";

@Component({
  selector: 'app-global-alert',
  templateUrl: './alert.html',
  imports: [LucideAngularModule, HlmAlertImports, HlmButtonImports],
})
export class GlobalAlertComponent {
  readonly TriangleAlert = TriangleAlert;
  alertService = inject(AlertService);

  onAction() {
    this.alertService.triggerAction();
  }
}