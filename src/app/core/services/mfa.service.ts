import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { MfaMethod } from '../models/mfa-type.model';
import { AuthResponse } from '../models/auth.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MfaService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private readonly url = `${environment.apiUrl}/mfa`

  selectedMethod = signal<MfaMethod | null>(null);
  temporaryMfaToken = signal<string | null>(null);

  triggerEmailCode() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.temporaryMfaToken()}`);
    return this.http.post<{ message: string }>(`${this.url}/email/trigger`, {}, { headers });
  }

  triggerEmailCodeForPasswordChange() {
    // Uses the current user's access token (authenticated context)
    const accessToken = this.authService.getAccessToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${accessToken}`);
    return this.http.post<{ message: string }>(`${this.url}/email/trigger`, {}, { headers });
  }

  verifyOtp(code: string) {
     const headers = new HttpHeaders().set('Authorization', `Bearer ${this.temporaryMfaToken()}`);
     const methodValue = this.selectedMethod() === 'EMAIL' ? 'EMAIL' : 'APP';
     return this.http.post<AuthResponse>(`${this.url}/verify?code=${code}&type=${methodValue}`, {}, { headers }).pipe(
       tap((response) => {
         this.authService.setTokens(response.tokens!);
         this.authService.currentUser.set(response.user);
         localStorage.setItem('current_user', JSON.stringify(response.user));
       })
     );
   }

   generateAppSecret() {
    return this.http.get<{ secret: string, qrUrl: string }>(`${this.url}/app/setUp`);
   }

   confirmSetup(code: string) {
    return this.http.post(`${this.url}/app/confirm`, { code });
   }
}
