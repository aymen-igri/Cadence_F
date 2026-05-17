import { Injectable, inject, linkedSignal, OnDestroy } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { tap, takeUntil } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';
import { Subject } from 'rxjs';
import { WebSocketService } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);

  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private destroy$ = new Subject<void>();

  readonly notificationsResource = httpResource<Notification[]>(() => {
    return {
      url: `${this.apiUrl}/getAll`,
      method: 'GET',
    };
  });

  readonly notifications = linkedSignal<Notification[], Notification[]>({
    source: () => (this.notificationsResource.hasValue() ? this.notificationsResource.value() : []),
    computation: (value) => value,
  });

  markAsRead(notificationId: string) {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, {}).pipe(
      tap(() => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
        );
      }),
    );
  }

  markAllAsRead() {
    return this.http.patch<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => {
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
      }),
    );
  }

  connect(): void {
    // Ensure WebSocket connection is established
    this.wsService.connect();

    // Subscribe to notifications
    this.subscribeToNotifications();
  }

  private subscribeToNotifications(): void {
    this.wsService
      .watch('/user/queue/notifications')
      .pipe(
        tap((message) => {
          if (!message.body) return;

          const newNotification: Notification = JSON.parse(message.body);
          this.notifications.update((list) => [newNotification, ...list]);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (err) => console.error('[NotificationService] Subscription error:', err),
      });
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Note: We don't disconnect the WebSocket here as it's shared
    // The WebSocketService manages the connection lifecycle
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
