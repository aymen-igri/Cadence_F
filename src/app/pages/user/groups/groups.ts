import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '@app/core/services/group.service';
import { CreateGroupDialogComponent } from '@app/components/user/groups/create-group-dialog/create-group-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { extractErrorMessage } from '@app/core/utils/error.util';
import { GroupDataTable } from "@app/components/user/groups/group-table/group-table";

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    CreateGroupDialogComponent,
    HlmButtonImports,
    BrnDialogImports,
    HlmTabsImports,
    GroupDataTable
],
  templateUrl: './groups.html',
})
export class GroupsComponent {
  groupService = inject(GroupService);
  router = inject(Router);

  activeTab = signal<'my-groups' | 'discover'>('my-groups');
  createGroupState = signal<'closed' | 'open'>('closed');
  readonly myGroups = this.groupService.myGroups;
  readonly discoverGroups = this.groupService.discoverGroups;
  readonly isGroupsLoading = this.groupService.allGroups.isLoading;

  ngOnInit() {
    this.groupService.loadAllGroups().subscribe();
  }

  setActiveTab(tab: any) {
    this.activeTab.set(tab);
  }

  navigateToGroup(groupId: string) {
    this.router.navigate(['/user/groups', groupId]);
  }

  joinGroup(groupId: string) {
    this.groupService.joinPublicGroup(groupId).subscribe({
      next: () => {
        this.router.navigate(['/user/groups', groupId]);
        toast.success('Group joined successfully!', {
          description: 'You have successfully joined the group.',
        });
      },
      error: (err) => {
        const errorMessage = extractErrorMessage(err);
        console.error('Failed to join group:', err);
        toast.error('Failed to join the group.', { description: errorMessage });
      },
    });
  }

  requestToJoin(groupId: string) {
    this.groupService.requestJoin(groupId).subscribe({
      next: () => {
        toast.success('Request sent successfully!', {
          description: 'You have successfully requested to join the group.',
        });
      },
      error: (err) => {
        const errorMessage = extractErrorMessage(err);
        console.error('Failed to send group request:', err);
        toast.error('Failed to send the group request.', { description: errorMessage });
      },
    });
  }
}
