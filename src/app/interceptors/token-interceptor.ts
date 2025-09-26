import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {

  const auth = inject(AuthService);

  if (auth.getToken()) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${auth.getToken()}`
      }
    });
  }
  return next(req);
};
