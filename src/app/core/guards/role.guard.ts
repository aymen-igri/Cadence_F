import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = route.data['roles'] as Role[];
  const currentUser = authService.currentUser();

  if (!currentUser) {
    router.navigate(['/sign-in']);
    return false;
  }

  if (requiredRoles.includes(currentUser.role)) {
    return true;
  }

  router.navigate(['/forbidden']);
  return false;
};
