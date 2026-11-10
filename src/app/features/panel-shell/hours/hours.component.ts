import { ChangeDetectorRef, Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HourDto, WorkingHoursControllerService, WorkingHoursDto } from '../../../api/service-proxies';
import { NotificationService } from '../../../core/services/notification.service';
import { WEEKDAY_NAMES } from '../../../shared/global.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { hhmmToMinutes } from '../../../core/helper/jalali-date';

type DayGroup = FormGroup<{
  isOpen: FormControl<boolean>;
  opensAt: FormControl<string>;
  closesAt: FormControl<string>;
}>;

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-hours',
  styleUrl: './hours.component.scss',
  templateUrl: './hours.component.html',
  providers: [WorkingHoursControllerService],
})
export class HoursComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly api = inject(WorkingHoursControllerService);
  private readonly notification = inject(NotificationService);

  protected readonly names = WEEKDAY_NAMES;
  protected readonly saving = signal(false);
  protected readonly days = this.fb.array<DayGroup>([]);

  constructor() {
    this.api
      .getHours()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => this.fill(rows));
  }

  private fill(rows: any): void {
    this.days.clear();
    const sorted = [...rows].sort((a, b) => a.weekday - b.weekday);
    for (const r of sorted) {
      this.days.push(
        this.fb.nonNullable.group({
          isOpen: [r.isOpen],
          opensAt: [r.opensAt],
          closesAt: [r.closesAt],
        }),
      );
    }
    this.cdr.markForCheck();
  }

  protected save(): void {
    if (this.saving()) return;

    const days: { weekday: number; isOpen: boolean; opensAt: string; closesAt: string }[] = [];
    for (let weekday = 0; weekday < this.days.length; weekday++) {
      const v = this.days.at(weekday).getRawValue();
      if (v.isOpen && hhmmToMinutes(v.closesAt) <= hhmmToMinutes(v.opensAt)) {
        this.notification.showError(`ساعت پایان ${WEEKDAY_NAMES[weekday]} باید بعد از شروع باشد.`);
        return;
      }
      days.push({ weekday, isOpen: v.isOpen, opensAt: v.opensAt, closesAt: v.closesAt });
    }

    const body = WorkingHoursDto.fromJS({ days });

    this.saving.set(true);
    this.api
      .setHours(body)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (rows) => {
          this.fill(rows);
          this.notification.showSuccess('ساعت‌های کاری ذخیره شد.');
        },
        error: () => {},
      });
  }
}
