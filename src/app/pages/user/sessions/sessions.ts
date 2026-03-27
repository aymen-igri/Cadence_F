import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsHeaderComponent } from '../../../components/user/sessions/sessions-header/sessions-header';
import { SessionsCalendarComponent } from '../../../components/user/sessions/sessions-calendar/sessions-calendar';
import { SessionsListComponent } from '../../../components/user/sessions/sessions-list/sessions-list';
import { SessionSheetComponent } from '../../../components/user/sessions/session-sheet/session-sheet';
import { AppSession } from '../../../core/models/session.model';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    SessionsHeaderComponent,
    SessionsCalendarComponent,
    SessionsListComponent,
    SessionSheetComponent,
  ],
  templateUrl: './sessions.html',
})
export class SessionsComponent {
  viewMode: 'calendar' | 'list' = 'calendar';

  @ViewChild('sessionSheet') sessionSheet!: SessionSheetComponent;

  // Mock data for initial view
  sessions: AppSession[] = [
    {
      id: '1',
      title: 'Angular Standalone Components',
      date: new Date().toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '11:00',
      type: 'FOCUS',
      status: 'COMPLETED',
      subjectId: 'sub-1',
      subjectName: 'Frontend Frameworks',
    },
    {
      id: '2',
      title: 'Database Architecture Review',
      date: new Date().toISOString().split('T')[0],
      startTime: '13:00',
      endTime: '14:30',
      type: 'REVIEW',
      status: 'IN_PROGRESS',
      subjectId: 'sub-2',
      subjectName: 'Backend Engineering',
    },
    {
      id: '3',
      title: 'CSS Grid Practice',
      date: new Date(new Date().getTime() + 86400000).toISOString().split('T')[0], // Tomorrow
      startTime: '10:00',
      endTime: '11:00',
      type: 'PRACTICE',
      status: 'PLANNED',
      subjectId: 'sub-1',
      subjectName: 'Frontend Frameworks',
    },
  ];

  openSessionSheet() {
    this.sessionSheet.open();
  }

  onSlotClick(event: { dateStr: string; timeStr: string }) {
    // Generate derived end time (default to 1 hr later)
    let timeParts = event.timeStr.split(':');
    let hoursStr = timeParts[0];
    let minsStr = timeParts[1];
    let hours = parseInt(hoursStr, 10);
    let mins = parseInt(minsStr, 10);
    let endHours = (hours + 1).toString().padStart(2, '0');
    let endTimeStr = endHours + ':' + minsStr.padStart(2, '0');

    this.sessionSheet.open({
      date: event.dateStr,
      startTime: event.timeStr,
      endTime: endTimeStr,
    });
  }

  onSessionClick(id: string) {
    const session = this.sessions.find((s) => s.id === id);
    if (session) {
      // In a real app we might open it in edit mode
      console.log('View session:', session);
    }
  }

  onSaveSession(sessionData: Partial<AppSession>) {
    const newSession: AppSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: sessionData.title!,
      date: sessionData.date!,
      startTime: sessionData.startTime!,
      endTime: sessionData.endTime!,
      status: sessionData.status as any,
      type: sessionData.type as any,
      subjectName: sessionData.subjectId ? 'Subject ' + sessionData.subjectId : undefined,
    };

    this.sessions = [...this.sessions, newSession];
  }

  onStartSession(id: string) {
    this.sessions = this.sessions.map((s) =>
      s.id === id ? { ...s, status: 'IN_PROGRESS' as const } : s,
    );
  }

  onCompleteSession(id: string) {
    this.sessions = this.sessions.map((s) =>
      s.id === id ? { ...s, status: 'COMPLETED' as const } : s,
    );
  }
}
