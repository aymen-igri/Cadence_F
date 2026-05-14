import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionService } from '@app/core/services/session.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { LucideAngularModule, Clock, BookOpen, Coffee } from 'lucide-angular';
import { CreateSubSessionResponse } from '@app/core/models/session.model';

@Component({
  selector: 'app-today-session-view',
  standalone: true,
  imports: [CommonModule, HlmCardImports, LucideAngularModule],
  templateUrl: './today-session-view.html',
})
export class TodaySessionView {
  private sessionService = inject(SessionService);
  protected Clock = Clock;
  protected BookOpen = BookOpen;
  protected Coffee = Coffee;

  private allSessions = this.sessionService.allSessions.data;
  public isLoading = this.sessionService.allSessions.isLoading;

  private today = new Date();

  private currentWeekInfo = computed(() => {
    const d = new Date(
      Date.UTC(this.today.getFullYear(), this.today.getMonth(), this.today.getDate()),
    );
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    const weekYear = d.getUTCFullYear();
    return { weekYear, weekNumber: weekNo };
  });

  private currentDayOfWeek = computed(() => {
    const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    return dayNames[this.today.getDay()];
  });

  public activeWeeklySession = computed(() => {
    const { weekYear, weekNumber } = this.currentWeekInfo();
    return this.allSessions().find(
      (s) => s.weeklySession.weekYear === weekYear && s.weeklySession.weekNumber === weekNumber,
    );
  });

  public todaySubSessions = computed<CreateSubSessionResponse[]>(() => {
    const activeSession = this.activeWeeklySession();
    if (!activeSession) return [];
    const todayStr = this.currentDayOfWeek();
    return (
      activeSession.subSessions
        .filter((sub) => sub.dayOfWeek === todayStr)
        .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
    );
  });

  getStatusDisplay(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'UPCOMING';
      case 'IN_PROGRESS':
        return 'ACTIVE';
      default:
        return status;
    }
  }

  getStatusClasses(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 animate-pulse';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800';
      case 'INCOMPLETED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800';
      case 'CLOSED':
        return 'bg-muted text-muted-foreground border-border opacity-80';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
}
