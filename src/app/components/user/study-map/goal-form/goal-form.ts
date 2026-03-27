import { Component } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';

@Component({
  selector: 'app-goal-form',
  standalone: true,
  imports: [HlmLabelImports, HlmInputImports],
  template: `
    <div class="grid gap-6">
      <div class="grid gap-2.5">
        <label hlmLabel for="goal-title">Goal title</label>
        <input hlmInput id="goal-title" placeholder="e.g. Master linear algebra" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="goal-hours">Target hours per week</label>
        <input hlmInput id="goal-hours" type="number" placeholder="e.g. 5" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="goal-deadline">Deadline</label>
        <input hlmInput id="goal-deadline" type="date" />
      </div>

      <div class="grid gap-2.5">
        <label hlmLabel for="goal-subject">Subject</label>
        <!-- Pre-selected subject dropdown (disabled or shown as read-only) -->
        <input
          hlmInput
          id="goal-subject"
          value="Pre-selected Subject Name"
          disabled
          class="bg-muted text-muted-foreground"
        />
      </div>
    </div>
  `,
})
export class GoalFormComponent {}
