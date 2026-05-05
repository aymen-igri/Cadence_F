import { Injectable } from "@angular/core";
import { CacheEntry } from "../models/cache.model";
import { HttpResponse } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class HttpCacheService {
  private cache = new Map<string, CacheEntry>();

  get(key: string): HttpResponse<any> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.response;
  }

  set(key: string, response: HttpResponse<any>, ttl: number): void {
    this.cache.set(key, {
      response,
      expiry: Date.now() + ttl,
      cachedAt: Date.now()
    });
  }

  invalidate(urlPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(urlPattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}