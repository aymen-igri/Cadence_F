import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { GroupService } from './group.service';
import { environment } from '../../environments/environment';
import { GroupResponse, Member, JoinRequestResponse } from '../models/group.model';

const BASE = `${environment.apiUrl}/groups`;

const mockGroup = (id = 'g1', userRole: GroupResponse['userRole'] = 'OWNER'): GroupResponse => ({
  id,
  name: 'Study Group',
  description: 'A group for studying',
  privacyLevel: 'PUBLIC',
  membersCount: 1,
  membershipId: `m-${id}`,
  userRole,
  createdAt: new Date('2024-01-01'),
});

const mockMember = (membershipId = 'mem1', role: Member['role'] = 'MEMBER'): Member => ({
  membershipId,
  userId: 'user1',
  firstName: 'Alice',
  lastName: 'Smith',
  username: 'alice',
  role,
  joinedAt: new Date('2024-01-01'),
});

const mockJoinRequest = (userId = 'user2'): JoinRequestResponse => ({
  id: 'req1',
  groupId: 'g1',
  userId,
  firstName: 'Bob',
  lastName: 'Jones',
  username: 'bob',
  status: 'PENDING',
  requestedAt: new Date('2024-01-01'),
});

describe('GroupService', () => {
  let service: GroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    const authServiceSpy = { isReady: vi.fn(), currentUser: vi.fn() };
    authServiceSpy.isReady.mockReturnValue(true);
    authServiceSpy.currentUser.mockReturnValue({ id: 'user1' });

    TestBed.configureTestingModule({
      providers: [
        GroupService,
        { provide: AuthService, useValue: authServiceSpy },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(GroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ─── loadAllGroups ────────────────────────────────────────────────────────

  it('should GET all groups and populate allGroups.data', () => {
    const groups = [mockGroup('g1'), mockGroup('g2', null)];

    service.loadAllGroups().subscribe();

    const req = httpMock.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(groups);

    expect(service.allGroups.data()).toEqual(groups);
  });

  it('should deduplicate concurrent loadAllGroups requests (shareReplay)', () => {
    const mockGroups: GroupResponse[] = [mockGroup()];

    service.loadAllGroups().subscribe();
    service.loadAllGroups().subscribe();
    service.loadAllGroups().subscribe();

    // Only ONE HTTP request should be made
    const req = httpMock.expectOne(`${BASE}/all`);
    expect(req.request.method).toBe('GET');
    req.flush(mockGroups);
  });

  // ─── myGroups / discoverGroups computed signals ────────────────────────────

  it('should only include groups where userRole is not null in myGroups', () => {
    const owned = mockGroup('g1', 'OWNER');
    const member = mockGroup('g2', 'MEMBER');
    const discover = mockGroup('g3', null);

    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([owned, member, discover]);

    expect(service.myGroups()).toEqual([owned, member]);
  });

  it('should only include groups where userRole is null in discoverGroups', () => {
    const owned = mockGroup('g1', 'OWNER');
    const discover = mockGroup('g3', null);

    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([owned, discover]);

    expect(service.discoverGroups()).toEqual([discover]);
  });

  // ─── getGroupDataById ─────────────────────────────────────────────────────

  it('should GET a group by ID and populate currentGroup.data', () => {
    const group = mockGroup('g1');

    service.getGroupDataById('g1').subscribe();

    const req = httpMock.expectOne(`${BASE}/g1`);
    expect(req.request.method).toBe('GET');
    req.flush(group);

    expect(service.currentGroup.data()).toEqual(group);
  });

  // ─── loadGroupMembers ─────────────────────────────────────────────────────

  it('should GET group members and populate groupMembers.data', () => {
    const members = [mockMember('mem1')];

    service.loadGroupMembers('g1').subscribe();

    const req = httpMock.expectOne(`${BASE}/g1/members`);
    expect(req.request.method).toBe('GET');
    req.flush(members);

    expect(service.groupMembers.data()).toEqual(members);
  });

  // ─── createGroup ──────────────────────────────────────────────────────────

  it('should POST to create a group and append it to allGroups.data', () => {
    const payload = { name: 'New Group', description: 'Desc', privacyLevel: 'PUBLIC' as const };
    const created = mockGroup('g-new');

    service.createGroup(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/create`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(created);

    expect(service.allGroups.data()).toContainEqual(created);
  });

  // ─── updateGroup ──────────────────────────────────────────────────────────

  it('should PATCH to update a group and replace it in allGroups.data', () => {
    const original = mockGroup('g1');
    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([original]);

    const updated: GroupResponse = { ...original, name: 'Updated Name' };
    service.updateGroup('g1', { name: 'Updated Name' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/g1`);
    expect(req.request.method).toBe('PATCH');
    req.flush(updated);

    expect(service.allGroups.data()[0].name).toBe('Updated Name');
  });

  // ─── deleteGroup ──────────────────────────────────────────────────────────

  it('should DELETE a group and remove it from allGroups.data', () => {
    const g1 = mockGroup('g1');
    const g2 = mockGroup('g2');
    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([g1, g2]);

    service.deleteGroup('g1').subscribe();
    const req = httpMock.expectOne(`${BASE}/g1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.allGroups.data()).toEqual([g2]);
  });

  // ─── loadJoinRequests ─────────────────────────────────────────────────────

  it('should GET join requests and populate joinRequests.data', () => {
    const requests = [mockJoinRequest('user2')];

    service.loadJoinRequests('g1').subscribe();

    const req = httpMock.expectOne(`${BASE}/g1/requests`);
    expect(req.request.method).toBe('GET');
    req.flush(requests);

    expect(service.joinRequests.data()).toEqual(requests);
  });

  // ─── acceptJoinRequest ────────────────────────────────────────────────────

  it('should PATCH to accept a join request, add the user to members and remove from joinRequests', () => {
    // Pre-populate join requests
    service.loadJoinRequests('g1').subscribe();
    httpMock.expectOne(`${BASE}/g1/requests`).flush([mockJoinRequest('user2')]);

    const newMember = mockMember('mem-new');
    service.acceptJoinRequest('g1', 'user2').subscribe();

    const req = httpMock.expectOne(`${BASE}/g1/requests/user2/approve`);
    expect(req.request.method).toBe('PATCH');
    req.flush(newMember);

    // Member should be added
    expect(service.groupMembers.data()).toContainEqual(newMember);
    // Request should be removed
    expect(service.joinRequests.data().find((r) => r.userId === 'user2')).toBeUndefined();
  });

  // ─── declineJoinRequest ───────────────────────────────────────────────────

  it('should DELETE to decline a join request and remove it from joinRequests.data', () => {
    service.loadJoinRequests('g1').subscribe();
    httpMock.expectOne(`${BASE}/g1/requests`).flush([mockJoinRequest('user2')]);

    service.declineJoinRequest('g1', 'user2').subscribe();
    const req = httpMock.expectOne(`${BASE}/g1/requests/user2/reject`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.joinRequests.data()).toEqual([]);
  });

  // ─── promoteMember ────────────────────────────────────────────────────────

  it('should PATCH to promote a member and update their role to ADMIN', () => {
    const member = mockMember('mem1', 'MEMBER');
    service.loadGroupMembers('g1').subscribe();
    httpMock.expectOne(`${BASE}/g1/members`).flush([member]);

    service.promoteMember('g1', 'mem1').subscribe();
    httpMock.expectOne(`${BASE}/g1/members/mem1/promote`).flush(null);

    expect(service.groupMembers.data()[0].role).toBe('ADMIN');
  });

  // ─── demoteMember ─────────────────────────────────────────────────────────

  it('should PATCH to demote a member and update their role to MEMBER', () => {
    const admin = mockMember('mem1', 'ADMIN');
    service.loadGroupMembers('g1').subscribe();
    httpMock.expectOne(`${BASE}/g1/members`).flush([admin]);

    service.demoteMember('g1', 'mem1').subscribe();
    httpMock.expectOne(`${BASE}/g1/members/mem1/demote`).flush(null);

    expect(service.groupMembers.data()[0].role).toBe('MEMBER');
  });

  // ─── removeMember ─────────────────────────────────────────────────────────

  it('should DELETE a member and remove them from groupMembers.data', () => {
    const mem1 = mockMember('mem1');
    const mem2 = mockMember('mem2');
    service.loadGroupMembers('g1').subscribe();
    httpMock.expectOne(`${BASE}/g1/members`).flush([mem1, mem2]);

    service.removeMember('g1', 'mem1').subscribe();
    const req = httpMock.expectOne(`${BASE}/g1/members/mem1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);

    expect(service.groupMembers.data()).toEqual([mem2]);
  });

  // ─── getGroupById ─────────────────────────────────────────────────────────

  it('should return the group with the matching ID from allGroups.data', () => {
    const g1 = mockGroup('g1');
    const g2 = mockGroup('g2');
    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([g1, g2]);

    expect(service.getGroupById('g2')).toEqual(g2);
  });

  it('should return undefined when no group matches the given ID', () => {
    service.loadAllGroups().subscribe();
    httpMock.expectOne(`${BASE}/all`).flush([mockGroup('g1')]);

    expect(service.getGroupById('non-existent')).toBeUndefined();
  });
});
