import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthControllerClient, LoginDto } from '../../../api/service-proxies';
import { SessionService } from '../../../core/services/session.service';
import { NotificationService } from '../../../core/services/notification.service';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  imports: [ReactiveFormsModule, RouterLink, InputComponent],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
  providers: [AuthControllerClient]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthControllerClient);
  private readonly session = inject(SessionService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.minLength(11)]],
    password: ['', [Validators.required]],
  });

  protected submit(): void {
    if (this.form.invalid || this.submitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.auth.login(this.form.getRawValue() as any as LoginDto).subscribe({
      next: (res: any) => {
        this.session.save(res?.token, res?.businessId);
        void this.router.navigateByUrl('/panel/bookings');
      },
      error: (err) => {
        this.submitting.set(false);
        this.notification.showError(err.message);
      }
    });
  }
}
