import { inject, Injectable, OnDestroy } from '@angular/core';
import { GroupMessageResponse, SendGroupMessageRequest, PagedMessageResponse } from '../models/chat.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { WebSocketService } from './websocket.service';

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
  private http = inject(HttpClient);
  private wsService = inject(WebSocketService);
  private destroy$ = new Subject<void>();
  private readonly apiUrl = `${environment.apiUrl}/groups`;

  private messagesSubject = new BehaviorSubject<GroupMessageResponse[]>([]);
  public messages$ = this.messagesSubject.asObservable();
  readonly messages = toSignal(this.messages$, { initialValue: [] });

  private currentPageSubject = new BehaviorSubject<number>(0);
  readonly currentPage = toSignal(this.currentPageSubject, { initialValue: 0 });

  private hasMoreSubject = new BehaviorSubject<boolean>(false);
  readonly hasMore = toSignal(this.hasMoreSubject, { initialValue: false });

  sendMessage(groupId: string, content: string): Observable<GroupMessageResponse> {
    const url = `${this.apiUrl}/${groupId}/messages`;
    const payload: SendGroupMessageRequest = { content };

    // We do NOT manually push this to our local BehaviorSubject here.
    // Instead, we wait for the WebSocket to bounce our own message back to us
    // so we know the server definitely verified, saved, and stamped it.
    return this.http.post<GroupMessageResponse>(url, payload);
  }

  loadPagedChatHistory(groupId: string, page: number, size: number = 20): Observable<PagedMessageResponse> {
    const url = `${this.apiUrl}/${groupId}/messages/paginated?page=${page}&size=${size}`;
    return this.http.get<PagedMessageResponse>(url).pipe(
      tap({
        next: (response) => {
          this.currentPageSubject.next(response.currentPage);
          this.hasMoreSubject.next(response.hasMore);
          
          if (page === 0) {
            this.messagesSubject.next(response.messages);
          } else {
            const currentMessages = this.messagesSubject.getValue();
            this.messagesSubject.next([...response.messages, ...currentMessages]);
          }
        },
        error: (err) => console.error('Failed to load paginated history', err),
      })
    );
  }

  connectAndSubscribe(groupId: string): void {
    // Ensure WebSocket connection is established
    this.wsService.connect();

    // Subscribe to group chat
    this.subscribeToGroupChat(groupId);
  }

  private subscribeToGroupChat(groupId: string): void {
    const topicPath = `/topic/groups/${groupId}`;

    this.wsService
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
        error: (err) => console.error('[ChatService] Subscription error:', err),
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
    // Clear the chat state
    this.messagesSubject.next([]);
    this.currentPageSubject.next(0);
    this.hasMoreSubject.next(false);
    // Note: We don't disconnect the WebSocket here as it's shared
    // The WebSocketService manages the connection lifecycle
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
