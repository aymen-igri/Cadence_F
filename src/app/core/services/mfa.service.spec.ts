import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MfaService } from './mfa.service';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../models/auth.model';

const BASE = `${environment.apiUrl}/mfa`;

const mockAuthResponse = (): AuthResponse => ({
  user: {
    id: 'user1',
    firstName: 'Alice',
    lastName: 'Smith',
    username: 'alice',
    email: 'alice@example.com',
    role: 'ROLE_GENERAL_USER' as const,
    gender: 'FEMALE',
    phone: '0600000001',
  },
  tokens: {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
  },
});

describe('MfaService', () => {
  let service: MfaService;
  let httpMock: HttpTestingController;
  let mockAuthService: {
    getAccessToken: ReturnType<typeof vi.fn>;
    setTokens: ReturnType<typeof vi.fn>;
    currentUser: { set: ReturnType<typeof vi.fn> };
  };
  let mockStore: Record<string, string>;

  beforeEach(() => {
    mockStore = {};

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key in mockStore ? mockStore[key] : null),
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
    });

    mockAuthService = {
      getAccessToken: vi.fn().mockReturnValue('current-access-token'),
      setTokens: vi.fn(),
      currentUser: { set: vi.fn() },
    };

    TestBed.configureTestingModule({
      providers: [
        MfaService,
        { provide: AuthService, useValue: mockAuthService },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(MfaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.unstubAllGlobals();
  });

  // ─── triggerEmailCode ─────────────────────────────────────────────────────

  it('should POST to trigger email code using the temporary MFA token in the Authorization header', () => {
    service.temporaryMfaToken.set('tmp-mfa-token');

    service.triggerEmailCode().subscribe();

    const req = httpMock.expectOne(`${BASE}/email/trigger`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tmp-mfa-token');
    req.flush({ message: 'Email sent' });
  });

  // ─── triggerEmailCodeForPasswordChange ────────────────────────────────────

  it('should POST to trigger email code using the current access token for password change', () => {
    service.triggerEmailCodeForPasswordChange().subscribe();

    const req = httpMock.expectOne(`${BASE}/email/trigger`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer current-access-token');
    req.flush({ message: 'Email sent' });
  });

  // ─── verifyOtp ────────────────────────────────────────────────────────────

  it('should POST to verify OTP and call authService.setTokens with the response tokens', () => {
    service.temporaryMfaToken.set('tmp-mfa-token');
    service.selectedMethod.set('EMAIL');

    service.verifyOtp('123456').subscribe();

    const req = httpMock.expectOne(`${BASE}/verify?code=123456&type=EMAIL`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer tmp-mfa-token');
    req.flush(mockAuthResponse());

    expect(mockAuthService.setTokens).toHaveBeenCalledWith({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should set the currentUser signal after verifyOtp succeeds', () => {
    service.temporaryMfaToken.set('tmp-mfa-token');
    service.selectedMethod.set('EMAIL');

    service.verifyOtp('123456').subscribe();

    httpMock.expectOne(`${BASE}/verify?code=123456&type=EMAIL`).flush(mockAuthResponse());

    expect(mockAuthService.currentUser.set).toHaveBeenCalledWith(mockAuthResponse().user);
  });

  it('should persist the user to localStorage after verifyOtp succeeds', () => {
    service.temporaryMfaToken.set('tmp-mfa-token');
    service.selectedMethod.set('EMAIL');

    service.verifyOtp('123456').subscribe();

    httpMock.expectOne(`${BASE}/verify?code=123456&type=EMAIL`).flush(mockAuthResponse());

    expect(mockStore['current_user']).toBe(JSON.stringify(mockAuthResponse().user));
  });

  it('should use type=APP when the selected method is AUTHENTICATOR', () => {
    service.temporaryMfaToken.set('tmp-mfa-token');
    service.selectedMethod.set('AUTHENTICATOR');

    service.verifyOtp('654321').subscribe();

    const req = httpMock.expectOne(`${BASE}/verify?code=654321&type=APP`);
    req.flush(mockAuthResponse());
  });

  // ─── generateAppSecret ────────────────────────────────────────────────────

  it('should GET to generate the app MFA secret', () => {
    const mockSecret = { secret: 'JBSWY3DPEHPK3PXP', qrUrl: 'otpauth://...' };

    service.generateAppSecret().subscribe((data) => {
      expect(data).toEqual(mockSecret);
    });

    const req = httpMock.expectOne(`${BASE}/app/setUp`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSecret);
  });

  // ─── confirmSetup ─────────────────────────────────────────────────────────

  it('should POST to confirm the MFA app setup with the provided code', () => {
    service.confirmSetup('112233').subscribe();

    const req = httpMock.expectOne(`${BASE}/app/confirm`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ code: '112233' });
    req.flush({ success: true });
  });
});
