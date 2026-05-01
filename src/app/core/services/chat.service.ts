import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Client, Message } from '@stomp/stompjs';
import { GroupMessageResponse, SendGroupMessageRequest } from '../models/chat.model';
import { BehaviorSubject, Observable } from 'rxjs';
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
export class ChatService {
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private stompClient: Client | null = null;
  private currentSubscription: any = null;
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
    // 1. Configure the STOMP Client
    this.stompClient = new Client({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`, // Critical for your backend Interceptor
      },
      debug: (str) => {
        console.log(str); // Useful for development
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 2. On Successful Connection
    this.stompClient.onConnect = (frame) => {
      console.log('STOMP Connected: ', frame);

      // Clean up any old subscription if we changed groups
      if (this.currentSubscription) {
        this.currentSubscription.unsubscribe();
      }

      // 3. Subscribe to the Group's specific topic
      const topicPath = `/topic/groups/${groupId}`;
      this.currentSubscription = this.stompClient!.subscribe(topicPath, (message: Message) => {
        // This fires when ANY user (including us) sends a message and the backend broadcasts it
        if (message.body) {
          const newMsg: GroupMessageResponse = JSON.parse(message.body);
          this.handleIncomingMessage(newMsg);
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    // 4. Handle underlying WebSocket transport errors (e.g., server down, network drop)
    this.stompClient.onWebSocketError = (event) => {
      console.error('WebSocket connection error:', event);
    };

    this.stompClient.activate();
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
    if (this.currentSubscription) {
      this.currentSubscription.unsubscribe();
      this.currentSubscription = null;
    }
    if (this.stompClient && this.stompClient.active) {
      this.stompClient.deactivate();
    }
    // Clear the chat state
    this.messagesSubject.next([]);
  }
}
