import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import {
  LucideAngularModule,
  Bell,
  CalendarClock,
  MessageCircle,
  AlertTriangle,
  Users,
  BookOpen,
} from 'lucide-angular';
import { Notification } from '@app/core/models/notification.model';

@Component({
  selector: 'app-notification-item',
  imports: [CommonModule, LucideAngularModule, ...HlmCardImports, ...HlmButtonImports],
  templateUrl: './notification-item.html',
})
export class NotificationItem {
  item = input.required<Notification>();
  markAsRead = output<string>();

  get icon() {
    const type = this.item().type;
    switch (type) {
      case 'DEADLINE':
        return AlertTriangle;
      case 'SCHEDULE':
        return CalendarClock;
      case 'MESSAGE':
        return MessageCircle;
      case 'GROUP':
        return Users;
      case 'ACADEMIC':
        return BookOpen;
      default:
        return Bell;
    }
  }

  onMarkAsRead() {
    if (!this.item().isRead) {
      this.markAsRead.emit(this.item().id);
    }
  }
}
