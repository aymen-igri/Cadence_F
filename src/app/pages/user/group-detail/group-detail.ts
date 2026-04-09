import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { GroupService } from '@app/core/services/group.service';
import { Group, GroupResponse, Member } from '@app/core/models/group.model';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { ShareSessionDialogComponent } from '@app/components/user/group-detail/share-session-dialog/share-session-dialog';
import { GroupFeedCardComponent } from '@app/components/user/group-detail/group-feed-card/group-feed-card';
import { GroupMembersTabComponent } from '@app/components/user/group-detail/group-members-tab/group-members-tab';
import { GroupChatTabComponent } from '@app/components/user/group-detail/group-chat-tab/group-chat-tab';
import { GroupSettingsTabComponent } from '@app/components/user/group-detail/group-settings-tab/group-settings-tab';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-group-detail-page',
  standalone: true,
  imports: [
    CommonModule,
    HlmTabsImports,
    HlmButtonImports,
    HlmBadgeImports,
    ShareSessionDialogComponent,
    GroupFeedCardComponent,
    GroupMembersTabComponent,
    GroupChatTabComponent,
    GroupSettingsTabComponent,
  ],
  templateUrl: './group-detail.html',
})
export class GroupDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  groupService = inject(GroupService);
  authService = inject(AuthService);

  groupId = signal<string>('');
  group = signal<GroupResponse | undefined>(undefined);

  myRole = computed(() => this.group()?.userRole || null);
  members = signal<Member[]>([]);
  feed = signal<any[]>([]);

  activeTab = signal<'feed' | 'members' | 'chat' | 'settings'>('feed');
  shareDialogState = signal<'closed' | 'open'>('closed');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.groupId.set(id);
        const g = this.groupService.getGroupById(id);
        if (!g) {
          this.router.navigate(['/user/groups']);
          return;
        }
        this.group.set(g);
        console.log('Loaded group:', g);
      }
    });

    effect(() => {
      const gId = this.groupId();
      if (gId) {
        // Sync state from services based on active group param
        this.groupService.setGroupId(gId);
        this.members = this.groupService.groupMembers;
        this.feed = this.groupService.getGroupFeed(gId) as any;
      }
    });
  }

  setActiveTab(tab: any) {
    this.activeTab.set(tab);
  }

  get canLeaveGroup(): boolean {
    if (!this.group()) return false;
    const adminCount = this.members().filter((m) => m.role === 'ADMIN').length;
    return !(this.myRole() === 'ADMIN' && adminCount === 1);
  }

  leaveGroup() {
    this.groupService.leaveGroup(this.groupId());
    this.router.navigate(['/user/groups']);
  }

  onShareSession(sessionId: string) {
    this.groupService.shareSession(this.groupId(), sessionId);
  }

  onAddComment(sessionId: string, content: string) {
    this.groupService.addComment(sessionId, content);
  }

  onPromote(membershipId: string) {
    this.groupService.updateRole(membershipId, 'ADMIN');
  }

  onDemote(membershipId: string) {
    this.groupService.updateRole(membershipId, 'MEMBER');
  }

  onRemove(membershipId: string) {
    this.groupService.removeMember(membershipId);
  }

  getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  getUserFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  }

  onAcceptRequest(userId: string) {
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

  onDeclineRequest(userId: string) {
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

  onUpdateGroup(data: { name: string; description: string; privacyLevel: 'PUBLIC' | 'PRIVATE' }) {
    this.groupService.updateGroup(this.groupId(), data);
  }

  onTransferAdmin(membershipId: string) {
    // Current user membership
    const myMem = this.members().find((m) => m.userId === this.groupService.currentUserId());
    if (myMem) {
      this.groupService.updateRole(myMem.membershipId, 'MEMBER');
    }
    // Promote selected
    this.groupService.updateRole(membershipId, 'ADMIN');
  }

  onDeleteGroup() {
    this.groupService.deleteGroup(this.groupId());
    this.router.navigate(['/user/groups']);
  }
}
