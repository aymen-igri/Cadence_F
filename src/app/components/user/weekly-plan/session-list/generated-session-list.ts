import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CreateSessionResponse } from '@app/core/models/session.model';
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

@Component({
  selector: 'app-generated-sessions-list',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmBadgeImports,
    LucideAngularModule,
    HlmButtonImports,
    HlmAccordionImports,
    HlmDropdownMenuImports,
  ],
  templateUrl: './generated-session-list.html',
})
export class GeneratedSessionsListComponent {
  private sessionService = inject(SessionService);
  private alertService = inject(AlertService);
  sessions = input.required<CreateSessionResponse[]>();
  isLoadingSesions = input.required<boolean>();

  protected Clock = Clock;
  protected FileText = FileText;
  protected CheckCircle2 = CheckCircle2;
  protected PlayCircle = PlayCircle;
  protected Goal = Goal;
  protected ChevronDown = ChevronDown;
  protected MoreVertical = MoreVertical;
  protected Edit = Edit;
  protected Trash2 = Trash2;

  readonly deleteSession = createMutation({
    mutationFn: (sessionId: string) => this.sessionService.deleteSession(sessionId),
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

  readonly approveSessionMutation = createMutation({
    mutationFn: (sessionId: string) => this.sessionService.approveSession(sessionId),
    onSuccess: () => {
      toast.success('Session approved', {
        description: 'The session has been approved.',
      });
    },
    onError: (error) => {
      toast.error('Failed to approve session', {
        description: error,
      });
      console.error('Failed to approve session :', error);
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

  onDeleteGeneratedSession(sessionId: string) {
    this.alertService.show({
      description: 'Are you sure you want to delete this session?',
      variant: 'destructive',
      actionLabel: 'Delete',
      action: () => {
        this.deleteSession.mutate(sessionId);
      },
    });
  }

  onApproveSession(sessionId: string) {
    this.alertService.show({
      description: 'Are you sure you want to approve this session?',
      variant: 'default',
      actionLabel: 'Approve',
      action: () => {
        this.approveSessionMutation.mutate(sessionId);
      },
    });
  }
}
