import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsHeaderComponent } from '@app/components/user/sessions/sessions-header/sessions-header';
import {
  SessionCalendarEvent,
  SessionsCalendarComponent,
} from '@app/components/user/sessions/sessions-calendar/sessions-calendar';
import { SessionsListComponent } from '@app/components/user/sessions/sessions-list/sessions-list';
import { CreateSessionResponse, CreateSubSessionResponse } from '@app/core/models/session.model';
import { SessionService } from '@app/core/services/session.service';

const DAY_OF_WEEK_TO_OFFSET: Record<CreateSubSessionResponse['dayOfWeek'], number> = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
  SATURDAY: 5,
  SUNDAY: 6,
};

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSubSessionDate(
  weeklyStartTime: string,
  dayOfWeek: CreateSubSessionResponse['dayOfWeek'],
): string {
  let anchor = new Date(weeklyStartTime);
  if (Number.isNaN(anchor.getTime())) {
    const extractedDate = weeklyStartTime.match(/\d{4}-\d{2}-\d{2}/)?.[0];
    anchor = extractedDate ? new Date(extractedDate) : new Date();
  }

  const mondayBasedIndex = (anchor.getDay() + 6) % 7;
  const weekStart = new Date(anchor);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(anchor.getDate() - mondayBasedIndex);

  const targetDate = new Date(weekStart);
  targetDate.setDate(weekStart.getDate() + DAY_OF_WEEK_TO_OFFSET[dayOfWeek]);
  return formatLocalDate(targetDate);
}

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    SessionsHeaderComponent,
    SessionsCalendarComponent,
    SessionsListComponent,
  ],
  templateUrl: './sessions.html',
})
export class SessionsComponent implements OnInit {
  viewMode: 'calendar' | 'list' = 'list';
  sessionService = inject(SessionService);

  sessions = this.sessionService.allSessions.data;
  isLoadingSesions = this.sessionService.allSessions.isLoading;

  calendarSessions = computed<SessionCalendarEvent[]>(() => {
    const rawSessions = this.sessions() || [];
    const flat: SessionCalendarEvent[] = [];

    rawSessions.forEach((sessionResponse: CreateSessionResponse) => {
      sessionResponse.subSessions.forEach((subSession) => {
        const subDate = getSubSessionDate(
          sessionResponse.weeklySession.startTime,
          subSession.dayOfWeek,
        );

        flat.push({
          id: subSession.id,
          title: `${sessionResponse.weeklySession.title} - ${subSession.subjectName}`,
          date: subDate,
          startTime: subSession.startTime,
          endTime: subSession.endTime,
          subjectName: subSession.subjectName,
          status: subSession.status,
        });
      });
    });

    return flat;
  });

  ngOnInit() {
    this.sessionService.loadAllSessions().subscribe();
  }

  onSlotClick(event: { dateStr: string; timeStr: string }) {
    console.log('Calendar slot clicked:', event);
  }

  onSessionClick(id: string) {
    console.log('View session ID:', id);
  }

  onStartSession(id: string) {
    console.log('Starting sub-session via API, ID:', id);
    // e.g. this.sessionService.updateSubSessionStatus(id, 'IN_PROGRESS');
  }

  onCompleteSession(id: string) {
    console.log('Completing sub-session via API, ID:', id);
    // e.g. this.sessionService.updateSubSessionStatus(id, 'COMPLETED');
  }
}
