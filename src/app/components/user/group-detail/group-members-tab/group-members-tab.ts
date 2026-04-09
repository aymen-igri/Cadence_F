import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideMoreVertical } from '@ng-icons/lucide';
import { Member } from '@app/core/models/group.model';
import { GroupService } from '@app/core/services/group.service';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-group-members-tab',
  standalone: true,
  imports: [
    CommonModule,
    HlmCardImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmIconImports,
    DatePipe,
  ],
  providers: [provideIcons({ lucideMoreVertical })],
  templateUrl: './group-members-tab.html',
})
export class GroupMembersTabComponent {
  private groupService = inject(GroupService);
  members = input.required<Member[]>();
  readonly requests = this.groupService.joinRequests();
  currentUserRole = input<'ADMIN' | 'MEMBER' | 'OWNER' | null>();
  currentUserId = input.required<string>();
  groupId = input.required<string>();

  getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  promote = output<string>();
  demote = output<string>();
  remove = output<string>();

  acceptRequest(userId: string) {
    this.groupService.acceptJoinRequest(this.groupId(), userId).subscribe({
      next: () => {
        toast.success('Join request accepted.', {
          description:
            'The user has been added to the group and can now participate in group activities.',
        });
      },
      error: (err) => {
        toast.error('Failed to accept join request.', {
          description: 'An error occurred while accepting the join request. Please try again.',
        });
        console.error('Failed to accept join request:', err);
      },
    });
  }

  declineRequest(userId: string) {
    this.groupService.declineJoinRequest(this.groupId(), userId).subscribe({
      next: () => {
        toast.success('Join request declined.', {
          description: "The user's request to join the group has been declined.",
        });
      },
      error: (err) => {
        toast.error('Failed to decline join request.', {
          description: 'An error occurred while declining the join request. Please try again.',
        });
        console.error('Failed to decline join request:', err);
      },
    });
  }
}
