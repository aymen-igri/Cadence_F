import { Component, input, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppSession } from '@app/core/models/session.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LucideAngularModule, Edit2, Trash2 } from 'lucide-angular';

@Component({
  selector: 'app-weekly-plan-sessions-list',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmBadgeImports, HlmButtonImports, LucideAngularModule],
  templateUrl: './sessions-list.html',
})
export class WeeklyPlanSessionsListComponent {
  sessions = input.required<AppSession[]>();

  editClick = output<AppSession>();
  deleteClick = output<string>();
  generateClick = output<void>();

  protected Edit2Icon = Edit2;
  protected Trash2Icon = Trash2;

  groupedSessions = computed(() => {
    const list = this.sessions();
    if (!list || list.length === 0) return [];

    // Group by date
    const groups = new Map<string, AppSession[]>();
    list.forEach((s) => {
      const date = s.date;
      if (!groups.has(date)) groups.set(date, []);
      groups.get(date)!.push(s);
    });

    const result = Array.from(groups.entries()).map(([date, sessions]) => {
      // Sort sessions by start time
      sessions.sort((a, b) => a.startTime.localeCompare(b.startTime));

      const d = new Date(date);
      // Create label like Monday, March 24
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      };
      const dateLabel = d.toLocaleDateString(undefined, options);

      return { date, dateLabel, sessions };
    });

    // Sort groups by date
    result.sort((a, b) => a.date.localeCompare(b.date));

    return result;
  });

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'MISSED':
        return 'destructive';
      default:
        return 'secondary';
    }
  }
}
