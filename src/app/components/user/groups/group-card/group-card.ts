import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Group } from '../../../../core/models/group.model';

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

  cardClick = output<string>();
  joinClick = output<string>();
  requestJoinClick = output<string>();

  onJoinClick(event: Event) {
    event.stopPropagation();
    this.joinClick.emit(this.group().id);
  }

  onRequestJoinClick(event: Event) {
    event.stopPropagation();
    this.requestJoinClick.emit(this.group().id);
  }
}
