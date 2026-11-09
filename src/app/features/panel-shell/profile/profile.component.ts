import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BusinessControllerClient, UpdateBusinessDto } from '../../../api/service-proxies';
import { NotificationService } from '../../../core/services/notification.service';
import { SLUG_PATTERN } from '../../../shared/global.config';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/ui/input/input.component';

@Component({
  imports: [ReactiveFormsModule, InputComponent],
  selector: 'app-profile',
  styleUrl: './profile.component.scss',
  templateUrl: './profile.component.html',
  providers: [BusinessControllerClient]
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(BusinessControllerClient);
  private readonly notification = inject(NotificationService);

  protected readonly saving = signal(false);
  protected readonly business = signal(null);
  protected readonly copied = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    city: ['', [Validators.required]],
    address: ['', [Validators.maxLength(255)]],
    phone: ['', [Validators.required, Validators.minLength(7)]],
    description: ['', [Validators.maxLength(2000)]],
    slug: ['', [Validators.required, Validators.pattern(SLUG_PATTERN)]],
  });

  constructor() {
    this.api
      .getMyBusiness()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(b => this.load(b));
  }

  private load(b: any): void {
    this.business.set(b);
    this.form.reset({
      name: b.name,
      city: b.city,
      address: b.address ?? '',
      phone: b.phone,
      description: b.description ?? '',
      slug: b.slug,
    });
  }

  protected async copyLink(): Promise<void> {
    const url = this.publicUrl();
    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      this.notification.showInfo(url);
    }
  }

  protected publicUrl(): string {
    const slug = this.form.controls.slug.value;
    return `${window.location.origin}/booking/${slug}`;
  }

  protected save(): void {
    if(this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(false);
    const formValue = this.form.getRawValue();
    this.api
      .updateMyBusiness(formValue as any as UpdateBusinessDto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
      next: (b) => {
        this.saving.set(false);
        this.load(b);
        this.notification.showSuccess('اطلاعات کسب‌وکار ذخیره شد.');
      },
      error: () => this.saving.set(false),
    })
  }
}
