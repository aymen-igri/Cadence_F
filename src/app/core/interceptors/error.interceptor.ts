import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          router.navigate(['/server-error']);
          break;
        case 403:
          router.navigate(['/forbidden']);
          break;
        case 404:
          router.navigate(['/not-found']);
          break;
        case 500:
          router.navigate(['/server-error']);
          break;
      }
      return throwError(() => error);
    }),
  );
};
