import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { API_BASE_URL } from '../../api/service-proxies';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const apiBase = inject(API_BASE_URL);
  const token = session.token;

  console.log('[authInterceptor]', {
    url: req.url,
    apiBase,
    token,
    matches: req.url.startsWith(apiBase),
  });

  if (!token || !req.url.startsWith(apiBase)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
