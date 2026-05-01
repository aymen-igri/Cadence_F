import {
  Component,
  input,
  output,
  signal,
  inject,
} from '@angular/core';
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
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { Goal } from '@app/core/models/goal.model';
import { GoalService } from '@app/core/services/goal.service';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { GoalFormDialogComponent } from "../goal-form-dialog/goal-form-dialog";
import { TaskFormDialogComponent } from "../task-form-dialog/task-form-dialog";

@Component({
  selector: 'app-goal-item',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    LucideAngularModule,
    HlmBadgeImports,
    TaskItemComponent,
    HlmDropdownMenuImports,
    HlmProgressImports,
    GoalFormDialogComponent,
    TaskFormDialogComponent
],
  templateUrl: './goal-item.html',
})
export class GoalItemComponent {
  goalService = inject(GoalService);
  private alertService = inject(AlertService);
  goal = input.required<Goal>();
  isExpanded = input<boolean>(false);
  toggleExpand = output<void>();
  tasks = this.goalService.allTasks.data;
  isLoadingTasks = this.goalService.allTasks.isLoading;
  updateGoalDialogState = signal<'closed' | 'open'>('closed');
  SubjectName = input<string>('');
  createTaskDialogState = signal<'closed' | 'open'>('closed');

  ngOnInit() {
    this.goalService.loadAllTasks(this.goal().id).subscribe();
  }

  protected ChevronDown = ChevronDown;
  protected ChevronRight = ChevronRight;
  protected MoreVertical = MoreVertical;
  protected Plus = Plus;
  protected Calendar = Calendar;
  protected Clock = Clock;

  readonly deleteGoalMutation = createMutation({
    mutationFn: (goalId: string) => this.goalService.deleteGoal(goalId),
    onSuccess: () => {
      toast.success('Goal deleted', {
        description: 'The goal has been removed from your study map.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete goal', {
        description: error,
      });
      console.error('Failed to delete goal :', error);
    },
  });

  onDeleteGoal(goalId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this goal?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteGoalMutation.mutate(goalId);
      },
    });
  }
}
