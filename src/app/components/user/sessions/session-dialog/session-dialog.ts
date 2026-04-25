import { Component, inject, input, output, signal } from '@angular/core';
import { form, FormField, FormRoot, required, schema } from '@angular/forms/signals';
import { CreateSessionRequest } from '@app/core/models/session.model';
import { SessionService } from '@app/core/services/session.service';
import { SubjectService } from '@app/core/services/subject.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-session-dialog',
  templateUrl: './session-dialog.html',
  imports: [
    FormField,
    FormRoot,
    HlmDialogImports,
    HlmButtonImports,
    HlmLabelImports,
    HlmInputImports,
  ],
})
export class SessionDialogComponent {
  private subjectService = inject(SubjectService);
  private sessionService = inject(SessionService);
  session = input<CreateSessionRequest>();
  sessionModel = signal<CreateSessionRequest>({
    weeklySession: {
      title: '',
      startTime: '',
      status: 'PENDING',
    },
    subSessions: [
      {
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: '',
        status: 'PENDING',
        subjectId: '',
      },
    ],
  });
  state = input.required<'closed' | 'open'>();
  dialogStateChange = output<'closed' | 'open'>();
  subjects = this.subjectService.allSubjects.data;

  ngOnInit() {
    this.subjectService.loadAllSubjects().subscribe();
  }

  createSessionMutation = createMutation({
    mutationFn: (payload: CreateSessionRequest) => this.sessionService.createSession(payload),
    onSuccess: () => {
      toast.success('Session Created Successfully');
      this.dialogStateChange.emit('closed');
    },
    onError: (error) => {
      toast.error('Session Creation failed', { description: error });
    },
  });

  sessionForm = form(
    this.sessionModel,
    (schema) => {
      required(schema.weeklySession.startTime, { message: 'Week session start time is required' });
      required(schema.weeklySession.status, { message: 'Week session status is required' });
      required(schema.weeklySession.title, { message: 'Week session title is required' });
    },
    {
      submission: {
        action: async () => {
          const payload = this.sessionModel();
          console.log('PAYLOAD', payload)
          this.createSessionMutation.mutate(payload);
        },
      },
    },
  );

  addSubSession() {
    this.sessionModel.update((model) => ({
      ...model,
      subSessions: [
        ...model.subSessions,
        {
          dayOfWeek: 'MONDAY',
          startTime: '',
          endTime: '',
          status: 'PENDING',
          subjectId: '',
        },
      ],
    }));
  }

  removeSubSession(index: number) {
    this.sessionModel.update((model) => {
      if (model.subSessions.length <= 1) return model;
      const subSessions = [...model.subSessions];
      subSessions.splice(index, 1);
      return { ...model, subSessions };
    });
  }

  onStateChange(event: 'closed' | 'open') {
    this.dialogStateChange.emit(event);
  }

  closeDialog(ctx: any) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }
}
