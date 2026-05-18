import { Component, input, output , ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Notification } from '@app/core/models/notification.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notification-item',
  imports: [CommonModule, ...HlmButtonImports],
  templateUrl: './notification-item.html',
})
export class NotificationItem {
  item = input.required<Notification>();
  markAsRead = output<string>();

  onMarkAsRead() {
    if (!this.item().isRead) {
      this.markAsRead.emit(this.item().id);
    }
  }
}
