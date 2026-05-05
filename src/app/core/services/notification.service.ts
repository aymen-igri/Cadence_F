import { Injectable, inject, linkedSignal, OnDestroy } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { tap, takeUntil } from 'rxjs';
import { RxStomp } from '@stomp/rx-stomp';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Notification } from '../models/notification.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private rxStomp: RxStomp = new RxStomp();
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
    const token = this.authService.getAccessToken();
    if (!token) return;

    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/ws';

    // Configure the RxStomp client
    this.rxStomp.configure({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Activate connection
    this.rxStomp.activate();

    // Handle connection success and subscribe to notifications
    this.rxStomp.connected$
      .pipe(
        tap(() => {
          this.subscribeToNotifications();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (err) => console.error('Connection error:', err),
      });
  }

  private subscribeToNotifications(): void {
    this.rxStomp
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
        error: (err) => console.error('Subscription error:', err),
      });
  }

  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.rxStomp.active) {
      this.rxStomp.deactivate();
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
