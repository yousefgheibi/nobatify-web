const toman = new Intl.NumberFormat('fa-IR');

export function formatToman(amount: number): string {
  return `${toman.format(amount)} تومان`;
}

export function formatDuration(minutes: number): string {
  return `${new Intl.NumberFormat('fa-IR').format(minutes)} دقیقه`;
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'در انتظار تأیید',
  CONFIRMED: 'تأیید شده',
  CANCELLED: 'لغو شده',
};
