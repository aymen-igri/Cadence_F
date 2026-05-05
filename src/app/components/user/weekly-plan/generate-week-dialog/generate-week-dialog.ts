import { Component, effect, output, input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { applyEach, form, FormField, FormRoot, minLength, required } from '@angular/forms/signals';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import {
  GenerateSessionModel,
  GenerateSessionRequest,
  SubjectGoalPair,
} from '@app/core/models/session.model';
import { Goal } from '@app/core/models/goal.model';
import { SubjectService } from '@app/core/services/subject.service';
import { GoalService } from '@app/core/services/goal.service';
import { AvailabilityPlanService } from '@app/core/services/availability-plan.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { SessionService } from '@app/core/services/session.service';
import { toast } from 'ngx-sonner';

@Component({
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
  ],
  templateUrl: './generate-week-dialog.html',
})
export class GenerateWeekDialogComponent {
  private sessionService = inject(SessionService);
  private subjectService = inject(SubjectService);
  private goalService = inject(GoalService);
  private availabilityService = inject(AvailabilityPlanService);

  subjects = this.subjectService.allSubjects.data;
  availabilityPlans = this.availabilityService.allAvailabilityPlans.data;
  goalsBySubject = signal<Map<string, Goal[]>>(new Map());

  state = input<'open' | 'closed'>('closed');
  dialogStateChange = output<'open' | 'closed'>();

  sessionModel = signal<GenerateSessionModel>({
    title: '',
    weekStartDate: new Date().toISOString().split('T')[0], // Default to today
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
      this.close();
    },
    onError: (error) => {
      toast.error('Error generating session:', { description: error });
    },
  });

  sessionForm = form(
    this.sessionModel,
    (schema) => {
      required(schema.title, { message: 'Title is required' });
      required(schema.weekStartDate, { message: 'Week start date is required' });
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
        },
      },
    },
  );

  ngOnInit() {
    this.subjectService.loadAllSubjects().subscribe();
    this.availabilityService.loadAllAvailabilityPlans().subscribe();
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
    this.goalService.loadAllGoals(subjectId).subscribe((goals) => {
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

  close() {
    this.dialogStateChange.emit('closed');
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
      weekStartDate: model.weekStartDate,
      availabilityPlanID: model.availabilityPlanID,
      usePriority: model.usePriority,
      goalsList,
    };
  }
}
