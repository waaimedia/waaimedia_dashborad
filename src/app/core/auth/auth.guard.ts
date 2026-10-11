import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService, UserRole } from './auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }

  return auth.getCurrentUser().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } }))),
  );
};

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data['roles'] as UserRole[] | undefined;

  return !roles?.length || auth.hasRole(...roles)
    ? true
    : router.createUrlTree(['/dashboard']);
};
