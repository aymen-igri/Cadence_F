import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SessionService } from '@app/core/services/session.service';
import { SessionsCalendarComponent } from '@app/components/user/sessions/sessions-calendar/sessions-calendar';

@Component({
  selector: 'app-session-calendar-page',
  templateUrl: './session-calendar.html',
  imports: [CommonModule, SessionsCalendarComponent],
})
export class SessionCalendarComponent {
  readonly sessionService = inject(SessionService);
  route = inject(ActivatedRoute);
  sessionId = signal<string | null>(null);
  sessionDetails = this.sessionService.sessionDetails.data;
  isLoading = this.sessionService.sessionDetails.isLoading;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.sessionId.set(id);
        this.loadSession(id);
      }
    });
  }

  loadSession(id: string) {
    this.sessionService.loadSessionDetails(id).subscribe();
  }
}
