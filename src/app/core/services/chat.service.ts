import { inject, Injectable, OnDestroy } from '@angular/core';
import { AuthService } from './auth.service';
import { RxStomp } from '@stomp/rx-stomp';
import { GroupMessageResponse, SendGroupMessageRequest } from '../models/chat.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  groupId: string;
  senderName: string;
  content: string;
  sentAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService implements OnDestroy {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private rxStomp: RxStomp = new RxStomp();
  private destroy$ = new Subject<void>();
  private readonly apiUrl = `${environment.apiUrl}/groups`;

  private messagesSubject = new BehaviorSubject<GroupMessageResponse[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  readonly messages = toSignal(this.messages$, { initialValue: [] });

  sendMessage(groupId: string, content: string): Observable<GroupMessageResponse> {
    const url = `${this.apiUrl}/${groupId}/messages`;
    const payload: SendGroupMessageRequest = { content };

    // We do NOT manually push this to our local BehaviorSubject here.
    // Instead, we wait for the WebSocket to bounce our own message back to us
    // so we know the server definitely verified, saved, and stamped it.
    return this.http.post<GroupMessageResponse>(url, payload);
  }

  loadChatHistory(groupId: string): Observable<GroupMessageResponse[]> {
    const url = `${this.apiUrl}/${groupId}/messages`;
    const request$ = this.http.get<GroupMessageResponse[]>(url);

    request$.subscribe({
      next: (history) => {
        // Replace current state with fetched history
        this.messagesSubject.next(history);
      },
      error: (err) => console.error('Failed to load history', err),
    });

    return request$;
  }

  connectAndSubscribe(groupId: string): void {
    const token = this.authService.getAccessToken();
    if (!token) return;

    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/ws';

    // Configure the RxStomp client
    this.rxStomp.configure({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str: string) => {
        console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // Activate connection
    this.rxStomp.activate();

    // Handle connection success and subscribe to group chat
    this.rxStomp.connected$
      .pipe(
        tap(() => {
          console.log('STOMP Connected');
          this.subscribeToGroupChat(groupId);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (err) => console.error('Connection error:', err),
      });
  }

  private subscribeToGroupChat(groupId: string): void {
    const topicPath = `/topic/groups/${groupId}`;

    this.rxStomp
      .watch(topicPath)
      .pipe(
        tap((message) => {
          if (message.body) {
            const newMsg: GroupMessageResponse = JSON.parse(message.body);
            this.handleIncomingMessage(newMsg);
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: (err) => console.error('Subscription error:', err),
      });
  }
  private handleIncomingMessage(message: GroupMessageResponse): void {
    const currentMessages = this.messagesSubject.getValue();

    // Optional: Check if we haven't already processed this exact message locally
    const exists = currentMessages.find((m) => m.id === message.id);
    if (!exists) {
      this.messagesSubject.next([...currentMessages, message]);
    }
  }

  /**
   * MUST be called when leaving the chat component
   */
  disconnect(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.rxStomp.active) {
      this.rxStomp.deactivate();
    }
    // Clear the chat state
    this.messagesSubject.next([]);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
