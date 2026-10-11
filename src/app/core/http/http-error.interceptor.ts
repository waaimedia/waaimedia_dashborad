import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export const httpErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const messages = inject(MessageService);
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        const detail =
          error.error?.message ??
          (error.status === 0 ? 'Please check your internet connection and try again.' : 'Please try again later.');

        messages.add({
          severity: 'error',
          summary: error.status === 0 ? 'Connection error' : `Request failed (${error.status})`,
          detail,
          life: 5000,
        });

        if (error.status === 401) {
          auth.clearSession();
          if (!router.url.startsWith('/auth/login')) {
            void router.navigate(['/auth/login'], { queryParams: { session: 'expired' } });
          }
        }
      }

      return throwError(() => error);
    }),
  );
};
