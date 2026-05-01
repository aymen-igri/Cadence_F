import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const cloned = req.url.includes('/refreshToken')
    ? req
    : addToken(req, authService.getAccessToken());

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (
        error.status === 401 &&
        authService.getRefreshToken() &&
        !req.url.includes('/refreshToken')
      ) {
        return authService.refresh().pipe(
          switchMap((tokens) => {
            return next(addToken(req, tokens.accessToken));
          }),
          catchError((refreshError) => {
            authService.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};

function addToken(req: HttpRequest<any>, token: string | null) {
  if (!token) return req;
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}
