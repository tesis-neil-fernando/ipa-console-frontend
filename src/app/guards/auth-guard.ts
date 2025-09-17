import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router, RedirectCommand } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  if (!authService.isLoggedIn()) {
    const loginPath = router.parseUrl("/");
    return new RedirectCommand(loginPath, {
      skipLocationChange: false,
    });
  }

  return true;
};
