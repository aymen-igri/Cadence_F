import { Component, output, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { AvailabilityService } from '@app/core/services/availability.service';
import { GoalProgressInfo } from '@app/core/models/weekly-plan.model';

@Component({
  selector: 'app-generate-week-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmCheckboxImports,
  ],
  templateUrl: './generate-week-dialog.html',
})
export class GenerateWeekDialogComponent {
  availabilityService = inject(AvailabilityService);

  availableGoals = input.required<GoalProgressInfo[]>();

  generate = output<{ selectedGoalIds: string[]; sessionDuration: number }>();
  state = input<'open' | 'closed'>('closed');
  dialogStateChange = output<'open' | 'closed'>();

  selectedGoals: string[] = [];
  sessionDuration: number = 90;

  ngOnChanges() {
    // Select all available by default when updated
    if (this.availableGoals()?.length && this.selectedGoals.length === 0) {
      this.selectedGoals = this.availableGoals().map((g) => g.id);
    }
  }

  onStateChange(newState: 'open' | 'closed') {
    if (newState === 'closed') {
      this.dialogStateChange.emit('closed');
    }
  }

  close() {
    this.dialogStateChange.emit('closed');
  }

  isSelected(id: string) {
    return this.selectedGoals.includes(id);
  }

  toggleGoal(id: string) {
    if (this.isSelected(id)) {
      this.selectedGoals = this.selectedGoals.filter((g) => g !== id);
    } else {
      this.selectedGoals = [...this.selectedGoals, id];
    }
  }

  generatePlan() {
    this.generate.emit({
      selectedGoalIds: this.selectedGoals,
      sessionDuration: this.sessionDuration,
    });
    this.close();
  }
}
