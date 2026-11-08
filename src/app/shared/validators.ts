import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  /**
   * بررسی تطابق دو فیلد در سطح یک FormGroup.
   * - اگر هر یک از دو فیلد خالی باشد، خطا برنمی‌گرداند
   *   (تا خطای required خودِ فیلد نمایش داده شود).
   * - در صورت عدم تطابق، خطای `passwordMismatch` روی گروه ست می‌شود.
   */
  static passwordsMatch(passwordKey: string, confirmKey: string): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get(passwordKey);
      const confirm = group.get(confirmKey);
      if (!password || !confirm) return null;
      // خطا را روی کنترل confirm بگذار، نه روی گروه
      if (confirm.value !== password.value) {
        confirm.setErrors({ ...confirm.errors, passwordMismatch: true });
      } else {
        if (confirm.errors?.['passwordMismatch']) {
          const { passwordMismatch, ...rest } = confirm.errors;
          confirm.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
      return null;
    };
  }

  /**
   * بررسی شماره موبایل ایران (۰۹xxxxxxxxx) — با پشتیبانی از ارقام فارسی.
   */
  static iranianMobile(errorKey = 'iranianMobile'): ValidatorFn {
    const pattern = /^09\d{9}$/;
    return (control: AbstractControl): ValidationErrors | null => {
      const raw = control.value;
      if (raw == null || raw === '') {
        return null;
      }
      const normalized = String(raw)
        .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
        .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))
        .replace(/[\s-]/g, '');
      return pattern.test(normalized) ? null : { [errorKey]: true };
    };
  }

  /**
   * بررسی قدرت رمز عبور (حداقل یک حرف و یک عدد).
   */
  static passwordStrength(errorKey = 'passwordStrength'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) {
        return null;
      }
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasDigit = /\d/.test(value);
      return hasLetter && hasDigit ? null : { [errorKey]: true };
    };
  }
}
