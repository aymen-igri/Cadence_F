import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
  HttpResponse,
} from '@angular/common/http';
import { cacheInterceptor, DEFAULT_TTL } from './cache.interceptor';
import { HttpCacheService } from '../services/cache.service';

describe('cacheInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let cacheService: HttpCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HttpCacheService,
        provideHttpClient(withInterceptors([cacheInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    cacheService = TestBed.inject(HttpCacheService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should cache GET requests', () => {
    // Spy on cache service
    vi.spyOn(cacheService, 'set');

    // First request
    http.get('/api/data').subscribe();
    const req1 = httpMock.expectOne('/api/data');
    req1.flush({ data: 'test' });

    expect(cacheService.set).toHaveBeenCalled();
    const cachedResponse = cacheService.get('/api/data');
    expect(cachedResponse).toBeTruthy();
    expect(cachedResponse?.body).toEqual({ data: 'test' });
  });

  it('should return cached response for subsequent GET requests', () => {
    http.get('/api/data').subscribe();
    const req1 = httpMock.expectOne('/api/data');
    req1.flush({ data: 'test' });

    // Spy on next get
    vi.spyOn(cacheService, 'get');

    http.get('/api/data').subscribe((res) => {
      expect(res).toEqual({ data: 'test' });
    });

    // Should not make a second HTTP request
    httpMock.expectNone('/api/data');
    expect(cacheService.get).toHaveBeenCalledWith('/api/data');
  });

  it('should bypass cache when X-Bust-Cache header is present', () => {
    // Populate cache
    http.get('/api/data').subscribe();
    const req1 = httpMock.expectOne('/api/data');
    req1.flush({ data: 'test' });

    // Second request with bust cache
    http.get('/api/data', { headers: { 'X-Bust-Cache': 'true' } }).subscribe((res) => {
      expect(res).toEqual({ data: 'new-test' });
    });

    // Should make HTTP request despite cache entry
    const req2 = httpMock.expectOne('/api/data');
    req2.flush({ data: 'new-test' });
  });

  it('should invalidate cache for non-GET requests based on URL without query params', () => {
    vi.spyOn(cacheService, 'invalidate');

    // Cache a GET with query params
    http.get('/api/groups/123/messages?page=1').subscribe();
    const req1 = httpMock.expectOne('/api/groups/123/messages?page=1');
    req1.flush([{ id: 1, text: 'Hello' }]);

    expect(cacheService.get('/api/groups/123/messages?page=1')).toBeTruthy();

    // POST to the same base URL
    http.post('/api/groups/123/messages', { text: 'New message' }).subscribe();
    const req2 = httpMock.expectOne('/api/groups/123/messages');
    req2.flush({ id: 2, text: 'New message' });

    // It should invalidate the url without params
    expect(cacheService.invalidate).toHaveBeenCalledWith('/api/groups/123/messages');

    // The GET request with the query params should also have been cleared
    expect(cacheService.get('/api/groups/123/messages?page=1')).toBeNull();
  });
});
