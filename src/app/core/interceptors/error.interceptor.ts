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
        void messageOf(err).then((msg) => notification.showError(msg));
      }
      return throwError(() => err);
    }),
  );
};

async function messageOf(err: HttpErrorResponse): Promise<string> {
  if (err.status === 0) return 'اتصال به اینترنت یا سرور برقرار نیست.';

  const body = await readBody(err.error);
  const raw = (body as { message?: unknown } | null)?.message;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.join('، ');
  return 'خطایی رخ داد. لطفاً دوباره تلاش کنید.';
}


async function readBody(payload: unknown): Promise<unknown> {
  if (payload instanceof Blob) {
    try {
      return JSON.parse(await payload.text());
    } catch {
      return null;
    }
  }
  return payload;
}