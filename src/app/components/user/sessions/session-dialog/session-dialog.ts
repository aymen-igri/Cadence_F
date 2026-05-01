import { Component, effect, inject, input, output, signal } from '@angular/core';
import { applyEach, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
} from '@app/core/models/session.model';
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
  session = input<CreateSessionResponse>();
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

  constructor() {
    effect(() => {
      const existing = this.session();
      if (existing) {
        this.sessionModel.set({
          weeklySession: {
            title: existing.weeklySession.title,
            startTime: existing.weeklySession.startTime,
            status: existing.weeklySession.sessionStatus,
          },
          subSessions: existing.subSessions.map((sub) => ({
            dayOfWeek: sub.dayOfWeek,
            startTime: sub.startTime,
            endTime: sub.endTime,
            status: sub.status,
            subjectId: sub.subjectId,
          })),
        });
      }
    });
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

  updateSessionMutation = createMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionRequest }) =>
      this.sessionService.updateSession(id, payload),
    onSuccess: () => {
      toast.success('Session Updated Successfully');
      this.dialogStateChange.emit('closed');
    },
    onError: (error) => {
      toast.error('Session Update failed', { description: error });
    },
  });

  sessionForm = form(
    this.sessionModel,
    (schema) => {
      required(schema.weeklySession.startTime, { message: 'Week session start time is required' });
      required(schema.weeklySession.status, { message: 'Week session status is required' });
      required(schema.weeklySession.title, { message: 'Week session title is required' });
      minLength(schema.subSessions, 1, { message: 'At least one sub session is required' });
      applyEach(schema.subSessions, (subSession) => {
        required(subSession.dayOfWeek, { message: 'Day of week is required' });
        required(subSession.startTime, { message: 'Sub session start time is required' });
        required(subSession.endTime, { message: 'Sub session end time is required' });
        required(subSession.status, { message: 'Sub session status is required' });
        required(subSession.subjectId, { message: 'Subject is required' });
      });
    },
    {
      submission: {
        action: async () => {
          const payload = this.sessionModel();
          const existing = this.session();
          if (existing) {
            console.log(
              'Updating session with id:',
              existing.weeklySession.id,
              'and payload:',
              payload,
            );
            this.updateSessionMutation.mutate({ id: existing.weeklySession.id, payload });
          } else {
            console.log('Creating session with payload:', payload);
            this.createSessionMutation.mutate(payload);
          }
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
