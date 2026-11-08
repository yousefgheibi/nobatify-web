import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SessionService } from '../../core/services/session.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-panel-shell',
  styleUrl: './panel-shell.component.scss',
  templateUrl: './panel-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelShellComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.session.clear();
    void this.router.navigateByUrl('/login');
  }
}
