import {
  Component,
  effect,
  output,
  input,
  inject,
  signal,
  computed,
  DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { applyEach, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import {
  CreateWeeklySessionResponse,
  GenerateSessionModel,
  GenerateSessionRequest,
} from '@app/core/models/session.model';
import { Goal } from '@app/core/models/goal.model';
import { SubjectService } from '@app/core/services/subject.service';
import { GoalService } from '@app/core/services/goal.service';
import { AvailabilityPlanService } from '@app/core/services/availability-plan.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { SessionService } from '@app/core/services/session.service';
import { toast } from 'ngx-sonner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingSpinnerComponent } from "@app/components/shared/loading-spinner/loading-spinner.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-generate-week-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HlmDialogImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmCheckboxImports,
    FormField,
    FormRoot,
    LoadingSpinnerComponent,
  ],
  templateUrl: './generate-week-dialog.html',
})
export class GenerateWeekDialogComponent {
  private sessionService = inject(SessionService);
  private subjectService = inject(SubjectService);
  private goalService = inject(GoalService);
  private availabilityService = inject(AvailabilityPlanService);
  private destroyRef = inject(DestroyRef);

  subjects = this.subjectService.allSubjects.data;
  availabilityPlans = this.availabilityService.allAvailabilityPlans.data;
  isLoadingSubjects = this.subjectService.allSubjects.isLoading;
  isLoadingAvailabiltyPlans = this.availabilityService.allAvailabilityPlans.isLoading;
  goalsBySubject = signal<Map<string, Goal[]>>(new Map());

  state = input<'open' | 'closed'>('closed');
  dialogStateChange = output<'open' | 'closed'>();

  sessionModel = signal<GenerateSessionModel>({
    title: '',
    weekYear: new Date().getFullYear(),
    weekNumber: 0,
    availabilityPlanID: '',
    usePriority: false,
    subjectGoalPairs: [
      {
        subjectId: '',
        selectedGoalIds: [],
      },
    ],
  });

  generateSessionMutation = createMutation({
    mutationFn: (payload: GenerateSessionRequest) =>
      this.sessionService.generateWeeklyPlan(payload),
    onSuccess: () => {
      toast.success('Generated session successfully:');
    },
    onError: (error) => {
      toast.error('Error generating session:', { description: error });
    },
  });

  sessionForm = form(
    this.sessionModel,
    (schema) => {
      required(schema.title, { message: 'Title is required' });
      required(schema.weekYear, { message: 'Week year is required' });
      required(schema.weekNumber, { message: 'Week number is required' });
      required(schema.availabilityPlanID, { message: 'Availability plan is required' });
      minLength(schema.subjectGoalPairs, 1, { message: 'At least one subject is required' });
      applyEach(schema.subjectGoalPairs, (pair) => {
        required(pair.subjectId, { message: 'Subject is required' });
        minLength(pair.selectedGoalIds, 1, { message: 'At least one goal must be selected' });
      });
    },
    {
      submission: {
        action: async () => {
          const model = this.sessionModel();
          const request = this.mapFormToRequest(model);
          console.log('Submitting session generation with request:', request);
          this.generateSessionMutation.mutate(request);
          this.dialogStateChange.emit('closed');
        },
      },
    },
  );

  ngOnInit() {
    this.subjectService.loadAllSubjects().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.availabilityService
      .loadAllAvailabilityPlans()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
    this.sessionService.loadAllSessions().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
  }

  constructor() {
    effect(() => {
      // Watch for subject changes and load goals
      const pairs = this.sessionModel().subjectGoalPairs;
      pairs.forEach((pair) => {
        if (pair.subjectId && !this.goalsBySubject().has(pair.subjectId)) {
          this.loadGoalsForSubject(pair.subjectId);
        }
      });
    });
  }

