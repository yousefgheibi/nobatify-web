import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthControllerClient, RegisterDto } from '../../../api/service-proxies';
import { SessionService } from '../../../core/services/session.service';
import { Router, RouterLink } from '@angular/router';
import { BUSINESS_CATEGORIES, SLUG_PATTERN } from '../../../shared/global.config';
import { CustomValidators } from '../../../shared/validators';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  imports: [ReactiveFormsModule, RouterLink, InputComponent],
  selector: 'app-register',
  styleUrl: './register.component.scss',
  templateUrl: './register.component.html',
  providers: [AuthControllerClient],
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthControllerClient);
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected readonly categories = BUSINESS_CATEGORIES;
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group(
    {
      businessName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
      city: ['', [Validators.required]],
      slug: ['', [Validators.required, Validators.pattern(SLUG_PATTERN)]],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, CustomValidators.iranianMobile()]],
      password: ['', [Validators.required, Validators.minLength(8), CustomValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: CustomValidators.passwordsMatch('password', 'confirmPassword') },
  );

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);

    const { confirmPassword, ...payload } = this.form.getRawValue();
    this.auth.register(payload as any as RegisterDto).subscribe({
      next: (res: any) => {
        this.session.save(res.token, res.businessId);
        void this.router.navigateByUrl('/panel/profile');
      },
      error: () => this.submitting.set(false),
    });
  }
}
