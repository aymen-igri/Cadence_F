import { Component } from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-subjects-header',
  imports: [LucideAngularModule, ...HlmButtonImports],
  templateUrl: './subjects-header.html',
})
export class SubjectsHeader {
  readonly Plus = Plus;
}
