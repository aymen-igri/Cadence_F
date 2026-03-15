import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-goals-header',
  standalone: true,
  imports: [
    HlmButtonImports,
    HlmSheetImports,
    HlmLabelImports,
    HlmInputImports,
    HlmSelectImports,
    LucideAngularModule,
  ],
  templateUrl: './goals-header.html',
})
export class GoalsHeaderComponent {
  protected Plus = Plus;
}
