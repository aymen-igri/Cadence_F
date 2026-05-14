import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSessionResponse, CreateSubSessionResponse } from '@app/core/models/session.model';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAccordionImports } from '@spartan-ng/helm/accordion';
import {
  LucideAngularModule,
  Clock,
  FileText,
  CheckCircle2,
  PlayCircle,
  Goal,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
} from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { SessionService } from '@app/core/services/session.service';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { SessionDialogComponent } from '../session-dialog/session-dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sessions-list',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmBadgeImports,
    LucideAngularModule,
    HlmButtonImports,
    HlmAccordionImports,
    HlmDropdownMenuImports,
    SessionDialogComponent,
  ],
  templateUrl: './sessions-list.html',
})
export class SessionsListComponent {
  private sessionSerivce = inject(SessionService);
  private alertService = inject(AlertService);
  sessions = input<CreateSessionResponse[]>([]);
  isLoadingSesions = input.required<boolean>();
  sessionClick = output<string>();
  startSession = output<string>();
  completeSession = output<string>();
  updateSubjectDialogState = signal<'closed' | 'open'>('closed');
  private router = inject(Router);

  protected Clock = Clock;
  protected FileText = FileText;
  protected CheckCircle2 = CheckCircle2;
  protected PlayCircle = PlayCircle;
  protected Goal = Goal;
  protected ChevronDown = ChevronDown;
  protected MoreVertical = MoreVertical;
  protected Edit = Edit;
  protected Trash2 = Trash2;
  protected Calendar = Calendar;

  navigateToCalendar(sessionId: string) {
    this.router.navigate(['/user/sessions/calendar', sessionId]);
  }

  isReflectable(status: string): boolean {
    return status === 'CLOSED' || status === 'INCOMPLETED';
  }

  onCardClick(event: Event, session: any) {
    // Prevent triggering if clicked on inner interactive elements like dropdowns or buttons
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('hlm-accordion')) {
      return;
    }

    if (this.isReflectable(session.sessionStatus)) {
      this.router.navigate(['/user/sessions', session.id, 'reflect']);
    }
  }

  readonly deleteSession = createMutation({
    mutationFn: (sessionId: string) => this.sessionSerivce.deleteSession(sessionId),
    onSuccess: () => {
      toast.success('Session deleted', {
        description: 'The session has been removed from your study map.',
      });
    },
    onError: (error) => {
      toast.error('Failed to delete session', {
        description: error,
      });
      console.error('Failed to delete session :', error);
    },
  });

  readonly updateSubSessionStatus = createMutation({
    mutationFn: ({
      weeklySessionId,
      subSessionId,
      status,
    }: {
      weeklySessionId: string;
      subSessionId: string;
      status: 'PENDING' | 'COMPLETED';
    }) => this.sessionSerivce.updateSubSessionStatus(weeklySessionId, subSessionId, status),
    onSuccess: () => {
      toast.success('Session updated', {
        description: 'The session status has been updated.',
      });
    },
    onError: (error) => {
      toast.error('Failed to update session', {
        description: error,
      });
      console.error('Failed to update session :', error);
    },
  });

  getWeekLabel(weekYear: number, weekNumber: number): string {
    const jan4 = new Date(weekYear, 0, 4);
    const day = jan4.getDay();
    const diffToMonday = jan4.getDate() - day + (day === 0 ? -6 : 1);
    const startOfFirstWeek = new Date(weekYear, 0, diffToMonday);

    const weekStart = new Date(startOfFirstWeek);
    weekStart.setDate(weekStart.getDate() + (weekNumber - 1) * 7);

    return `Week of ${weekStart.toLocaleString(undefined, { month: 'long' })} ${weekStart.getDate()}, ${weekStart.getFullYear()}`;
  }

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
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-800';
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800 hover:bg-blue-200 dark:hover:bg-blue-900/60';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/60';
      case 'INCOMPLETED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/60';
      case 'CLOSED':
        return 'bg-muted text-muted-foreground border-border opacity-80 hover:bg-muted/80';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  getBadgeVariant(status: string): any {
    switch (status) {
      case 'COMPLETED':
      case 'CLOSED':
        return 'default';
      case 'INCOMPLETED':
        return 'destructive';
      case 'IN_PROGRESS':
        return 'secondary';
      case 'PENDING':
      default:
        return 'outline';
    }
  }

  onActionClick(
    event: Event,
    subSessionId: string,
    weeklySessionId: string,
    action: 'COMPLETED' | 'PENDING',
  ) {
    event.stopPropagation();
    if (action === 'COMPLETED') {
      this.alertService.show({
        description: 'Are you sure you want to mark this session as completed?',
        variant: 'destructive',
        actionLabel: 'Mark as Completed',
        action: () => {
          this.updateSubSessionStatus.mutate({
            weeklySessionId,
            subSessionId,
            status: 'COMPLETED',
          });
        },
      });
    } else if (action === 'PENDING') {
      this.alertService.show({
        description: 'Are you sure you want to mark this session as pending?',
        variant: 'destructive',
        actionLabel: 'Mark as Pending',
        action: () => {
          this.updateSubSessionStatus.mutate({
            weeklySessionId,
            subSessionId,
            status: 'PENDING',
          });
        },
      });
    }
  }

  onDeleteSession(sessionId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this session?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteSession.mutate(sessionId);
      },
    });
  }
}
