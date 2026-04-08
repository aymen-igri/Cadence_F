import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { AuthTokens, AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly url = `${environment.apiUrl}`;

  currentUser = signal<User | null>(null);
  isReady = signal<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      this.clearTokens();
      this.isReady.set(true);
    } else {
      // TODO: Wrap your user fetching logic here and set isReady to true when done.
      // For now, simulating resolution:
      this.isReady.set(true);
    }
  }

  // ─── Auth calls ───────────────────────────────────────────

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.url}/login`, payload).pipe(
      tap((response) => {
        this.setTokens(response.tokens);
        this.currentUser.set(response.user);
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.url}/auth/signUp`, payload).pipe(
      tap((response) => {
        this.setTokens(response.tokens);
        this.currentUser.set(response.user);
      }),
    );
  }

  refresh() {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthTokens>(
        `${this.url}/refreshToken`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        },
      )
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  logout() {
    this.clearTokens();
    this.currentUser.set(null);
    this.router.navigate(['/sign-in']);
  }

  // ─── Token management ─────────────────────────────────────

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setTokens(tokens: AuthTokens): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, tokens.refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  // ─── Helpers ──────────────────────────────────────────────

  isLoggedIn(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;

    if (this.isTokenExpired(token)) {
      this.clearTokens();
      return false;
    }

    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64)); // or Buffer.from(...) for Node
      const now = Math.floor(Date.now() / 1000);

      if (!payload.exp) return true; // no expiry = treat as expired
      return payload.exp < now + 30; // 30s clock skew buffer
    } catch (e) {
      return true;
    }
  }

  hasRole(role: string): boolean {
    return this.currentUser()?.role === role;
  }
}
