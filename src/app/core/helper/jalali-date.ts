// The business works in Tehran time (UTC+03:30, no DST).
const TEHRAN_OFFSET_MS = 210 * 60_000;
export const TEHRAN_TZ = 'Asia/Tehran';

/** Today's date in Tehran as YYYY-MM-DD. */
export function tehranToday(): string {
  return new Date(Date.now() + TEHRAN_OFFSET_MS).toISOString().slice(0, 10);
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * Iranian weekday of a Gregorian date: 0 = Saturday ... 6 = Friday.
 * Matches the backend's working-hours numbering.
 */
export function iranianWeekday(isoDate: string): number {
  const jsDay = new Date(`${isoDate}T00:00:00Z`).getUTCDay();
  return (jsDay + 1) % 7;
}

/** "Persian" label for a date, e.g. "شنبه ۱۴ آبان". */
export function formatDayLabel(isoDate: string): string {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}

/** "HH:mm" in Tehran time for an ISO instant. */
export function formatTehranTime(iso: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TEHRAN_TZ,
  }).format(new Date(iso));
}

/** Full Persian date and time in Tehran, e.g. "۱۴ آبان ۱۴۰۵ · ۱۰:۳۰". */
export function formatTehranDateTime(iso: string): string {
  const date = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TEHRAN_TZ,
  }).format(new Date(iso));
  return `${date} · ${formatTehranTime(iso)}`;
}

/** "HH:mm" -> minutes from midnight (used when reading form inputs). */
export function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}
