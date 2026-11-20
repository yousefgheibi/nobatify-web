import { Component, input, Optional, Self, signal } from '@angular/core';
import { ControlValueAccessor, NgControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-date-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './date-input.component.html',
})
export class DateInputComponent implements ControlValueAccessor {
  readonly id = input<string>(`date-${Math.random().toString(36).slice(2, 9)}`);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly dir = input<'ltr' | 'rtl' | 'auto'>('ltr');
  readonly required = input<boolean>(false);
  readonly readonly = input<boolean>(false);

  readonly min = input<string>('');
  readonly max = input<string>('');

  protected readonly value = signal<string | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(@Optional() @Self() public ngControl: NgControl | null) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // ---- Control Value Accessor ----
  writeValue(value: unknown): void {
    if (value instanceof Date) {
      this.value.set(this.toIsoDate(value));
    } else if (typeof value === 'string' && value.length > 0) {
      this.value.set(value);
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  // ---- handlers ----
  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value;
    const next = raw === '' ? null : raw;
    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  // ---- helpers ----
  private toIsoDate(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // ---- error ----
  get errorMessage(): string {
    const control = this.ngControl?.control;
    if (!control || !control.errors) return '';

    const errors = control.errors;
    const key = Object.keys(errors)[0];

    switch (key) {
      case 'required':
        return 'تاریخ الزامی است.';
      case 'minDate':
      case 'min':
        return 'تاریخ انتخاب‌شده نباید قبل از حد مجاز باشد.';
      case 'maxDate':
      case 'max':
        return 'تاریخ انتخاب‌شده نباید بعد از حد مجاز باشد.';
      case 'pastDate':
        return 'تاریخ نمی‌تواند در گذشته باشد.';
      case 'futureDate':
        return 'تاریخ نمی‌تواند در آینده باشد.';
      case 'invalidDate':
        return 'تاریخ معتبر نیست.';
      default:
        return 'تاریخ نامعتبر است.';
    }
  }
}