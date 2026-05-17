import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionsHeaderComponent } from '@app/components/user/sessions/sessions-header/sessions-header';
import { SessionsListComponent } from '@app/components/user/sessions/sessions-list/sessions-list';
import { SessionService } from '@app/core/services/session.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sessions',
  standalone: true,
  imports: [
    CommonModule,
    SessionsHeaderComponent,
    SessionsListComponent,
  ],
  templateUrl: './sessions.html',
})
export class SessionsComponent implements OnInit {
  sessionService = inject(SessionService);
  private destroyRef = takeUntilDestroyed();

  sessions = this.sessionService.allSessions.data;
  isLoadingSesions = this.sessionService.allSessions.isLoading;

  ngOnInit() {
    this.sessionService.loadAllSessions()
      .pipe(this.destroyRef)
      .subscribe();
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
