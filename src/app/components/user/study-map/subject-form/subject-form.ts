import { Component } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-subject-form',
  standalone: true,
  imports: [HlmLabelImports, HlmInputImports],
  template: `
    <div class="grid gap-6">
      <div class="grid gap-2.5">
        <label hlmLabel for="subject-name">Subject name</label>
        <input hlmInput id="subject-name" placeholder="e.g. Mathematics" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="subject-description">Description</label>
        <input hlmInput id="subject-description" placeholder="Optional short note" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="subject-priority">Priority</label>
        <select
          id="subject-priority"
          class="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm text-foreground"
        >
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>
    </div>
  `,
})
export class SubjectFormComponent {}
