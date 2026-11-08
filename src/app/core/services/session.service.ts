import { Injectable, computed, signal } from '@angular/core';

const TOKEN_KEY = 'nobatify.token';
const BUSINESS_KEY = 'nobatify.businessId';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly tokenSignal = signal<string | null>(readItem(TOKEN_KEY));

  readonly isLoggedIn = computed(() => this.tokenSignal() !== null);

  get token(): string | null {
    return this.tokenSignal();
  }

  save(token: string, businessId: string): void {
    writeItem(TOKEN_KEY, token);
    writeItem(BUSINESS_KEY, businessId);
    this.tokenSignal.set(token);
  }

  clear(): void {
    removeItem(TOKEN_KEY);
    removeItem(BUSINESS_KEY);
    this.tokenSignal.set(null);
  }
}

// localStorage can throw in private mode or when blocked, so every access is guarded.
function readItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore: the session then lasts only until reload */
  }
}

function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
