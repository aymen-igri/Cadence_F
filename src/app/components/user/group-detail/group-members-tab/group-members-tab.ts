import { Component, effect, inject, input, output, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { provideIcons } from '@ng-icons/core';
import { lucideMoreVertical } from '@ng-icons/lucide';
import { Member, RequestItem } from '@app/core/models/group.model';
import { GroupService } from '@app/core/services/group.service';
import { BrnTabs } from "@spartan-ng/brain/tabs";

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

  getUserInitials = (firstName: string, lastName: string) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }

  promote = output<string>();
  demote = output<string>();
  remove = output<string>();
  acceptRequest = output<string>();
  declineRequest = output<string>();
}
