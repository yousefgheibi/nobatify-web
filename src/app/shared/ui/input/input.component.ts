import { booleanAttribute, Component, forwardRef, input, Optional, Self, signal } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

export type InputType = 'text' | 'number' | 'tel' | 'email' | 'password' | 'url';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './input.component.html'
})
export class InputComponent implements ControlValueAccessor {
  readonly id = input<string>(`inp-${Math.random().toString(36).slice(2, 9)}`);
  readonly label = input<string>('');
  readonly type = input<InputType>('text');
  readonly placeholder = input<string>('');
  readonly dir = input<'ltr' | 'rtl' | 'auto'>('auto');
  readonly required = input<boolean>(false);
  readonly readonly = input(false, { transform: booleanAttribute });

  protected readonly value = signal<string | number | null>(null);
  readonly disabled = signal<boolean>(false);

  private onChange: (value: unknown) => void = () => {};
  private onTouched: () => void = () => {};


  constructor(@Optional() @Self() public ngControl: NgControl | null) {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
  }

  // Control Value Accessor
  writeValue(value: unknown): void {
    this.value.set(value == null ? null : (value as string | number));
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled)
  }

  protected onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const raw = target.value;

    let next: string | number | null = raw;
    if (this.type() === 'number') {
      next = raw === '' ? null : Number(raw);
    } else if (raw === '') {
      next = null;
    }

    this.value.set(next);
    this.onChange(next);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  get errorMessage(): string {
    const control = this.ngControl?.control;
    if (!control || !control.errors) return '';

    const errors = control.errors;
    const firstErrorKey = Object.keys(errors)[0];

    switch (firstErrorKey) {
      case 'required':
        return 'این فیلد الزامی است.';
      case 'email':
        return 'لطفا یک آدرس ایمیل معتبر وارد کنید.';
      case 'minlength':
        return `حداقل طول باید ${errors['minlength']?.requiredLength} کاراکتر باشد.`;
      case 'maxlength':
        return `حداکثر طول باید ${errors['maxlength']?.requiredLength} کاراکتر باشد.`;
      case 'passwordMismatch': 
        return 'رمز عبور و تکرار آن یکسان نیستند';
      case 'iranianMobile':
        return 'شماره موبایل معتبر نیست (۰۹xxxxxxxxx)';
      case 'passwordStrength': 
        return 'رمز عبور باید شامل حرف و عدد باشد';
      default:
        return 'این فیلد نامعتبر است.';
    }
  }
}