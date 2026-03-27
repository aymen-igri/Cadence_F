import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SubjGoal } from '../../../../pages/user/study-map/study-map';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  LucideAngularModule,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Plus,
  Calendar,
  Clock,
} from 'lucide-angular';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { CommonModule } from '@angular/common';
import { TaskItemComponent } from '../task-item/task-item';
import { HlmSheetImports } from '@spartan-ng/helm/sheet';
import { TaskFormComponent } from '../task-form/task-form';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';

@Component({
  selector: 'app-goal-item',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    LucideAngularModule,
    HlmBadgeImports,
    TaskItemComponent,
    HlmSheetImports,
    TaskFormComponent,
    HlmDropdownMenuImports,
    HlmProgressImports,
  ],
  templateUrl: './goal-item.html',
})
export class GoalItemComponent {
  @Input() goal!: SubjGoal;
  @Input() isExpanded: boolean = false;
  @Output() toggleExpand = new EventEmitter<void>();

  protected ChevronDown = ChevronDown;
  protected ChevronRight = ChevronRight;
  protected MoreVertical = MoreVertical;
  protected Plus = Plus;
  protected Calendar = Calendar;
  protected Clock = Clock;
}
