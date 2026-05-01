import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { GoalProgressInfo } from '@app/core/models/weekly-plan.model';

@Component({
  selector: 'app-weekly-summary',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmProgressImports],
  templateUrl: './weekly-summary.html',
})
export class WeeklySummaryComponent {
  goals = input.required<GoalProgressInfo[]>();

  getProgressValue(goal: GoalProgressInfo): number {
    if (goal.targetHoursPerWeek === 0) return 0;
    const val = (goal.hoursPlannedCurrentWeek / goal.targetHoursPerWeek) * 100;
    return val > 100 ? 100 : val;
  }
}
