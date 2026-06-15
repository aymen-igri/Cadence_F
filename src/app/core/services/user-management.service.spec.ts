import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  UserManagementService,
  UsersFilterPayload,
  UsersPaginatedResponse,
  UserDetailsResponse,
} from './user-management.service';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiUrl}/admin/users`;

const mockPaginatedResponse = (): UsersPaginatedResponse => ({
  totalPages: 1,
  totalElements: 2,
  size: 10,
  content: [
    {
      id: 'u1',
      firstName: 'Alice',
      lastName: 'Smith',
      gender: 'FEMALE',
      email: 'alice@example.com',
      phone: '0600000001',
      status: 'ACTIVE',
    },
  ],
  number: 0,
  sort: { empty: true, sorted: false, unsorted: true },
  first: true,
  last: true,
  pageable: {
    offset: 0,
    sort: { empty: true, sorted: false, unsorted: true },
    paged: true,
    pageNumber: 0,
    pageSize: 10,
    unpaged: false,
  },
  numberOfElements: 1,
  empty: false,
});

const mockUserDetails = (): UserDetailsResponse => ({
  id: 'u1',
  firstName: 'Alice',
  lastName: 'Smith',
  gender: 'FEMALE',
  email: 'alice@example.com',
  phone: '0600000001',
  status: 'ACTIVE',
  groupsForUser: [{ groupName: 'Study Group', activityRecord: 5 }],
  chartWeeklySessionPlanForUserRes: {
    totalWeeklySession: 10,
    activeWeeklySession: 3,
    completedWeeklySession: 5,
    incompletedWeeklySession: 1,
    pendingWeeklySession: 1,
  },
});

describe('UserManagementService', () => {
  let service: UserManagementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserManagementService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserManagementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── filterUsers ──────────────────────────────────────────────────────────

  it('should POST filter payload and return paginated users', () => {
    const payload: UsersFilterPayload = {
      request: { firstName: 'Alice', status: 'ACTIVE' },
      page: 0,
      size: 10,
    };
    const response = mockPaginatedResponse();

    service.filterUsers(payload).subscribe((data) => {
      expect(data).toEqual(response);
    });

    const req = httpMock.expectOne(`${BASE}/tables/searchUsers`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should send an empty filter when no criteria are provided', () => {
    const payload: UsersFilterPayload = { request: {}, page: 0, size: 20 };

    service.filterUsers(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/tables/searchUsers`);
    expect(req.request.body).toEqual(payload);
    req.flush(mockPaginatedResponse());
  });

  // ─── getUserDetails ───────────────────────────────────────────────────────

  it('should GET user details with the userId query param', () => {
    const details = mockUserDetails();

    service.getUserDetails('u1').subscribe((data) => {
      expect(data).toEqual(details);
    });

    const req = httpMock.expectOne(`${BASE}/tables/userDetails?userId=u1`);
    expect(req.request.method).toBe('GET');
    req.flush(details);
  });

  // ─── banUser ──────────────────────────────────────────────────────────────

  it('should PATCH to ban a user with the userId query param', () => {
    service.banUser('u1').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${BASE}/ban` && r.params.get('userId') === 'u1');
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });

  // ─── unbanUser ────────────────────────────────────────────────────────────

  it('should PATCH to unban a user with the userId query param', () => {
    service.unbanUser('u1').subscribe();

    const req = httpMock.expectOne((r) => r.url === `${BASE}/unban` && r.params.get('userId') === 'u1');
    expect(req.request.method).toBe('PATCH');
    req.flush(null);
  });
});
