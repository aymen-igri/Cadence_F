import { Injectable, inject, linkedSignal } from '@angular/core';
import { HttpClient, httpResource } from '@angular/common/http';
import { tap } from 'rxjs';
import { Client, StompSubscription } from '@stomp/stompjs';
import { environment } from '../../environments/environments';
import { AuthService } from './auth.service';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = `${environment.apiUrl}/notifications`;

  private stompClient: Client | null = null;
  private notificationSubscription: StompSubscription | null = null;

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

    this.stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = () => {
      this.notificationSubscription = this.stompClient!.subscribe(
        '/user/queue/notifications',
        (message) => {
          if (!message.body) return;

          const newNotification: Notification = JSON.parse(message.body);
          this.notifications.update((list) => [newNotification, ...list]);
        },
      );
    };

    this.stompClient.activate();
  }

  disconnect(): void {
    this.notificationSubscription?.unsubscribe();
    this.notificationSubscription = null;

    if (this.stompClient?.active) {
      this.stompClient.deactivate();
    }

    this.stompClient = null;
  }
}
