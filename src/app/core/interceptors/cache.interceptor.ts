import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { tap, of } from "rxjs";
import { HttpCacheService } from "../services/cache.service";

export const DEFAULT_TTL = 5 * 60 * 1000;

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(HttpCacheService);

  if (req.method !== 'GET') {
    return next(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          cacheService.invalidate(new URL(req.url).pathname);
        }
      }),
    );
  }

  const bustCache = req.headers.has('X-Bust-Cache');
  const ttl = Number(req.headers.get('X-Cache-TTL')) || DEFAULT_TTL;

  const cleanReq = req.clone({
    headers: req.headers.delete('X-Bust-Cache').delete('X-Cache-TTL'),
  });

  if (!bustCache) {
    const cached = cacheService.get(req.urlWithParams);
    if (cached) {
      return of(cached.clone());
    }
  }

  return next(cleanReq).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cacheService.set(req.urlWithParams, event, ttl);
      }
    }),
  );
};
