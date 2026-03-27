import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SubjDoc, SubjGoal } from '../../../../pages/user/study-map/study-map';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, ChevronDown, ChevronRight, MoreVertical, Plus } from 'lucide-angular';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { CommonModule } from '@angular/common';
import { GoalItemComponent } from '../goal-item/goal-item';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { GoalFormComponent } from '../goal-form/goal-form';

@Component({
  selector: 'app-subject-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmButtonImports,
    LucideAngularModule,
    HlmBadgeImports,
    HlmDropdownMenuImports,
    GoalItemComponent,
    HlmSheetImports,
    GoalFormComponent,
  ],
  templateUrl: './subject-card.html',
})
export class SubjectCardComponent {
  @Input() subject!: SubjDoc;
  @Input() isExpanded: boolean = false;
  @Output() toggleExpand = new EventEmitter<void>();

  protected ChevronDown = ChevronDown;
  protected ChevronRight = ChevronRight;
  protected MoreVertical = MoreVertical;
  protected Plus = Plus;

  expandedGoalId: string | null = null;

  toggleGoal(goalId: string) {
    if (this.expandedGoalId === goalId) {
      this.expandedGoalId = null;
    } else {
      this.expandedGoalId = goalId;
    }
  }

  getBorderColor() {
    switch (this.subject.priority) {
      case 'HIGH':
        return 'border-l-destructive';
      case 'MEDIUM':
        return 'border-l-amber-500';
      case 'LOW':
        return 'border-l-blue-500';
      default:
        return 'border-l-border';
    }
  }

  getBadgeVariant() {
    switch (this.subject.priority) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'default';
    }
  }
}
