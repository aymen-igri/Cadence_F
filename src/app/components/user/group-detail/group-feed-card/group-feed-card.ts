import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { GroupService } from '@app/core/services/group.service';
import { SharedSession } from '@app/core/models/session.model';
import {
  Eye,
  LucideAngularModule,
  MoreVertical,
  Lock,
  Trash,
  GitFork,
  Loader2,
} from 'lucide-angular';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { createMutation } from '@app/core/utils/mutation.helper';
import { SessionService } from '@app/core/services/session.service';
import { toast } from 'ngx-sonner';
import { AlertService } from '@app/components/shared/alert/alert.service';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-group-feed-card',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmBadgeImports,
    LucideAngularModule,
    HlmButtonImports,
    DatePipe,
    HlmDropdownMenuImports,
  ],
  templateUrl: './group-feed-card.html',
})
export class GroupFeedCardComponent {
  groupService = inject(GroupService);
  sessionService = inject(SessionService);
  alertService = inject(AlertService);
  session = input.required<SharedSession>();
  userId = input.required<string>();
  userRole = input<'ADMIN' | 'MEMBER' | 'OWNER' | null>();
  protected MoreVertical = MoreVertical;
  protected Eye = Eye;
  protected Lock = Lock;
  protected Trash = Trash;
  protected GitFork = GitFork;
  protected Loader2 = Loader2;

  forkSessionMutation = createMutation({
    mutationFn: () =>
      this.sessionService.forkSession(this.session().sharedSessionId).pipe(
        catchError((err: HttpErrorResponse) => {
          if (err.status === 409) {
            return throwError(() => new Error('You already have a session for this week'));
          }
          return throwError(() => err);
        }),
      ),
    onSuccess: () => {
      toast.success('Session added to your plan');
    },
    onError: (err) => {
      toast.error('Failed to fork session', { description: err });
    },
  });

  onForkSession() {
    this.alertService.show({
      description: 'Are you sure you want to add this session to your plan? It will be added',
      actionLabel: 'Yes, Add to My Plan',
      action: () => this.forkSessionMutation.mutate({}),
    });
  }

  unshareSessionMutation = createMutation({
    mutationFn: () =>
      this.sessionService.unshareSession(this.session().sessionId, this.session().groupId),
    onSuccess: () => {
      toast.success('Session unshared successfully', {
        description: 'The session has been removed from the group feed.',
      });
    },
    onError: (err) => {
      toast.error('Failed to unshare session', { description: err });
    },
  });

  onUnshareSession() {
    this.alertService.show({
      description: 'Are you sure you want to remove this session from the group feed?',
      variant: 'destructive',
      actionLabel: 'Yes, Unshare',
      action: () => this.unshareSessionMutation.mutate({}),
    });
  }
}
