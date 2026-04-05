import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, ServerCrash } from 'lucide-angular';

@Component({
  selector: 'app-server-error',
  standalone: true,
  imports: [HlmButtonImports, LucideAngularModule],
  templateUrl: './server-error.html',
})
export class ServerErrorPage {
  private location = inject(Location);
  readonly ServerCrash = ServerCrash;

  goBack() {
    this.location.back();
  }
}