  loadGoalsForSubject(subjectId: string) {
    this.goalService
      .loadAllGoals(subjectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((goals) => {
        this.goalsBySubject.update((map) => {
          const newMap = new Map(map);
          newMap.set(subjectId, goals);
          return newMap;
        });
      });
  }

  addSubjectGoalPair() {
    this.sessionModel.update((model) => ({
      ...model,
      subjectGoalPairs: [
        ...model.subjectGoalPairs,
        {
          subjectId: '',
          selectedGoalIds: [],
        },
      ],
    }));
  }

  removeSubjectGoalPair(index: number) {
    this.sessionModel.update((model) => ({
      ...model,
      subjectGoalPairs: model.subjectGoalPairs.filter((_, i) => i !== index),
    }));
  }

  onStateChange(newState: 'open' | 'closed') {
    if (newState === 'closed') {
      this.dialogStateChange.emit('closed');
    }
  }

  getSubjectIdFromPair(pairIndex: number): string {
    return this.sessionModel().subjectGoalPairs[pairIndex]?.subjectId || '';
  }

  getGoalsForSubject(subjectId: string): Goal[] {
    return this.goalsBySubject().get(subjectId) || [];
  }

  toggleGoal(pairIndex: number, goalId: string) {
    this.sessionModel.update((model) => {
      const pair = model.subjectGoalPairs[pairIndex];
      const isSelected = pair.selectedGoalIds.includes(goalId);
      return {
        ...model,
        subjectGoalPairs: model.subjectGoalPairs.map((p, i) =>
          i === pairIndex
            ? {
                ...p,
                selectedGoalIds: isSelected
                  ? p.selectedGoalIds.filter((id) => id !== goalId)
                  : [...p.selectedGoalIds, goalId],
              }
            : p,
        ),
      };
    });
  }

  isGoalSelected(pairIndex: number, goalId: string): boolean {
    return (
      this.sessionModel().subjectGoalPairs[pairIndex]?.selectedGoalIds.includes(goalId) ?? false
    );
  }

  getAvailableSubjectsForPair(currentPairIndex: number) {
    const otherSelectedSubjectIds = this.sessionModel()
      .subjectGoalPairs.map((pair, index) => (index !== currentPairIndex ? pair.subjectId : ''))
      .filter((id) => id !== '');
    return this.subjects().filter((subject) => !otherSelectedSubjectIds.includes(subject.id));
  }

  mapFormToRequest(model: GenerateSessionModel): GenerateSessionRequest {
    const goalsList = model.subjectGoalPairs.flatMap((pair) => pair.selectedGoalIds);
    return {
      title: model.title,
      weekYear: model.weekYear,
      weekNumber: model.weekNumber,
      availabilityPlanID: model.availabilityPlanID,
      usePriority: model.usePriority,
      goalsList,
    };
  }

  currentMonth = signal(new Date());
  selectedWeekStart = signal<Date | null>(null);
  displayWeekLabel = signal('');

  plannedWeeks = this.sessionService.allSessions.data;

  monthWeeks = computed(() => {
    const month = this.currentMonth();
    const year = month.getFullYear();
    const m = month.getMonth();
    const firstOfMonth = new Date(year, m, 1);
    const day = firstOfMonth.getDay();
    const diffToMonday = (day === 0 ? -6 : 1) - day;
    const start = new Date(firstOfMonth);
    start.setDate(firstOfMonth.getDate() + diffToMonday);

    const weeks: Date[] = [];
    let cursor = new Date(start);
    const nextMonth = m === 11 ? 0 : m + 1;

    while (weeks.length < 8) {
      if (weeks.length > 0 && cursor.getMonth() === nextMonth) {
        break;
      }
      weeks.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }

    return weeks;
  });

  getWeekYearAndNumber(date: Date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const weekYear = d.getUTCFullYear();

    const local = new Date(date);
    const ld = local.getDay() || 7;
    const monday = new Date(local);
    monday.setDate(local.getDate() - (ld - 1));

    const label = `Week of ${monday.toLocaleString(undefined, { month: 'long' })} ${monday.getDate()}`;

    return { weekYear, weekNumber: weekNo, weekStart: monday, label };
  }

  isPastWeek(weekStart: Date) {
    const today = new Date();
    const td = today.getDay() || 7;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - (td - 1));
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
    this.sessionModel.update((m) => ({
      ...m,
      weekYear: info.weekYear,
      weekNumber: info.weekNumber,
    }));
    this.selectedWeekStart.set(info.weekStart);
    this.displayWeekLabel.set(info.label);
  }
}
