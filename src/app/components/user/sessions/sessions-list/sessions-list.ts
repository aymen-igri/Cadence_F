import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CreateSessionResponse,
  CreateSubSessionResponse,
} from '@app/core/models/session.model';
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
} from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { SessionService } from '@app/core/services/session.service';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { createMutation } from '@app/core/utils/mutation.helper';
import { toast } from 'ngx-sonner';
import { SessionDialogComponent } from "../session-dialog/session-dialog";

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
    SessionDialogComponent
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

  protected Clock = Clock;
  protected FileText = FileText;
  protected CheckCircle2 = CheckCircle2;
  protected PlayCircle = PlayCircle;
  protected Goal = Goal;
  protected ChevronDown = ChevronDown;
  protected MoreVertical = MoreVertical;
  protected Edit = Edit;
  protected Trash2 = Trash2;

  readonly deleteSubject = createMutation({
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
    subSession: CreateSubSessionResponse,
    action: 'start' | 'complete' | 'view',
  ) {
    event.stopPropagation(); // Prevent card click
    if (action === 'start') {
      this.startSession.emit(subSession.id);
    } else if (action === 'complete') {
      this.completeSession.emit(subSession.id);
    } else if (action === 'view') {
      this.sessionClick.emit(subSession.id);
    }
  }

  onDeleteSession(sessionId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this session?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteSubject.mutate(sessionId);
      },
    });
  }
}
