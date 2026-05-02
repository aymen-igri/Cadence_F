import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsHeaderComponent } from '@app/components/user/sessions/sessions-header/sessions-header';
import {
  SessionsCalendarComponent,
} from '@app/components/user/sessions/sessions-calendar/sessions-calendar';
import { SessionsListComponent } from '@app/components/user/sessions/sessions-list/sessions-list';
import { SessionService } from '@app/core/services/session.service';

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

  ngOnInit() {
    this.sessionService.loadAllSessions().subscribe();
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
