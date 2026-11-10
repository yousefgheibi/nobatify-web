import { Component, inject, input, output, signal, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  CreateServiceDto,
  ServiceControllerService,
  ServiceResponseDto,
  UpdateServiceDto,
} from '../../../../api/service-proxies';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-services-data-form',
  styleUrl: './services-data-form.component.scss',
  templateUrl: './services-data-form.component.html',
  providers: [ServiceControllerService]
})
export class ServicesDataFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(ServiceControllerService);
  private readonly notification = inject(NotificationService);

  readonly service = input<ServiceResponseDto | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();

  protected readonly saving = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    priceToman: [0, [Validators.required, Validators.min(0)]],
    durationMin: [30, [Validators.required, Validators.min(5), Validators.max(600)]],
    isActive: [true],
  });

  ngOnChanges(_changes: SimpleChanges): void {
    const s = this.service();
    this.form.reset({
      name: s?.name ?? '',
      priceToman: s?.priceToman ?? 0,
      durationMin: s?.durationMin ?? 30,
      isActive: s?.isActive ?? true,
    });
  }

  protected save(): void {
    if (this.form.invalid || this.saving()) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, priceToman, durationMin, isActive } = this.form.getRawValue();
    const current = this.service();
    this.saving.set(true);

    const request = current
      ? this.api.updateService(
          current.id,
          new UpdateServiceDto({ name, priceToman, durationMin, isActive }),
        )
      : this.api.createService(new CreateServiceDto({ name, priceToman, durationMin }));

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.notification.showSuccess(current ? 'خدمت به‌روزرسانی شد.' : 'خدمت اضافه شد.');
        this.saved.emit();
      },
      error: () => this.saving.set(false),
    });
  }
}
