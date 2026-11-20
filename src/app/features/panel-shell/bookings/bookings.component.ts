import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BookingListItemDto, BookingsControllerService, Status } from '../../../api/service-proxies';
import { BookingCardComponent } from './booking-card/booking-card.component';
import { NotificationService } from '../../../core/services/notification.service';
import { DateInputComponent } from '../../../shared/ui/date-input/date-input.component';

type Filter = 'ALL' | Status;

@Component({
  imports: [ReactiveFormsModule, BookingCardComponent, DateInputComponent],
  selector: 'app-bookings',
  styleUrl: './bookings.component.scss',
  templateUrl: './bookings.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [BookingsControllerService],
})
export class BookingsComponent {
  private readonly api = inject(BookingsControllerService);
  private readonly notification = inject(NotificationService);

  protected readonly date = signal(this.todayIso());
  protected readonly filter = signal<Filter>('ALL');
  protected readonly items = signal<BookingListItemDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly busyId = signal<string | null>(null);

  readonly dateControl = new FormControl<string>(this.date(), {
    nonNullable: true,
  });

  protected readonly filters: { value: Filter; label: string }[] = [
    { value: 'ALL', label: 'همه' },
    { value: Status.PENDING, label: 'در انتظار' },
    { value: Status.CONFIRMED, label: 'تأیید شده' },
    { value: Status.CANCELLED, label: 'لغو شده' },
  ];

  constructor() {
    // همگام‌سازی ControlValueAccessor با signal + بارگذاری
    this.dateControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (!value) return;
      this.date.set(value);
      this.load();
    });

    this.load();
  }

  protected setFilter(f: Filter): void {
    this.filter.set(f);
    this.load();
  }

  protected confirm(b: BookingListItemDto): void {
    this.act(b, () => this.api.confirm(b.id), 'نوبت تأیید شد.');
  }

  protected cancel(b: BookingListItemDto): void {
    const question = b.status === 'PENDING' ? 'این درخواست رد شود؟' : 'این نوبت لغو شود؟';
    if (!window.confirm(question)) return;
    this.act(b, () => this.api.cancel(b.id), 'نوبت لغو شد.');
  }

  private act(
    b: BookingListItemDto,
    call: () => ReturnType<any['confirmBooking']>,
    done: string,
  ): void {
    this.busyId.set(b.id);
    call().subscribe({
      next: () => {
        this.busyId.set(null);
        this.notification.showSuccess(done);
        this.load();
      },
      error: () => this.busyId.set(null),
    });
  }

  private load(): void {
    const f = this.filter();
    const status = f === 'ALL' ? undefined : f;
    this.loading.set(true);
    this.api.list(this.date(), status).subscribe({
      next: (rows) => {
        this.items.set(rows);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private todayIso(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
}
