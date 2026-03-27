import { Component } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [HlmLabelImports, HlmInputImports],
  template: `
    <div class="grid gap-6">
      <div class="grid gap-2.5">
        <label hlmLabel for="task-title">Task title</label>
        <input hlmInput id="task-title" placeholder="e.g. Read Chapter 1" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="task-description">Description</label>
        <input hlmInput id="task-description" placeholder="Optional details..." />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="task-duration">Estimated duration (mins)</label>
        <input hlmInput id="task-duration" type="number" placeholder="e.g. 45" />
      </div>
    </div>
  `,
})
export class TaskFormComponent {}
