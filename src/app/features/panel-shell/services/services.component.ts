import { Component, inject, signal } from '@angular/core';
import { ServiceControllerService, ServiceResponseDto } from '../../../api/service-proxies';
import { NotificationService } from '../../../core/services/notification.service';
import { formatDuration, formatToman } from '../../../core/helper/format';
import { ServicesDataFormComponent } from './data-form/services-data-form.component';

@Component({
  imports: [ServicesDataFormComponent],
  selector: 'app-services',
  styleUrl: './services.component.scss',
  templateUrl: './services.component.html',
  providers: [ServiceControllerService]
})
export class ServicesComponent {
  private readonly api = inject(ServiceControllerService);
  private readonly notification = inject(NotificationService);

  protected readonly services = signal<ServiceResponseDto[]>([]);
  protected readonly data = signal<ServiceResponseDto | null>(null);
  protected readonly creating = signal(false);

  protected readonly toman = formatToman;
  protected readonly duration = formatDuration;

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.listServices().subscribe({ next: (rows) => this.services.set(rows) });
  }

  protected startCreate(): void {
    this.data.set(null);
    this.creating.set(true);
  }

  protected startEdit(s: ServiceResponseDto): void {
    this.creating.set(false);
    this.data.set(s);
  }

  protected closeEditor(): void {
    this.creating.set(false);
    this.data.set(null);
  }

  protected onSaved(): void {
    this.closeEditor();
    this.load();
  }

  protected deactivate(s: ServiceResponseDto): void {
    if (!window.confirm(`«${s.name}» از صفحه‌ی رزرو حذف شود؟`)) return;
    this.api.deactivateService(s.id).subscribe({
      next: () => {
        this.notification.showSuccess('خدمت غیرفعال شد.');
        this.load();
      },
    });
  }
}
