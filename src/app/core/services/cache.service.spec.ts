import { TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpCacheService } from './cache.service';

const makeResponse = (body: unknown) => new HttpResponse({ body, status: 200 });

describe('HttpCacheService', () => {
  let service: HttpCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [HttpCacheService] });
    service = TestBed.inject(HttpCacheService);
  });

  // ─── get ──────────────────────────────────────────────────────────────────

  it('should return null for a cache miss', () => {
    expect(service.get('missing-key')).toBeNull();
  });

  it('should return the stored response for a valid cache entry', () => {
    const response = makeResponse({ data: 'hello' });
    service.set('key1', response, 60_000);

    expect(service.get('key1')).toBe(response);
  });

  it('should return null and evict the entry when the cache entry is expired', () => {
    const response = makeResponse({ data: 'stale' });
    // TTL of 0 means it expires immediately (expiry = Date.now() + 0)
    service.set('expired-key', response, 0);

    // Advance time by 1ms so Date.now() > expiry
    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1);

    expect(service.get('expired-key')).toBeNull();
  });

  it('should not return a response after it has been evicted due to expiry', () => {
    const response = makeResponse({ data: 'stale' });
    service.set('key-evict', response, 0);

    vi.spyOn(Date, 'now').mockReturnValue(Date.now() + 1);
    service.get('key-evict'); // triggers eviction

    // A second get should also be null (entry was deleted)
    expect(service.get('key-evict')).toBeNull();
  });

  // ─── set ──────────────────────────────────────────────────────────────────

  it('should overwrite an existing cache entry when set is called again', () => {
    const first = makeResponse('first');
    const second = makeResponse('second');

    service.set('key2', first, 60_000);
    service.set('key2', second, 60_000);

    expect(service.get('key2')).toBe(second);
  });

  // ─── invalidate ───────────────────────────────────────────────────────────

  it('should remove all entries whose key includes the given URL pattern', () => {
    const r1 = makeResponse('a');
    const r2 = makeResponse('b');
    const r3 = makeResponse('c');

    service.set('/api/users/1', r1, 60_000);
    service.set('/api/users/2', r2, 60_000);
    service.set('/api/groups/1', r3, 60_000);

    service.invalidate('/api/users');

    expect(service.get('/api/users/1')).toBeNull();
    expect(service.get('/api/users/2')).toBeNull();
    // Non-matching key should still exist
    expect(service.get('/api/groups/1')).toBe(r3);
  });

  it('should not remove entries that do not match the URL pattern', () => {
    const response = makeResponse('safe');
    service.set('/api/sessions', response, 60_000);

    service.invalidate('/api/users');

    expect(service.get('/api/sessions')).toBe(response);
  });

  // ─── clear ────────────────────────────────────────────────────────────────

  it('should remove all entries when clear is called', () => {
    service.set('key-a', makeResponse('a'), 60_000);
    service.set('key-b', makeResponse('b'), 60_000);

    service.clear();

    expect(service.get('key-a')).toBeNull();
    expect(service.get('key-b')).toBeNull();
  });
});
