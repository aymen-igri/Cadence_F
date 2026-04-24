import { Component, effect, inject, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import { CreateGoalRequest, Goal, UpdateGoalRequest } from '@app/core/models/goal.model';
import { GoalService } from '@app/core/services/goal.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { LucideAngularModule, Plus } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
@Component({
  selector: 'app-goal-form-dialog',
  standalone: true,
  imports: [
    HlmLabelImports,
    HlmInputImports,
    HlmButtonImports,
    LucideAngularModule,
    FormRoot,
    FormField,
    HlmDialogImports,
  ],
  templateUrl: './goal-form-dialog.html',
})
export class GoalFormDialogComponent {
  protected Plus = Plus;
  readonly SubjectName = input<string>();
  readonly subjectId = input<string>('');
  readonly goal = input<Goal>();
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();

  private goalService = inject(GoalService);

  constructor() {
    effect(() => {
      const existing = this.goal();
      if (existing) {
        this.goalModel.set({
          title: existing.title,
          targetHoursPerWeek: existing.targetHoursPerWeek,
          deadline: new Date(existing.deadline),
          progress: existing.progress,
        });
      }
    });
  }

  goalModel = signal<CreateGoalRequest>({
    title: '',
    targetHoursPerWeek: 0,
    deadline: new Date(),
    progress: 0,
  });

  readonly createGoalMutation = createMutation({
    mutationFn: (payload: CreateGoalRequest) =>
      this.goalService.createSubjectGoal(payload, this.subjectId()),
    onSuccess: () => {
      toast.success('Goal created successfully', {
        description: 'The new goal has been added to your subject.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (error) => {
      toast.error('Failed to create goal', {
        description: error,
      });
      console.error('Failed to create goal :', error);
    },
  });

  readonly updateGoalMutation = createMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateGoalRequest }) =>
      this.goalService.updateGoal(id, payload),
    onSuccess: () => {
      toast.success('Goal updated successfully', {
        description: 'Your goal details have been updated.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (error) => {
      toast.error('Failed to update goal', {
        description: error,
      });
      console.error('Failed to update goal :', error);
    },
  });

  goalForm = form(
    this.goalModel,
    (schema) => {
      required(schema.title);
      required(schema.targetHoursPerWeek);
      required(schema.deadline);
    },
    {
      submission: {
        action: async () => {
          const payload = this.goalModel();
          const existing = this.goal();

          if (existing) {
            this.updateGoalMutation.mutate({ id: existing.id, payload });
          } else {
            this.createGoalMutation.mutate(payload);
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
