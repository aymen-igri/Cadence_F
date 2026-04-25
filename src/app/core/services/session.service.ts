import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { CreateSessionRequest, CreateSessionResponse } from '../models/session.model';
import { createQuery } from '../utils/query.helper';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/session`;
  readonly allSessions = createQuery<CreateSessionResponse[]>([]);

  public createSession(payload: CreateSessionRequest) {
    return this.http.post<CreateSessionResponse>(`${this.url}/create`, payload).pipe(
      tap((newSession) => {
        this.allSessions.mutate((sessions) => [...sessions, newSession]);
      }),
    );
  }

  public loadAllSessions() {
    return this.allSessions.load(this.http.get<CreateSessionResponse[]>(`${this.url}/all`));
  }
}
