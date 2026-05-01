import { Component, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@app/core/services/notification.service';
import { InboxHeader } from '@app/components/user/inbox/inbox-header/inbox-header';
import { InboxFilters } from '@app/components/user/inbox/inbox-filters/inbox-filters';
import { NotificationsList } from '@app/components/user/inbox/notifications-list/notifications-list';
import { LucideAngularModule, Loader2, AlertCircle } from 'lucide-angular';
import { toast } from 'ngx-sonner';

@Component({
  selector: 'app-inbox',
  imports: [CommonModule, InboxHeader, InboxFilters, NotificationsList, LucideAngularModule],
  templateUrl: './inbox.html',
  providers: [NotificationService],
})
export class Inbox implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);

  readonly Loader2 = Loader2;
  readonly AlertCircle = AlertCircle;

  readonly resource = this.notificationService.notificationsResource;
  readonly notifications = this.notificationService.notifications;

  readonly isLoading = computed(() => this.resource.isLoading());
  readonly error = computed(() => this.resource.error());

  readonly unreadCount = computed(() => this.notifications()?.filter((n) => !n.isRead).length ?? 0);

  ngOnInit() {
    this.notificationService.connect();
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
  }

  onMarkAsRead(id: string) {
    this.notificationService.markAsRead(id).subscribe({
      next: () => {
      toast.success('Notification marked as read');
      },
      error: (err) => {
        console.error('Failed to mark notification as read', err);
        toast.error('Failed to mark notification as read');
      },
    });
  }

  onMarkAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        toast.success('All notifications marked as read');
      },
      error: (err) => {
        console.error('Failed to mark all notifications as read', err);
        toast.error('Failed to mark all notifications as read');
      },
    });
  }
}
