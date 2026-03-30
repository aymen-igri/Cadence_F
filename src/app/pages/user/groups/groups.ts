import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupService } from '@app/core/services/group.service';
import { GroupCardComponent } from '@app/components/user/groups/group-card/group-card';
import { CreateGroupDialogComponent } from '@app/components/user/groups/create-group-dialog/create-group-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-groups-page',
  standalone: true,
  imports: [
    CommonModule,
    GroupCardComponent,
    CreateGroupDialogComponent,
    HlmButtonImports,
    BrnDialogImports,
    HlmTabsImports,
  ],
  templateUrl: './groups.html',
})
export class GroupsComponent {
  groupService = inject(GroupService);
  router = inject(Router);

  activeTab = signal<'my-groups' | 'discover'>('my-groups');
  createGroupState = signal<'closed' | 'open'>('closed');

  setActiveTab(tab: any) {
    this.activeTab.set(tab);
  }

  navigateToGroup(groupId: string) {
    this.router.navigate(['/user/groups', groupId]);
  }

  joinGroup(groupId: string) {
    this.groupService.joinGroup(groupId);
    // Move to my groups tab after joining if it makes sense, or show a toast
    setTimeout(() => this.activeTab.set('my-groups'), 300);
  }

  requestToJoin(groupId: string) {
    this.groupService.requestToJoin(groupId);
    // Show a toast ideally
  }
}
