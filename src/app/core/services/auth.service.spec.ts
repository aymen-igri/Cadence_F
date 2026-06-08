import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { HttpCacheService } from './cache.service';
import { environment } from '../../environments/environment';
import { AuthResponse, AuthTokens } from '../models/auth.model';
import { User } from '../models/user.model';

const BASE = `${environment.apiUrl}`;

const encodeBase64Url = (str: string) =>
  btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

const createMockToken = (expInSeconds: number) => {
  const header = encodeBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = encodeBase64Url(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + expInSeconds }),
  );
  const signature = 'mock_signature';
  return `${header}.${payload}.${signature}`;
};

const mockUser = (): User => ({
  id: 'user1',
  firstName: 'Alice',
  lastName: 'Smith',
  username: 'alice',
  email: 'alice@example.com',
  phone: '0600000001',
  gender: 'FEMALE',
  role: 'ROLE_GENERAL_USER',
});

const mockTokens = (): AuthTokens => ({
  accessToken: createMockToken(3600),
  refreshToken: createMockToken(86400),
});

const mockAuthResponse = (): AuthResponse => ({
  user: mockUser(),
  tokens: mockTokens(),
});

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
    });

    router = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        HttpCacheService,
        { provide: Router, useValue: router },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
  });

  afterEach(() => {
    localStorage.clear();
    vi.unstubAllGlobals();
    httpMock?.verify();
  });

  // ─── Initialisation ───────────────────────────────────────────────────────

  it('should clear tokens if both access and refresh tokens are expired on init', () => {
    localStorage.setItem('access_token', createMockToken(-60));
    localStorage.setItem('refresh_token', createMockToken(-60));

    service = TestBed.inject(AuthService);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(service.isReady()).toBe(true);
  });

  it('should NOT clear tokens on init if access token is valid but refresh token is missing', () => {
    localStorage.setItem('access_token', createMockToken(3600));

    service = TestBed.inject(AuthService);

    expect(localStorage.getItem('access_token')).toBeTruthy();
    expect(service.isReady()).toBe(true);
  });

  it('should NOT clear tokens on init if access token is expired but refresh token is valid', () => {
    localStorage.setItem('access_token', createMockToken(-60));
    localStorage.setItem('refresh_token', createMockToken(3600));

    service = TestBed.inject(AuthService);

    expect(localStorage.getItem('refresh_token')).toBeTruthy();
    expect(service.isReady()).toBe(true);
  });

  it('should restore the stored user into currentUser signal on init', () => {
    const user = mockUser();
    localStorage.setItem('access_token', createMockToken(3600));
    localStorage.setItem('current_user', JSON.stringify(user));

    service = TestBed.inject(AuthService);

    expect(service.currentUser()).toEqual(user);
  });

  it('should leave currentUser as null if no stored user exists on init', () => {
    service = TestBed.inject(AuthService);

    expect(service.currentUser()).toBeNull();
  });

  // ─── isLoggedIn ───────────────────────────────────────────────────────────

  it('should consider user logged in if access token is valid', () => {
    localStorage.setItem('access_token', createMockToken(3600));
    service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should consider user logged in if refresh token is valid', () => {
    localStorage.setItem('access_token', createMockToken(-60));
    localStorage.setItem('refresh_token', createMockToken(3600));
    service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should consider user logged out if both tokens are expired/missing', () => {
    service = TestBed.inject(AuthService);
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should clear tokens when isLoggedIn is called and both tokens are expired', () => {
    localStorage.setItem('access_token', createMockToken(-60));
    localStorage.setItem('refresh_token', createMockToken(-60));
    service = TestBed.inject(AuthService);

    // Tokens were already cleared on init, so isLoggedIn should return false
    expect(service.isLoggedIn()).toBe(false);
  });

  // ─── login ────────────────────────────────────────────────────────────────

  it('should POST to /login and store tokens + currentUser on success', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const payload = { identifier: 'alice', password: 'secret' };
    const response = mockAuthResponse();

    service.login(payload).subscribe((res) => {
      expect(res).toEqual(response);
    });

    const req = httpMock.expectOne(`${BASE}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);

    expect(localStorage.getItem('access_token')).toBe(response.tokens!.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(response.tokens!.refreshToken);
    expect(service.currentUser()).toEqual(response.user);
    expect(localStorage.getItem('current_user')).toBe(JSON.stringify(response.user));
  });

  it('should not store tokens on login if the response has no tokens field', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // MFA flow — server returns mfaTokens instead
    const mfaResponse: AuthResponse = { user: mockUser(), mfaTokens: 'tmp-token' };

    service.login({ identifier: 'alice', password: 'secret' }).subscribe();
    httpMock.expectOne(`${BASE}/login`).flush(mfaResponse);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  // ─── register ─────────────────────────────────────────────────────────────

  it('should POST to /auth/signUp and store tokens + currentUser on success', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const payload = {
      firstName: 'Alice',
      lastName: 'Smith',
      username: 'alice',
      email: 'alice@example.com',
      password: 'secret',
      phone: '0600000001',
      gender: 'FEMALE' as const,
    };
    const response = mockAuthResponse();

    service.register(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/auth/signUp`);
    expect(req.request.method).toBe('POST');
    req.flush(response);

    expect(localStorage.getItem('access_token')).toBe(response.tokens!.accessToken);
    expect(service.currentUser()).toEqual(response.user);
  });

  // ─── forgetPassword ───────────────────────────────────────────────────────

  it('should POST to /auth/forget-password with identifier as a query param', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.forgetPassword('alice@example.com').subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${BASE}/auth/forget-password` &&
        r.params.get('identifier') === 'alice@example.com',
    );
    expect(req.request.method).toBe('POST');
    req.flush('Email sent');
  });

  // ─── resetPassword ────────────────────────────────────────────────────────

  it('should POST to /auth/reset-password with token and newPassword', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    service.resetPassword('reset-token', 'newPass123').subscribe();

    const req = httpMock.expectOne(`${BASE}/auth/reset-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ token: 'reset-token', newPassword: 'newPass123' });
    req.flush('Password reset');
  });

  // ─── updatePassword ───────────────────────────────────────────────────────

  it('should PATCH to /users/update-password with the provided payload', () => {
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const payload = { oldPassword: 'old', newPassword: 'new' };
    service.updatePassword(payload).subscribe();

    const req = httpMock.expectOne(`${BASE}/users/update-password`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush('Updated');
  });

  // ─── refresh ──────────────────────────────────────────────────────────────

  it('should POST to /auth/refreshToken with the stored refresh token and update stored tokens', () => {
    const oldRefreshToken = createMockToken(3600);
    // Set both tokens so the AuthService constructor doesn't clear them
    localStorage.setItem('access_token', createMockToken(3600));
    localStorage.setItem('refresh_token', oldRefreshToken);

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const newTokens = mockTokens();
    service.refresh().subscribe();

    const req = httpMock.expectOne(`${BASE}/auth/refreshToken`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: oldRefreshToken });
    req.flush(newTokens);

    expect(localStorage.getItem('access_token')).toBe(newTokens.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(newTokens.refreshToken);
  });

  it('should dispatch auth:token-refreshed event after a successful token refresh', () => {
    localStorage.setItem('refresh_token', createMockToken(3600));
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    service.refresh().subscribe();
    httpMock.expectOne(`${BASE}/auth/refreshToken`).flush(mockTokens());

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'auth:token-refreshed' }),
    );
  });

  // ─── logout ───────────────────────────────────────────────────────────────

  it('should clear tokens, currentUser and navigate to /sign-in on logout', () => {
    localStorage.setItem('access_token', createMockToken(3600));
    localStorage.setItem('refresh_token', createMockToken(86400));
    localStorage.setItem('current_user', JSON.stringify(mockUser()));

    service = TestBed.inject(AuthService);
    service.logout();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
    expect(localStorage.getItem('current_user')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/sign-in']);
  });

  // ─── setTokens / clearTokens ─────────────────────────────────────────────

  it('should persist both tokens to localStorage when setTokens is called', () => {
    service = TestBed.inject(AuthService);
    const tokens = mockTokens();

    service.setTokens(tokens);

    expect(localStorage.getItem('access_token')).toBe(tokens.accessToken);
    expect(localStorage.getItem('refresh_token')).toBe(tokens.refreshToken);
  });

  it('should remove both tokens from localStorage when clearTokens is called', () => {
    localStorage.setItem('access_token', createMockToken(3600));
    localStorage.setItem('refresh_token', createMockToken(86400));

    service = TestBed.inject(AuthService);
    service.clearTokens();

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });

  // ─── hasRole ──────────────────────────────────────────────────────────────

  it('should return true when the currentUser has the specified role', () => {
    service = TestBed.inject(AuthService);
    service.currentUser.set({ ...mockUser(), role: 'ROLE_ADMIN' });

    expect(service.hasRole('ROLE_ADMIN')).toBe(true);
  });

  it('should return false when the currentUser does not have the specified role', () => {
    service = TestBed.inject(AuthService);
    service.currentUser.set(mockUser()); // ROLE_GENERAL_USER

    expect(service.hasRole('ROLE_ADMIN')).toBe(false);
  });

  it('should return false when currentUser is null', () => {
    service = TestBed.inject(AuthService);
    service.currentUser.set(null);

    expect(service.hasRole('ROLE_ADMIN')).toBe(false);
  });
});
