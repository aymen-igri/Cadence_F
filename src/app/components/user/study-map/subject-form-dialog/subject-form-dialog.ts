import { Component, effect, inject, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, required } from '@angular/forms/signals';
import {
  CreateSubjectRequest,
  SubjectModel,
  SubjectPriority,
  UpdateSubjectRequest,
} from '@app/core/models/subject.model';
import { SubjectService } from '@app/core/services/subject.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-subject-form-dialog',
  templateUrl: './subject-form-dialog.html',
  imports: [HlmButtonImports, HlmDialogImports,HlmInputImports,HlmLabelImports, FormRoot, FormField],
})
export class SubjectFormDialogComponent {
  subject = input<SubjectModel>();
  subjectModel = signal<CreateSubjectRequest>({
    name: '',
    description: '',
    priority: SubjectPriority.LOW,
  });
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  private readonly subjectService = inject(SubjectService);

  constructor() {
    effect(() => {
      const existing = this.subject();
      if (existing) {
        this.subjectModel.set({
          name: existing.name,
          description: existing.description,
          priority: existing.priority,
        });
      }
    });
  }

  readonly createSubjectMutation = createMutation({
    mutationFn: (payload: CreateSubjectRequest) => this.subjectService.createSubject(payload),
    onSuccess: () => {
      toast.success('Subject created successfully', {
        description: 'The new subject has been added to your study map.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (err) => {
      toast.error('Failed to create subject', {
        description: 'An error occurred while creating the subject. Please try again.',
      });
      console.error('Failed to create subject', err);
    },
  });

  readonly updateSubjectMutation = createMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSubjectRequest }) =>
      this.subjectService.updateSubject(id, payload),
    onSuccess: () => {
      toast.success('Subject updated successfully', {
        description: 'Your subject details have been updated.',
      });
      this.dialogStateChange.emit('closed');
    },
    onError: (err) => {
      toast.error('Failed to update subject', {
        description: 'An error occurred while updating the subject. Please try again.',
      });
      console.error('Failed to update subject', err);
    },
  });

  subjectForm = form(
    this.subjectModel,
    (schema) => {
      required(schema.name, { message: 'Subject name is required' });
      required(schema.priority, { message: 'Subject priority is required' });
    },
    {
      submission: {
        action: async () => {
          const payload = this.subjectModel();
          const existing = this.subject();

          if (existing) {
            this.updateSubjectMutation.mutate({ id: existing.id, payload });
          } else {
            this.createSubjectMutation.mutate(payload);
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
