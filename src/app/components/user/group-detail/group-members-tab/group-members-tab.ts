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
import { AlertService } from '@app/components/shared/alert/alert.service';
import { extractErrorMessage } from '@app/core/utils/error.util';
import { createMutation } from '@app/core/utils/mutation.helper';

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
  private alertService = inject(AlertService);
  members = input.required<Member[]>();
  readonly requests = this.groupService.joinRequests.data;
  currentUserRole = input<'ADMIN' | 'MEMBER' | 'OWNER' | null>();
  currentUserId = input.required<string>();
  groupId = input.required<string>();
  readonly isJoinRequestsLoading = this.groupService.joinRequests.isLoading;

  ngOnInit() {
    this.groupService.loadJoinRequests(this.groupId()).subscribe();
  }
  getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  readonly acceptRequest = createMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      this.groupService.acceptJoinRequest(groupId, userId),
    onSuccess: () =>
      toast.success('Join request accepted.', {
        description: 'The user has been added to the group.',
      }),
    onError: (err) =>
      toast.error('Failed to accept join request.', { description: err }),
  });

  readonly declineRequest = createMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      this.groupService.declineJoinRequest(groupId, userId),
    onSuccess: () =>
      toast.success('Join request declined.', {
        description: "The user's request to join the group has been declined.",
      }),
    onError: (err) =>
      toast.error('Failed to decline join request.', { description: err }),
  });

  readonly promoteMember = createMutation({
    mutationFn: ({ groupId, membershipId }: { groupId: string; membershipId: string }) =>
      this.groupService.promoteMember(groupId, membershipId),
    onSuccess: () =>
      toast.success('Member promoted to admin.', {
        description:
          'The member now has admin privileges and can manage group settings and members.',
      }),
    onError: (err) =>
      toast.error('Failed to promote member.', { description: err }),
  });

  readonly demoteMember = createMutation({
    mutationFn: ({ groupId, membershipId }: { groupId: string; membershipId: string }) =>
      this.groupService.demoteMember(groupId, membershipId),
    onSuccess: () =>
      toast.success('Member demoted to member.', {
        description: 'The member is no longer an admin and has limited privileges.',
      }),
    onError: (err) =>
      toast.error('Failed to demote member.', { description: err }),
  });

  readonly removeMember = createMutation({
    mutationFn: ({ groupId, membershipId }: { groupId: string; membershipId: string }) =>
      this.groupService.removeMember(groupId, membershipId),
    onSuccess: () =>
      toast.success('Member removed from group.', {
        description: 'The member has been removed from the group.',
      }),
    onError: (err) =>
      toast.error('Failed to remove member.', { description: err }),
  });

  onPromoteClick(membershipId: string) {
    this.alertService.show({
      description:
        'Are you sure you want to promote this member to admin? They will have additional privileges, including managing group settings and members.',
      actionLabel: 'Promote',
      variant: 'destructive',
      action: () => this.promoteMember.mutate({ groupId: this.groupId(), membershipId }),
    });
  }

  onRemoveClick(membershipId: string) {
    this.alertService.show({
      description:
        'Are you sure you want to remove this member from the group? This action cannot be undone.',
      actionLabel: 'Remove',
      variant: 'destructive',
      action: () => this.removeMember.mutate({ groupId: this.groupId(), membershipId }),
    });
  }

  onDemoteClick(membershipId: string) {
    this.alertService.show({
      description:
        'Are you sure you want to demote this admin to a regular member? They will lose their admin privileges and will no longer be able to manage group settings and members.',
      actionLabel: 'Demote',
      variant: 'destructive',
      action: () => this.demoteMember.mutate({ groupId: this.groupId(), membershipId }),
    });
  }

  onAcceptClick(userId: string) {
    this.alertService.show({
      description:
        'Are you sure you want to accept this join request? The user will be added to the group and can participate in group activities.',
      actionLabel: 'Accept',
      variant: 'default',
      action: () => this.acceptRequest.mutate({ groupId: this.groupId(), userId }),
    });
  }

  onDeclineClick(userId: string) {
    this.alertService.show({
      description:
        "Are you sure you want to decline this join request? The user's request to join the group will be declined.",
      actionLabel: 'Decline',
      variant: 'destructive',
      action: () => this.declineRequest.mutate({ groupId: this.groupId(), userId }),
    });
  }
}
