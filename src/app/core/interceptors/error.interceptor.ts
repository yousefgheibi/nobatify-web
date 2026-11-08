import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { API_BASE_URL } from '../../api/service-proxies';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const session = inject(SessionService);
  const router = inject(Router);
  const notification = inject(NotificationService);
  const apiBase = inject(API_BASE_URL);

  return next(req).pipe(
    catchError((err) => {
      if (!(err instanceof HttpErrorResponse) || !req.url.startsWith(apiBase)) {
        return throwError(() => err);
      }

      const isAuthCall = req.url.includes('/auth/');
      if (err.status === 401 && !isAuthCall) {
        session.clear();
        notification.showError('نشست شما تمام شده است. لطفا دوباره وارد شوید.');
        void router.navigate(['/login']);
      } else {
        notification.showError(messageOf(err));
      }
      return throwError(() => err);
    }),
  );
};

function messageOf(err: HttpErrorResponse): string {
  if (err.status === 0) return 'اتصال به اینترنت یا سرور برقرار نیست.';

  const raw = (err.error as { message?: unknown } | null)?.message;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.join('، ');
  return 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
}
