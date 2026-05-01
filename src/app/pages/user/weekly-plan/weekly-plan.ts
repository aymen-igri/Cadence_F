import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { AvailabilitySectionComponent } from '@app/components/user/weekly-plan/availability-section/availability-section';
import { WeeklySummaryComponent } from '@app/components/user/weekly-plan/weekly-summary/weekly-summary';
import { WeeklyPlanSessionsListComponent } from '@app/components/user/weekly-plan/sessions-list/sessions-list';
import { GenerateWeekDialogComponent } from '@app/components/user/weekly-plan/generate-week-dialog/generate-week-dialog';
import { AppSession } from '@app/core/models/session.model';
import { GoalProgressInfo } from '@app/core/models/weekly-plan.model';

@Component({
  selector: 'app-weekly-plan',
  standalone: true,
  imports: [
    CommonModule,
    HlmTabsImports,
    HlmButtonImports,
    AvailabilitySectionComponent,
    WeeklySummaryComponent,
    WeeklyPlanSessionsListComponent,
    GenerateWeekDialogComponent,
  ],
  templateUrl: './weekly-plan.html',
})
export class WeeklyPlanComponent {
  activeTab = signal<'this-week' | 'next-week'>('this-week');
  dialogState = signal<'open' | 'closed'>('closed');

  goals = signal<GoalProgressInfo[]>([
    {
      id: 'g1',
      goalTitle: 'Master Angular Signals',
      subjectName: 'Frontend Frameworks',
      hoursPlannedCurrentWeek: 4,
      targetHoursPerWeek: 5,
    },
    {
      id: 'g2',
      goalTitle: 'Database Optimization',
      subjectName: 'Backend Engineering',
      hoursPlannedCurrentWeek: 2,
      targetHoursPerWeek: 4,
    },
  ]);

  sessions = signal<AppSession[]>([
    {
      id: 's1',
      title: 'Signals Deep Dive',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '12:00',
      type: 'FOCUS',
      status: 'COMPLETED',
      goalId: 'g1',
      goalName: 'Master Angular Signals',
      subjectName: 'Frontend Frameworks',
    },
  ]);

  thisWeekSessions = computed(() => {
    // In real app, filter by actual dates of this week
    return this.sessions();
  });

  nextWeekSessions = computed(() => {
    // In real app, filter by actual dates of next week
    return [];
  });

  hasPlanForSelectedWeek = computed(() => {
    if (this.activeTab() === 'this-week') return this.thisWeekSessions().length > 0;
    return this.nextWeekSessions().length > 0;
  });

  setActiveTab(tabRaw: any) {
    const tab = tabRaw as 'this-week' | 'next-week';
    this.activeTab.set(tab);
  }

  openAvailability(availability: any) {
    if (availability && availability.accordionState) {
      availability.accordionState.set('open');
      availability.accordionItem()?.toggle();
    }
  }

  editSession(session: AppSession) {
    console.log('Edit session in page', session.id);
  }

  deleteSession(id: string) {
    console.log('Delete session in page', id);
  }

  onGeneratePlan(data: { selectedGoalIds: string[]; sessionDuration: number }) {
    console.log('Generating plan...', data, 'for', this.activeTab());
    const d = new Date();
    if (this.activeTab() === 'next-week') {
      d.setDate(d.getDate() + 7);
    }

    // Fake adding a generated session
    this.sessions.update((list) => [
      ...list,
      {
        id: Math.random().toString(36).substr(2, 9),
        title: 'Generated Focus Session',
        date: d.toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '16:00',
        type: 'GENERATED',
        status: 'PLANNED',
        goalName: 'Selected Goal',
        subjectName: 'Any Subject',
      },
    ]);
  }
}
