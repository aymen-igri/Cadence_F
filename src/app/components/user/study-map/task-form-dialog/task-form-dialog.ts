import { Component, effect, inject, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CreateGoalTask, Task } from '@app/core/models/goal.model';
import { GoalService } from '@app/core/services/goal.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-task-form-dialog',
  templateUrl: './task-form-dialog.html',
  imports: [
    FormField,
    FormRoot,
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    HlmDialogImports,
  ],
})
export class TaskFormDialogComponent {
  private goalService = inject(GoalService);
  taskModel = signal<CreateGoalTask>({ title: '', description: '', status: 'PENDING' });
  readonly goalId = input<string>('');
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  task = input<Task>();

  constructor() {
    effect(() => {
      const existing = this.task();
      if (existing) {
        this.taskModel.set({
          title: existing.title,
          description: existing.description,
          status: existing.status,
        });
      }
    });
  }

  readonly createTaskMutation = createMutation({
    mutationFn: (payload: CreateGoalTask) =>
      this.goalService.createGoalTask(payload, this.goalId()),
    onSuccess: () => {
      toast.success('Task created successfully', {
        description: 'The new task has been added to your goal.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: error,
      });
      console.error('Error creating task', error);
    },
  });

  readonly updateTaskMutation = createMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateGoalTask> }) =>
      this.goalService.updateTask(id, payload),
    onSuccess: () => {
      toast.success('Task updated successfully', {
        description: 'Your task details have been updated.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (err) => {
      toast.error('Failed to update task', {
        description: 'An error occurred while updating the task. Please try again.',
      });
      console.error('Failed to update task', err);
    },
  });

  taskForm = form(
    this.taskModel,
    (schema) => {
      required(schema.title, { message: 'Task title is required' });
      required(schema.description, { message: 'Task description is required' });
      required(schema.status, { message: 'Task status is required' });
    },
    {
      submission: {
        action: async () => {
          const payload = this.taskModel();
          const existing = this.task();
          if (existing) {
            this.updateTaskMutation.mutate({ id: existing.id, payload });
          } else {
            this.createTaskMutation.mutate(payload);
          }
        },
      },
    },
  );
  onStateChange(event: 'closed' | 'open') {
    this.dialogStateChange.emit(event);
  }

  closeDialog(ctx: any) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }
}
