import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  CreateSubSessionResponse,
  GenerateSessionRequest,
  UpdateSessionRequest,
} from '../models/session.model';
import { createQuery } from '../utils/query.helper';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/session`;
  readonly allSessions = createQuery<CreateSessionResponse[]>([]);
  readonly allGeneratedSessions = createQuery<CreateSessionResponse[]>([]);

  public createSession(payload: CreateSessionRequest) {
    return this.http.post<CreateSessionResponse>(`${this.url}/create`, payload).pipe(
      tap((newSession) => {
        this.allSessions.mutate((sessions) => [...sessions, newSession]);
      }),
    );
  }

  public loadAllSessions() {
    return this.allSessions.load(
      this.http.get<CreateSessionResponse[]>(`${this.url}/all/PUBLISHED`),
    );
  }

  public loadAllGeneratedSessions() {
    return this.allGeneratedSessions.load(
      this.http.get<CreateSessionResponse[]>(`${this.url}/all/DRAFT`),
    );
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

  public updateSubSessionStatus(
    weeklySessionId: string,
    subSessionId: string,
    status: 'PENDING' | 'COMPLETED',
  ) {
    return this.http
      .patch<CreateSubSessionResponse>(
        `${this.url}/${weeklySessionId}/sub-sessions/${subSessionId}/status`,
        { status },
      )
      .pipe(
        tap((updatedSession) => {
          this.allSessions.mutate((sessions) =>
            sessions.map((session) =>
              session.weeklySession.id === weeklySessionId
                ? {
                    ...session,
                    subSessions: session.subSessions.map((subSession) =>
                      subSession.id === subSessionId ? updatedSession : subSession,
                    ),
                  }
                : session,
            ),
          );
        }),
      );
  }

  public generateWeeklyPlan(payload: GenerateSessionRequest) {
    return this.http.post<CreateSessionResponse>(`${this.url}/generate`, payload).pipe(
      tap((newSession) => {
        this.allGeneratedSessions.mutate((sessions) => [...sessions, newSession]);
      }),
    );
  }

  public approveSession(sessionId: string) {
    return this.http.patch(`${this.url}/approve/${sessionId}`, {}).pipe(
      tap(() => {
        this.allGeneratedSessions.mutate((sessions) =>
          sessions.filter((session) => session.weeklySession.id !== sessionId),
        );
      }),
    );
  }
}
