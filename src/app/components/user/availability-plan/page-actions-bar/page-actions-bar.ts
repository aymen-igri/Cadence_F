import { Component, output } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-page-actions-bar',
  standalone: true,
  templateUrl: './page-actions-bar.html',
  imports: [HlmButtonImports],
})
export class PageActionsBarComponent {
  onReset = output<void>();
  onSave = output<void>();
}
