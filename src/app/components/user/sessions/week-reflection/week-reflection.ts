import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionService } from '@app/core/services/session.service';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmProgressImports } from '@spartan-ng/helm/progress';
import {
  LucideAngularModule,
  ArrowLeft,
  Trophy,
  AlertCircle,
  Calendar,
  BookOpen,
  Clock,
} from 'lucide-angular';

@Component({
  selector: 'app-week-reflection',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    HlmCardImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmProgressImports,
    LucideAngularModule,
  ],
  templateUrl: './week-reflection.html',
})
export class WeekReflectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public sessionService = inject(SessionService);

  protected ArrowLeft = ArrowLeft;
  protected Trophy = Trophy;
  protected AlertCircle = AlertCircle;
  protected Calendar = Calendar;
  protected BookOpen = BookOpen;
  protected Clock = Clock;

  public sessionData = this.sessionService.sessionDetails.data;
  public isLoading = this.sessionService.sessionDetails.isLoading;

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.sessionService.loadSessionDetails(id).subscribe();
      }
    });
  }

  public weekLabel = computed(() => {
    const data = this.sessionData();
    if (!data) return '';
    const { weekYear, weekNumber } = data.weeklySession;
    return `Week ${weekNumber}, ${weekYear}`;
  });

  public completionRate = computed(() => {
    const data = this.sessionData();
    if (!data || data.subSessions.length === 0) return 0;
    const completed = data.subSessions.filter((s) => s.status === 'COMPLETED').length;
    return Math.round((completed / data.subSessions.length) * 100);
  });

  public subjectStats = computed(() => {
    const data = this.sessionData();
    if (!data) return { strongest: null, missed: null };

    const subjectCompleted = new Map<string, number>();
    const subjectMissed = new Map<string, number>();

    data.subSessions.forEach((s) => {
      if (s.status === 'COMPLETED') {
        subjectCompleted.set(s.subjectName, (subjectCompleted.get(s.subjectName) || 0) + 1);
      }
      if (s.status === 'INCOMPLETED' || s.status === 'CLOSED') {
        subjectMissed.set(s.subjectName, (subjectMissed.get(s.subjectName) || 0) + 1);
      }
    });

    let strongest = null;
    let maxCompleted = 0;
    for (const [subj, count] of subjectCompleted.entries()) {
      if (count > maxCompleted) {
        maxCompleted = count;
        strongest = subj;
      }
    }

    let missed = null;
    let maxMissed = 0;
    for (const [subj, count] of subjectMissed.entries()) {
      if (count > maxMissed) {
        maxMissed = count;
        missed = subj;
      }
    }

    return { strongest, missed };
  });

  getStatusClasses(status: string): string {
    switch (status) {
      case 'PENDING':
      case 'UPCOMING':
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700';
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800';
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

  planNextWeek() {
    this.router.navigate(['/user/sessions']);
  }

  saveAsTemplate() {
    console.log('Saved as template!');
  }
}
