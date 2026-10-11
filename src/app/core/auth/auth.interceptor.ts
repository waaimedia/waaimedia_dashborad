import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isApiRequest = request.url.startsWith(environment.apiUrl);

  if (!isApiRequest) {
    return next(request);
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = auth.getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (request.body !== null && !(request.body instanceof FormData) && !request.headers.has('Content-Type')) {
    headers['Content-Type'] = 'application/json';
  }

  return next(request.clone({ setHeaders: headers }));
};
