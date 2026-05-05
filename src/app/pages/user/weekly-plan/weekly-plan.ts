import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { GenerateWeekDialogComponent } from '@app/components/user/weekly-plan/generate-week-dialog/generate-week-dialog';
import { SessionService } from '@app/core/services/session.service';
import { GeneratedSessionsListComponent } from "@app/components/user/weekly-plan/session-list/generated-session-list";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-weekly-plan',
  standalone: true,
  imports: [
    CommonModule,
    HlmTabsImports,
    HlmButtonImports,
    HlmCardImports,
    GenerateWeekDialogComponent,
    GeneratedSessionsListComponent,
    RouterLink,
  ],
  templateUrl: './weekly-plan.html',
})
export class WeeklyPlanComponent {
  private sessionService = inject(SessionService);
  readonly allGeneratedSession = this.sessionService.allGeneratedSessions.data;
  readonly isLoadingSesions = this.sessionService.allGeneratedSessions.isLoading;
  dialogState = signal<'open' | 'closed'>('closed');

  ngOnInit() {
    this.sessionService.loadAllGeneratedSessions().subscribe();
  }
}
