import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SessionService } from '../../../core/services/session.service';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { finalize } from 'rxjs';
import { AuthControllerService, LoginDto } from '../../../api/service-proxies';

@Component({
  imports: [ReactiveFormsModule, RouterLink, InputComponent],
  selector: 'app-login',
  styleUrl: './login.component.scss',
  templateUrl: './login.component.html',
  providers: [AuthControllerService]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthControllerService);
  private readonly session = inject(SessionService);
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
    const body = new LoginDto({
      ...this.form.getRawValue()
    })
    this.auth.login(body)
    .pipe(finalize(()=> this.submitting.set(false))).subscribe({
      next: (res: any) => {
        console.log('LOGIN RESPONSE >>>', res);
        this.session.save(res?.token, res?.businessId);
        void this.router.navigateByUrl('/panel/bookings');
      }
    });
  }
}
