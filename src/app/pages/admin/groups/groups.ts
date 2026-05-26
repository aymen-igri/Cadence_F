import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { GroupsFilterBarComponent } from '@app/components/admin/groups-filter-bar/groups-filter-bar';
import { GroupsListComponent } from '@app/components/admin/groups-list/groups-list';
import { GroupsDetailModalComponent } from '@app/components/admin/groups-detail-modal/groups-detail-modal';
import {
  GroupsManagementService,
  GroupFilterRequest,
  GroupData,
  GroupsFilterPayload,
} from '@app/core/services/groups-management.service';
import { toast } from 'ngx-sonner';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-admin-groups',
  imports: [GroupsFilterBarComponent, GroupsListComponent],
  templateUrl: './groups.html',
})
export class AdminGroups {
  private readonly groupsManagementService = inject(GroupsManagementService);
  private readonly dialog = inject(Dialog);

  groupsList = signal<GroupData[] | null>(null);
  isLoading = signal<boolean>(false);
  currentFilter = signal<GroupFilterRequest>({
    name: '',
    privacyLevel: '',
  });

  private readonly PAGE_SIZE = 20;

  constructor() {
    effect(() => this.loadGroups());
  }

  onFilterSubmitted(filter: GroupFilterRequest) {
    this.currentFilter.set(filter);
  }

  private loadGroups() {
    this.isLoading.set(true);

    const payload: GroupsFilterPayload = {
      groupData: this.currentFilter(),
      page: 0,
      size: this.PAGE_SIZE,
    };

    this.groupsManagementService.searchGroups(payload).subscribe({
      next: (data) => {
        this.groupsList.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        toast.error('Failed to load groups', {
          description: 'Unable to fetch groups data',
        });
        this.isLoading.set(false);
      },
    });
  }

  onGroupSelected(groupId: string) {
    this.dialog.open(GroupsDetailModalComponent, {
      data: { groupId },
    });
  }
}