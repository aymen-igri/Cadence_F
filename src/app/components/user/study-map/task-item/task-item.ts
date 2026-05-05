import { Component, computed, inject, input, signal } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { CommonModule } from '@angular/common';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { Task } from '@app/core/models/goal.model';
import { TaskFormDialogComponent } from '../task-form-dialog/task-form-dialog';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { GoalService } from '@app/core/services/goal.service';
import { AlertService } from '@app/components/shared/alert/alert.service';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    CommonModule,
    HlmButtonImports,
    NgIconsModule,
    HlmBadgeImports,
    HlmCheckboxImports,
    HlmDropdownMenuImports,
    TaskFormDialogComponent,
  ],
  templateUrl: './task-item.html',
})
export class TaskItemComponent {
  private goalService = inject(GoalService);
  private alertService = inject(AlertService);
  task = input.required<Task>();
  completed = computed(() => this.task().status == 'COMPLETED');
  updateTaskDialogState = signal<'closed' | 'open'>('closed');

  toggleCompletion() {}

  readonly deleteTaskMutation = createMutation({
    mutationFn: (taskId: string) => this.goalService.deleteTask(taskId),
    onSuccess: () => {
      toast.success('Task deleted', {
        description: 'The task has been removed from your goal.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete task', {
        description: error,
      });
      console.error('Failed to delete task :', error);
    },
  });

  onDeleteTask(taskId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this task?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteTaskMutation.mutate(taskId);
      },
    });
  }
}
