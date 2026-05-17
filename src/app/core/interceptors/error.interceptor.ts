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
          // Consider using a toast notification here instead of full page navigation
          // router.navigate(['/server-error']);
          break;
        case 403:
          router.navigate(['/forbidden']);
          break;
        // Removed 404 and 500 global navigation so secondary requests don't break the UI
      }
      return throwError(() => error);
    }),
  );
};
