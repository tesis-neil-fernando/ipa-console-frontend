import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router, RedirectCommand } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    if (true /*authService.isTokenValid()*/) {
      return true
    } else {
      authService.logout();
    }
  }
  const loginPath = router.parseUrl("/login");
  return new RedirectCommand(loginPath, {
    skipLocationChange: false,
  });
};
