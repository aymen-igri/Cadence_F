import { Injectable, inject, OnDestroy } from '@angular/core';
import { RxStomp, RxStompState } from '@stomp/rx-stomp';
import { Subject, filter, takeUntil } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

/**
 * Centralized WebSocket service that manages a single STOMP connection
 * with automatic token refresh and reconnection handling.
 */
@Injectable({ providedIn: 'root' })
export class WebSocketService implements OnDestroy {
  private authService = inject(AuthService);
  private rxStomp: RxStomp | null = null;
  private destroy$ = new Subject<void>();
  private currentToken: string | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  /**
   * Gets or creates the shared RxStomp connection.
   * Automatically reconnects with fresh token if needed.
   */
  getConnection(): RxStomp {
    if (!this.rxStomp) {
      this.rxStomp = new RxStomp();
      this.configureConnection();
      this.setupConnectionMonitoring();
      this.setupTokenRefreshListener();
    }
    return this.rxStomp;
  }

  /**
   * Listen for auth token refresh events and reconnect WebSocket.
   */
  private setupTokenRefreshListener(): void {
    if (typeof window === 'undefined') return;

    const handleTokenRefresh = () => {
      console.log('[WebSocket] Token refresh detected, reconnecting...');
      this.reconnectWithNewToken();
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefresh);

    // Clean up listener on destroy
    this.destroy$.subscribe(() => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefresh);
    });
  }

  /**
   * Connects to WebSocket with current auth token.
   */
  connect(): void {
    const token = this.authService.getAccessToken();
    if (!token) {
      console.warn('[WebSocket] No access token available');
      return;
    }

    this.currentToken = token;
    const connection = this.getConnection();

    if (connection.active) {
      console.log('[WebSocket] Connection already active');
      return;
    }

    connection.activate();
    this.reconnectAttempts = 0;
  }

  /**
   * Disconnects and clears the WebSocket connection.
   */
  disconnect(): void {
    if (this.rxStomp?.active) {
      console.log('[WebSocket] Disconnecting...');
      this.rxStomp.deactivate();
    }
    this.rxStomp = null;
    this.currentToken = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Reconnects with a fresh token (e.g., after token refresh).
   */
  reconnectWithNewToken(): void {
    const newToken = this.authService.getAccessToken();

    if (!newToken || newToken === this.currentToken) {
      return;
    }

    console.log('[WebSocket] Token changed, reconnecting...');
    this.disconnect();
    this.connect();
  }

  /**
   * Watch a STOMP topic/queue.
   */
  watch(destination: string) {
    const connection = this.getConnection();
    return connection.watch(destination).pipe(takeUntil(this.destroy$));
  }

  /**
   * Publish to a STOMP destination.
   */
  publish(destination: string, body: string, headers?: Record<string, string>) {
    const connection = this.getConnection();
    connection.publish({ destination, body, headers });
  }

  private configureConnection(): void {
    if (!this.rxStomp) return;

    const token = this.authService.getAccessToken();
    const wsUrl = environment.apiUrl.replace(/^http/, 'ws') + '/ws';

    this.rxStomp.configure({
      brokerURL: wsUrl,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str: string) => {
        if (environment.production) return;
        console.log('[WebSocket Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });
  }

  private setupConnectionMonitoring(): void {
    if (!this.rxStomp) return;

    // Monitor connection state
    this.rxStomp.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: RxStompState) => {
        console.log('[WebSocket] State:', RxStompState[state]);

        // Handle disconnections
        if (state === RxStompState.CLOSED) {
          this.handleDisconnection();
        }
      });

    // Monitor connection success
    this.rxStomp.connected$
      .pipe(
        filter((state) => state === RxStompState.OPEN),
        takeUntil(this.destroy$),
      )
      .subscribe(() => {
        console.log('[WebSocket] Connected successfully');
        this.reconnectAttempts = 0;
      });

    // Monitor WebSocket errors
    this.rxStomp.webSocketErrors$.pipe(takeUntil(this.destroy$)).subscribe((error) => {
      console.error('[WebSocket] Error:', error);

      // Check if it's an auth error (401)
      if (this.isAuthError(error)) {
        console.log('[WebSocket] Auth error detected, attempting token refresh...');
        this.handleAuthError();
      }
    });
  }

  private handleDisconnection(): void {
    if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts})...`);

    // Check if token might be expired
    const currentToken = this.authService.getAccessToken();
    if (currentToken !== this.currentToken) {
      // Token has been refreshed by auth interceptor
      this.reconnectWithNewToken();
    }
  }

  private handleAuthError(): void {
    // Let the auth interceptor handle token refresh
    // When it refreshes, we'll reconnect with the new token
    console.log('[WebSocket] Waiting for token refresh...');

    // Set up a one-time check for token change
    setTimeout(() => {
      const newToken = this.authService.getAccessToken();
      if (newToken && newToken !== this.currentToken) {
        this.reconnectWithNewToken();
      }
    }, 2000);
  }

  private isAuthError(error: any): boolean {
    // Check various error formats that might indicate auth issues
    return (
      error?.status === 401 ||
      error?.statusCode === 401 ||
      error?.code === 'UNAUTHORIZED' ||
      (typeof error === 'string' && error.includes('401'))
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.disconnect();
  }
}
