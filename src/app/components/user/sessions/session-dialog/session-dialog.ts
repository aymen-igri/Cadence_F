import { Component, effect, inject, input, output, signal } from '@angular/core';
import { applyEach, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
  CreateWeeklySessionResponse,
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
  readonly timeSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
    '20:00',
  ];
  session = input<CreateSessionResponse>();
  sessionModel = signal<CreateSessionRequest>({
    weeklySession: {
      title: '',
      weekYear: new Date().getFullYear(),
      weekNumber: 0,
    },
    subSessions: [
      {
        dayOfWeek: 'MONDAY',
        startTime: '',
        endTime: '',
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
        const ws = existing.weeklySession as CreateWeeklySessionResponse;
        // backend provides `weekYear` and `weekNumber`
        const { weekYear, weekNumber } = ws;
        // set display label based on weekYear/weekNumber
        const weekStart = this.isoWeekStartFromYearAndNumber(weekYear, weekNumber);
        const label = weekStart
          ? `Week of ${weekStart.toLocaleString(undefined, { month: 'long' })} ${weekStart.getDate()}`
          : '';
        if (weekStart) {
          this.selectedWeekStart.set(weekStart);
          this.displayWeekLabel.set(label);
        }
        this.sessionModel.set({
          weeklySession: {
            title: existing.weeklySession.title,
            weekYear,
            weekNumber,
          },
          subSessions: existing.subSessions.map((sub) => ({
            dayOfWeek: sub.dayOfWeek,
            startTime: sub.startTime ? String(sub.startTime).slice(0, 5) : '',
            endTime: sub.endTime ? String(sub.endTime).slice(0, 5) : '',
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
    onError: (error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status === 409) {
        toast.error('A session already exists for the selected week.');
      } else if (status === 400) {
        toast.error('Cannot create a session for a past week.');
      } else {
        toast.error('Session Creation failed', { description: String(error) });
      }
    },
  });

  updateSessionMutation = createMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSessionRequest }) =>
      this.sessionService.updateSession(id, payload),
    onSuccess: () => {
      toast.success('Session Updated Successfully');
      this.dialogStateChange.emit('closed');
    },
    onError: (error: unknown) => {
      const status = (error as { status?: number })?.status;
      if (status === 409) {
        toast.error('A session already exists for the selected week.');
      } else if (status === 400) {
        toast.error('Cannot select a past week.');
      } else {
        toast.error('Session Update failed', { description: String(error) });
      }
    },
  });

  sessionForm = form(
    this.sessionModel,
    (schema) => {
      required(schema.weeklySession.weekYear, { message: 'Week is required' });
      required(schema.weeklySession.weekNumber, { message: 'Week is required' });
      required(schema.weeklySession.title, { message: 'Week session title is required' });
      minLength(schema.subSessions, 1, { message: 'At least one sub session is required' });
      applyEach(schema.subSessions, (subSession) => {
        required(subSession.dayOfWeek, { message: 'Day of week is required' });
        required(subSession.startTime, { message: 'Sub session start time is required' });
        required(subSession.endTime, { message: 'Sub session end time is required' });
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

  // --- Week picker state & helpers ---
  currentMonth = signal(new Date());
  selectedWeekStart = signal<Date | null>(null);
  displayWeekLabel = signal('');

  // plannedWeeks set derived from existing sessions
  plannedWeeks = this.sessionService.allSessions.data;

  // compute weeks for currentMonth: array of Date (monday start)
  weeksForMonth(month: Date) {
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstOfMonth = new Date(year, m, 1);
    // get monday of the week that contains the 1st
    const day = firstOfMonth.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() + diffToMonday);
    const weeks: Date[] = [];
    let cursor = new Date(start);
    while (cursor.getMonth() <= m || cursor.getMonth() === m - 1) {
      weeks.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
      // safety break
      if (weeks.length > 8) break;
    }
    return weeks;
  }

  // ISO week number + year and weekStart (monday) and label
  getWeekYearAndNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // ISO week date weeks start on Monday, week 1 is the week with the first Thursday
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const weekYear = d.getUTCFullYear();

    // monday start of this ISO week relative to original date
    const local = new Date(date);
    const ld = local.getDay() || 7;
    const monday = new Date(local);
    monday.setDate(local.getDate() - (ld - 1));

    const label = `Week of ${monday.toLocaleString(undefined, { month: 'long' })} ${monday.getDate()}`;

    return { weekYear, weekNumber: weekNo, weekStart: monday, label };
  }

  isPastWeek(weekStart: Date) {
    const today = new Date();
    // determine start of current ISO week (monday)
    const td = today.getDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - (td - 1));
    // if weekStart < currentMonday => past
    return weekStart.setHours(0, 0, 0, 0) < currentMonday.setHours(0, 0, 0, 0);
  }

  isPlannedWeek(weekStart: Date) {
    const info = this.getWeekYearAndNumber(weekStart);
    const planned = this.sessionService.allSessions.data();
    return planned.some((s) => {
      const ws = s.weeklySession as CreateWeeklySessionResponse;
      return ws.weekYear === info.weekYear && ws.weekNumber === info.weekNumber;
    });
  }

  prevMonth() {
    const c = new Date(this.currentMonth());
    c.setMonth(c.getMonth() - 1);
    this.currentMonth.set(c);
  }

  nextMonth() {
    const c = new Date(this.currentMonth());
    c.setMonth(c.getMonth() + 1);
    this.currentMonth.set(c);
  }

  selectWeek(weekStart: Date) {
    if (this.isPastWeek(weekStart)) return;
    const info = this.getWeekYearAndNumber(weekStart);
    // update model
    this.sessionModel.update((m) => ({
      ...m,
      weeklySession: {
        ...m.weeklySession,
        weekYear: info.weekYear,
        weekNumber: info.weekNumber,
      },
    }));
    this.selectedWeekStart.set(info.weekStart);
    this.displayWeekLabel.set(info.label);
  }

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

  closeDialog(ctx: { close: () => void }) {
    this.dialogStateChange.emit('closed');
    ctx.close();
  }

  // compute monday date for an ISO week year+number
  isoWeekStartFromYearAndNumber(weekYear: number, weekNumber: number): Date | null {
    if (!weekYear || !weekNumber) return null;
    const jan4 = new Date(Date.UTC(weekYear, 0, 4));
    const day = jan4.getUTCDay() || 7;
    const mondayOfWeek1 = new Date(jan4);
    mondayOfWeek1.setUTCDate(jan4.getUTCDate() - (day - 1));
    const target = new Date(mondayOfWeek1);
    target.setUTCDate(mondayOfWeek1.getUTCDate() + (weekNumber - 1) * 7);
    return new Date(target.getUTCFullYear(), target.getUTCMonth(), target.getUTCDate());
  }
}
