import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import {
  CreateSessionRequest,
  CreateSessionResponse,
  CreateSubSessionResponse,
  GenerateSessionRequest,
  MissedSubSession,
  SharedSession,
  ShareSessionRequest,
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
  readonly sessionDetails = createQuery<CreateSessionResponse | null>(null);
  readonly sharedSessions = createQuery<SharedSession[]>([]);
  readonly missedSubSessions = createQuery<MissedSubSession[]>([]);

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

  public deleteGeneratedSession(sessionId: string) {
    return this.http.delete(`${this.url}/delete/${sessionId}`).pipe(
      tap(() => {
        this.allGeneratedSessions.mutate((sessions) =>
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

  public loadSessionDetails(sessionId: string) {
    return this.sessionDetails.load(
      this.http.get<CreateSessionResponse>(`${this.url}/details/${sessionId}`),
    );
  }

  public shareSession(payload: ShareSessionRequest) {
    return this.http.post<SharedSession>(`${this.url}/share`, payload).pipe(
      tap((sharedSession) => {
        this.sharedSessions.mutate((sessions) => [...sessions, sharedSession]);
      }),
    );
  }

  public unshareSession(sessionId: string, groupId: string) {
    return this.http.delete(`${this.url}/${sessionId}/share/${groupId}`).pipe(
      tap(() => {
        this.sharedSessions.mutate((sessions) =>
          sessions.filter((s) => !(s.sessionId === sessionId && s.groupId === groupId)),
        );
      }),
    );
  }

  public forkSession(sharedSessionId: string) {
    return this.http.post<CreateSessionResponse>(
      `${this.url}/shared-sessions/${sharedSessionId}/fork`,
      {},
    ).pipe(
      tap((newSession) => {
        this.allSessions.mutate((sessions) => [...sessions, newSession]);
      }),
    );
  }

  public loadSharedSessions(groupId: string) {
    return this.sharedSessions.load(
      this.http.get<SharedSession[]>(`${this.url}/shared/${groupId}`),
    );
  }

  public loadMissingSubSession(sessionId: string) {
    return this.missedSubSessions.load(
      this.http.get<MissedSubSession[]>(`${this.url}/${sessionId}/missed`),
    );
  }
}
