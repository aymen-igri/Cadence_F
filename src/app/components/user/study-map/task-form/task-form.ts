import { Component, inject, input, signal } from '@angular/core';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CreateGoalTask } from '@app/core/models/goal.model';
import { GoalService } from '@app/core/services/goal.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [HlmLabelImports, HlmInputImports, FormRoot, FormField, HlmButtonImports],
  templateUrl: './task-form.html',
})
export class TaskFormComponent {
  private goalService = inject(GoalService);
  taskModel = signal<CreateGoalTask>({ title: '', description: '', status: 'PENDING' });
  readonly goalId = input.required<string>();

  readonly createTaskMutation = createMutation({
    mutationFn: (payload: CreateGoalTask) => this.goalService.createGoalTask(payload, this.goalId()),
    onSuccess: () => {
      toast.success('Task created successfully', {
        description: 'The new task has been added to your goal.',
      });
    },
    onError: (error) => {
      toast.error('Failed to create task', {
        description: error,
      });
      console.error('Error creating task', error);
    },
  })

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
          this.createTaskMutation.mutate(payload);
        }
      }
    }
  )
}
