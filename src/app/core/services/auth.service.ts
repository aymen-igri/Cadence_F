import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthTokens, AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly url = `${environment.apiUrl}`;
  private readonly USER_KEY = 'current_user';
  private http = inject(HttpClient);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isReady = signal<boolean>(false);

  constructor() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken || this.isTokenExpired(refreshToken)) {
      this.clearTokens();
      this.isReady.set(true);
    } else {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser) {
        this.currentUser.set(JSON.parse(storedUser));
      }
      this.isReady.set(true);
    }
  }

  // ─── Auth calls ───────────────────────────────────────────

  login(payload: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.url}/login`, payload).pipe(
      tap((response) => {
        if (response.tokens) {
          this.setTokens(response.tokens);
        }
        this.currentUser.set(response.user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
      }),
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.url}/auth/signUp`, payload).pipe(
      tap((response) => {
        this.setTokens(response.tokens!);
        this.currentUser.set(response.user);
      }),
    );
  }

  forgetPassword(identifier: string) {
    const params = new HttpParams().set('identifier', identifier);
    return this.http.post(`${this.url}/auth/forget-password`, null, { params, responseType: 'text' });
  }

  resetPassword(token: string, newPassword: string) {
    return this.http.post(`${this.url}/auth/reset-password`, { token, newPassword }, { responseType: 'text' });
  }

  updatePassword(payload: { oldPassword: string; newPassword: string; code?: string; type?: string }) {
    return this.http.patch(`${this.url}/users/update-password`, payload, { responseType: 'text' });
  }

  refresh() {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthTokens>(`${this.url}/auth/refreshToken`, { refreshToken })
      .pipe(tap((tokens) => this.setTokens(tokens)));
  }

  logout() {
    this.clearTokens();
    localStorage.removeItem(this.USER_KEY);
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
    const token = this.getRefreshToken();
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
