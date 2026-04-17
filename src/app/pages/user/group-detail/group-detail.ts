import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { GroupService } from '@app/core/services/group.service';
import { GroupResponse, Member } from '@app/core/models/group.model';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { ShareSessionDialogComponent } from '@app/components/user/group-detail/share-session-dialog/share-session-dialog';
import { GroupFeedCardComponent } from '@app/components/user/group-detail/group-feed-card/group-feed-card';
import { GroupMembersTabComponent } from '@app/components/user/group-detail/group-members-tab/group-members-tab';
import { GroupChatTabComponent } from '@app/components/user/group-detail/group-chat-tab/group-chat-tab';
import { GroupSettingsTabComponent } from '@app/components/user/group-detail/group-settings-tab/group-settings-tab';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';
import { AlertService } from '@app/components/shared/alert/alert.service';

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
  alertService = inject(AlertService);

  groupId = signal<string>('');
  myRole = computed(() => this.group()?.userRole || null);
  members = signal<Member[]>([]);
  feed = signal<any[]>([]);

  activeTab = signal<'feed' | 'members' | 'chat' | 'settings'>('feed');
  shareDialogState = signal<'closed' | 'open'>('closed');

  constructor() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (!id) return;

      this.groupId.set(id);
      this.groupService.setGroupId(id);

      this.members = this.groupService.groupMembers;
      this.feed = this.groupService.getGroupFeed(id) as any;
    });
  }

  group = computed(() => {
    const id = this.groupId();
    if (!id) return undefined;

    return this.groupService.getGroupById(id);
  });

  setActiveTab(tab: any) {
    this.activeTab.set(tab);
  }

  get canLeaveGroup(): boolean {
    if (!this.group()) return false;
    return this.myRole() !== 'OWNER';
  }

  onLeaveGroupClick() {
    this.alertService.show({
      description: 'Are you sure you want to leave the group? This action cannot be undone.',
      variant: 'destructive',
      actionLabel: 'Leave Group',
      action: () => this.leaveGroup(),
    });
  }

  leaveGroup() {
    this.groupService.leaveGroup(this.groupId()).subscribe({
      next: () => {
        this.router.navigate(['/user/groups']);
        toast.success('You have left the group');
      },
      error: (err) => {
        const errorMessage = extractErrorMessage(err);
        toast.error('Failed to leave group.', { description: errorMessage });
        console.error('Error leaving group:', err);
      },
    });
  }

  onShareSession(sessionId: string) {
    this.groupService.shareSession(this.groupId(), sessionId);
  }

  getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };

  getUserFullName = (firstName: string, lastName: string) => {
    return `${firstName} ${lastName}`;
  };
}
