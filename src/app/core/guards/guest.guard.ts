import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    return true;
  }

  const currentUser = authService.currentUser();

  if (currentUser?.role === 'ROLE_ADMIN') {
    router.navigate(['/admin/dashboard']);
  } else {
    router.navigate(['/user/dashboard']);
  }

  return false;
};
