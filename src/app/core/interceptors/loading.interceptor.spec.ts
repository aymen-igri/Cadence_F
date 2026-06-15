import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { LoadingService } from '../services/loading.service';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingService: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LoadingService,
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting()
      ]
    });
    
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingService = TestBed.inject(LoadingService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should toggle loading state correctly for a single request', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/test').subscribe();
    expect(loadingService.isLoading()).toBe(true);

    const req = httpMock.expectOne('/test');
    req.flush({});

    expect(loadingService.isLoading()).toBe(false);
  });

  it('should toggle loading state correctly for multiple concurrent requests', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/test1').subscribe();
    http.get('/test2').subscribe();
    expect(loadingService.isLoading()).toBe(true);

    const req1 = httpMock.expectOne('/test1');
    const req2 = httpMock.expectOne('/test2');

    req1.flush({});
    // After one request finishes, loading should still be true because test2 is pending
    expect(loadingService.isLoading()).toBe(true);

    req2.flush({});
    // Now both requests finished, loading should be false
    expect(loadingService.isLoading()).toBe(false);
  });

  it('should clear loading state on error', () => {
    expect(loadingService.isLoading()).toBe(false);

    http.get('/test-error').subscribe({
      error: () => {}
    });
    expect(loadingService.isLoading()).toBe(true);

    const req = httpMock.expectOne('/test-error');
    req.flush('Error', { status: 500, statusText: 'Server Error' });

    expect(loadingService.isLoading()).toBe(false);
  });
});
