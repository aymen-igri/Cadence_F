import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  UpdateSessionRequest,
} from '../models/session.model';
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

  public updateSession(sessionId: string, payload: UpdateSessionRequest) {
    return this.http.patch<CreateSessionResponse>(`${this.url}/update/${sessionId}`, payload).pipe(
      tap((updatedSession) => {
        this.allSessions.mutate((sessions) =>
          sessions.map((session) =>
            session.weeklySession.id === sessionId ? updatedSession : session,
          ),
        );
      }),
    );
  }

  public deleteSession(sessionId: string) {
    return this.http.delete(`${this.url}/delete/${sessionId}`).pipe(
      tap(() => {
        this.allSessions.mutate((sessions) =>
          sessions.filter((session) => session.weeklySession.id !== sessionId),
        );
      }),
    );
  }
}
