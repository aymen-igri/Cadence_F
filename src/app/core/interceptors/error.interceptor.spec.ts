import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: any;

  beforeEach(() => {
    const routerSpy = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting()
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as any;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should navigate to /forbidden on 403 error', () => {
    http.get('/api/secure').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('should NOT navigate on 404 error (avoid breaking secondary background requests)', () => {
    http.get('/api/user/avatar').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/user/avatar');
    req.flush('Not Found', { status: 404, statusText: 'Not Found' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should NOT navigate on 500 error', () => {
    http.get('/api/data').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });

    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate on 0 (unknown) status', () => {
    http.get('/api/data').subscribe({
      error: () => {}
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unknown Error', { status: 0, statusText: 'Unknown Error' });

    // Assuming we don't navigate for 0 status, or we use a toast instead as specified in the interceptor
    expect(router.navigate).not.toHaveBeenCalled();
  });
});