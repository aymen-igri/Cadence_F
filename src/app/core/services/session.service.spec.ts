import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SessionService } from './session.service';
import { environment } from '../../environments/environment';
import {
  CreateSessionResponse,
  SharedSession,
  MissedSubSession,
} from '../models/session.model';

const BASE = `${environment.apiUrl}/session`;

const mockSessionResponse = (id = 'ws1'): CreateSessionResponse => ({
  weeklySession: {
    id,
    title: 'Week 1',
    weekNumber: 1,
    weekYear: 2024,
    sessionStatus: 'PENDING',
  },
  subSessions: [
    {
      id: 'ss1',
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      status: 'PENDING',
      subjectId: 'sub1',
      subjectName: 'Math',
    },
  ],
});

const mockSharedSession = (): SharedSession => ({
  sharedSessionId: 'share1',
  sessionId: 'ws1',
  sessionTitle: 'Week 1',
  groupId: 'grp1',
  groupName: 'Study Group',
  permission: 'VIEW_ONLY',
  sharedAt: '2024-01-01T00:00:00Z',
  sharedByUserId: 'user1',
  sharedByUsername: 'alice',
});

describe('SessionService', () => {
  let service: SessionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SessionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── createSession ────────────────────────────────────────────────────────

  it('should POST to create a session and append it to allSessions.data', () => {
    const payload = {
      weeklySession: { title: 'Week 1', weekYear: 2024, weekNumber: 1 },
      subSessions: [],
    };
    const created = mockSessionResponse('ws-new');

    service.createSession(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);

    expect(service.allSessions.data()).toContainEqual(created);
  });

  // ─── loadAllSessions ──────────────────────────────────────────────────────

  it('should GET published sessions and populate allSessions.data', () => {
    const sessions = [mockSessionResponse('ws1')];

    service.loadAllSessions().subscribe();

    const req = httpMock.expectOne(`${BASE}/all/PUBLISHED`);
    expect(req.request.method).toBe('GET');
    req.flush(sessions);

    expect(service.allSessions.data()).toEqual(sessions);
  });

  // ─── loadAllGeneratedSessions ─────────────────────────────────────────────

  it('should GET draft sessions and populate allGeneratedSessions.data', () => {
    const sessions = [mockSessionResponse('ws-draft')];

    service.loadAllGeneratedSessions().subscribe();

    const req = httpMock.expectOne(`${BASE}/all/DRAFT`);
    expect(req.request.method).toBe('GET');
    req.flush(sessions);

    expect(service.allGeneratedSessions.data()).toEqual(sessions);
  });

  // ─── updateSession ────────────────────────────────────────────────────────

  it('should PATCH to update a session and replace it in allSessions.data', () => {
    const original = mockSessionResponse('ws1');
    service.loadAllSessions().subscribe();
    httpMock.expectOne(`${BASE}/all/PUBLISHED`).flush([original]);

    const updated: CreateSessionResponse = {
      ...original,
      weeklySession: { ...original.weeklySession, title: 'Updated Week 1' },
    };

    service.updateSession('ws1', { weeklySession: { title: 'Updated Week 1', weekYear: 2024, weekNumber: 1 } }).subscribe();

    const req = httpMock.expectOne(`${BASE}/update/ws1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updated);

    expect(service.allSessions.data()[0].weeklySession.title).toBe('Updated Week 1');
  });

  // ─── deleteSession ────────────────────────────────────────────────────────

  it('should DELETE a session and remove it from allSessions.data', () => {
    const s1 = mockSessionResponse('ws1');
    const s2 = mockSessionResponse('ws2');
    service.loadAllSessions().subscribe();
    httpMock.expectOne(`${BASE}/all/PUBLISHED`).flush([s1, s2]);

    service.deleteSession('ws1').subscribe();
    const req = httpMock.expectOne(`${BASE}/delete/ws1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.allSessions.data()).toEqual([s2]);
  });

  // ─── deleteGeneratedSession ───────────────────────────────────────────────

  it('should DELETE a draft session and remove it from allGeneratedSessions.data', () => {
    const d1 = mockSessionResponse('ws-draft-1');
    const d2 = mockSessionResponse('ws-draft-2');
    service.loadAllGeneratedSessions().subscribe();
    httpMock.expectOne(`${BASE}/all/DRAFT`).flush([d1, d2]);

    service.deleteGeneratedSession('ws-draft-1').subscribe();
    httpMock.expectOne(`${BASE}/delete/ws-draft-1`).flush(null);

    expect(service.allGeneratedSessions.data()).toEqual([d2]);
  });

  // ─── approveSession ───────────────────────────────────────────────────────

  it('should PATCH to approve a session and remove it from allGeneratedSessions.data', () => {
    const d1 = mockSessionResponse('ws-draft-1');
    service.loadAllGeneratedSessions().subscribe();
    httpMock.expectOne(`${BASE}/all/DRAFT`).flush([d1]);

    service.approveSession('ws-draft-1').subscribe();

    const req = httpMock.expectOne(`${BASE}/approve/ws-draft-1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(null);

    expect(service.allGeneratedSessions.data()).toEqual([]);
  });

  // ─── loadSessionDetails ───────────────────────────────────────────────────

  it('should GET and populate sessionDetails.data', () => {
    const details = mockSessionResponse('ws1');

    service.loadSessionDetails('ws1').subscribe();

    const req = httpMock.expectOne(`${BASE}/details/ws1`);
    expect(req.request.method).toBe('GET');
    req.flush(details);

    expect(service.sessionDetails.data()).toEqual(details);
  });

  // ─── shareSession ─────────────────────────────────────────────────────────

  it('should POST to share a session and append to sharedSessions.data', () => {
    const payload = { sessionId: 'ws1', groupId: 'grp1', permission: 'VIEW_ONLY' as const };
    const shared = mockSharedSession();

    service.shareSession(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/share`);
    expect(req.request.method).toBe('POST');
    req.flush(shared);

    expect(service.sharedSessions.data()).toContainEqual(shared);
  });

  // ─── unshareSession ───────────────────────────────────────────────────────

  it('should DELETE to unshare a session and remove it from sharedSessions.data', () => {
    const shared = mockSharedSession();
    service.shareSession({ sessionId: 'ws1', groupId: 'grp1', permission: 'VIEW_ONLY' }).subscribe();
    httpMock.expectOne(`${BASE}/share`).flush(shared);

    service.unshareSession('ws1', 'grp1').subscribe();
    const req = httpMock.expectOne(`${BASE}/ws1/share/grp1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.sharedSessions.data()).toEqual([]);
  });

  // ─── forkSession ──────────────────────────────────────────────────────────

  it('should POST to fork a session and append it to allSessions.data', () => {
    const forked = mockSessionResponse('ws-forked');

    service.forkSession('shared-session-1').subscribe();

    const req = httpMock.expectOne(`${BASE}/shared-sessions/shared-session-1/fork`);
    expect(req.request.method).toBe('POST');
    req.flush(forked);

    expect(service.allSessions.data()).toContainEqual(forked);
  });

  // ─── loadSharedSessions ───────────────────────────────────────────────────

  it('should GET shared sessions for a group and populate sharedSessions.data', () => {
    const sessions = [mockSharedSession()];

    service.loadSharedSessions('grp1').subscribe();

    const req = httpMock.expectOne(`${BASE}/shared/grp1`);
    expect(req.request.method).toBe('GET');
    req.flush(sessions);

    expect(service.sharedSessions.data()).toEqual(sessions);
  });

  // ─── loadMissingSubSession ────────────────────────────────────────────────

  it('should GET missed sub-sessions and populate missedSubSessions.data', () => {
    const missed: MissedSubSession[] = [
      {
        id: 'ss-missed',
        dayOfWeek: 'FRIDAY',
        startTime: '14:00',
        endTime: '15:00',
        subjectId: 'sub1',
        subjectName: 'Physics',
      },
    ];

    service.loadMissingSubSession('ws1').subscribe();

    const req = httpMock.expectOne(`${BASE}/ws1/missed`);
    expect(req.request.method).toBe('GET');
    req.flush(missed);

    expect(service.missedSubSessions.data()).toEqual(missed);
  });
});
