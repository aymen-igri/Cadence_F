import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Notification } from '@app/core/models/notification.model';

@Component({
  selector: 'app-notification-item',
  imports: [CommonModule, NgIconsModule, ...HlmCardImports, ...HlmButtonImports],
  templateUrl: './notification-item.html',
})
export class NotificationItem {
  item = input.required<Notification>();
  markAsRead = output<string>();

  get icon() {
    const type = this.item().type;
    switch (type) {
      case 'DEADLINE':
        return 'alertTriangle';
      case 'SCHEDULE':
        return 'calendarClock';
      case 'MESSAGE':
        return 'messageCircle';
      case 'GROUP':
        return 'users';
      case 'ACADEMIC':
        return 'bookOpen';
      default:
        return 'bell';
    }
  }

  onMarkAsRead() {
    if (!this.item().isRead) {
      this.markAsRead.emit(this.item().id);
    }
  }
}
