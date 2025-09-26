import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Router, RedirectCommand } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    const loginPath = router.parseUrl("/login");
    return new RedirectCommand(loginPath, {
      skipLocationChange: false,
    });
  }
  return authService.isSessionValid().pipe(
    map((isValid: boolean) => {
      if (isValid) {
        return true;
      } else {
        authService.logout();
        const loginPath = router.parseUrl("/login");
        return new RedirectCommand(loginPath, {
          skipLocationChange: false,
        });
      }
    }),
    catchError(() => {
      authService.logout();
      const loginPath = router.parseUrl("/login");
      return of(new RedirectCommand(loginPath, {
        skipLocationChange: false,
      }));
    })
  );

};
