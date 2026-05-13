import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSessionResponse, CreateSubSessionResponse } from '@app/core/models/session.model';
import { getWeekDays, getTimeSlots, computeBlockStyles, getSubjectColor } from './calendar.utils';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmHoverCardImports } from '@spartan-ng/helm/hover-card';
import { BrnHoverCardImports } from '@spartan-ng/brain/hover-card';

@Component({
  selector: 'app-sessions-calendar',
  standalone: true,
  imports: [
    CommonModule,
    NgIconsModule,
    HlmButtonImports,
    HlmHoverCardImports,
    BrnHoverCardImports,
  ],
  templateUrl: './session-calendar.html',
})
export class SessionsCalendarComponent {
  session = input<CreateSessionResponse | null>(null);

  weekDays = computed(() => {
    const activeSession = this.session();
    if (!activeSession?.weeklySession?.weekYear || !activeSession?.weeklySession?.weekNumber) {
      return [];
    }

    const { weekYear, weekNumber } = activeSession.weeklySession;

    // Find Jan 4 of the given year, which is always in week 1
    const jan4 = new Date(weekYear, 0, 4);
    // Find Monday of the week containing Jan 4
    const day = jan4.getDay();
    const diffToMonday = jan4.getDate() - day + (day === 0 ? -6 : 1);
    const startOfFirstWeek = new Date(weekYear, 0, diffToMonday);

    const anchorDate = new Date(startOfFirstWeek);
    anchorDate.setDate(anchorDate.getDate() + (weekNumber - 1) * 7);
    anchorDate.setHours(0, 0, 0, 0); // ensure start of day

    return getWeekDays(anchorDate);
  });

  timeSlots = getTimeSlots();

  /** Group SubSessions by Day cleanly */
  subSessionsByDay = computed(() => {
    const activeSession = this.session();
    const grouped: Record<string, CreateSubSessionResponse[]> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: [],
    };

    if (activeSession) {
      activeSession.subSessions.forEach((sub) => {
        if (grouped[sub.dayOfWeek]) {
          grouped[sub.dayOfWeek].push(sub);
        }
      });
    }
    return grouped;
  });

  statusIndicatorClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'ring-2 ring-yellow-200';
      case 'COMPLETED':
        return 'ring-2 ring-green-200';
      case 'INCOMPLETED':
        return 'ring-2 ring-red-200';
      case 'CLOSED':
        return 'ring-2 ring-gray-200';
      default:
        return '';
    }
  }

  getStyle(start: string, end: string) {
    return computeBlockStyles(start, end);
  }

  getColorClass(status: string) {
    return getSubjectColor(status);
  }
}
