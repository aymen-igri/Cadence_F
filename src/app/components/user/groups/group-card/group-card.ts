import { Component, input, output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Group } from '../../../../core/models/group.model';
import { AlertService } from '@app/components/shared/alert/alert.service';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule, HlmCardImports, HlmBadgeImports, HlmButtonImports],
  templateUrl: './group-card.html',
})
export class GroupCardComponent {
  group = input.required<Group>();
  userRole = input<'MEMBER' | 'ADMIN' | 'OWNER' | null>();
  memberCount = input.required<number>();
  private alertService = inject(AlertService);

  cardClick = output<string>();
  joinClick = output<string>();
  requestJoinClick = output<string>();
  isClickable = input<boolean>(true);

  handleCardClick(event: Event) {
    event.stopPropagation();
    if (!this.isClickable()) return;
    this.cardClick.emit(this.group().id);
  }

  onJoinClick(event: Event) {
    event.stopPropagation();
    this.joinClick.emit(this.group().id);
  }

  onRequestJoinClick(event: Event) {
    event.stopPropagation();
    this.alertService.show({
      actionLabel: 'Request to Join',
      description: 'Your request to join this group has been sent. The group admins will review your request and notify you of the outcome.',
      variant: 'default',
      action: () => {
        this.requestJoinClick.emit(this.group().id);
      }
    });
  }
}
