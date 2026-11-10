import { Routes } from '@angular/router';
import { ownerGuard } from './core/guards/owner.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
  },
  {
    path: 'panel',
    canActivate: [ownerGuard],
    loadComponent: () => import('./features/panel-shell/panel-shell.component').then((m)=> m.PanelShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'bookings' },
      { path: 'bookings',
        loadComponent: () => import('./features/panel-shell/bookings/bookings.component').then((m) => m.BookingsComponent)
      },
      { path: 'hours',
        loadComponent: () => import('./features/panel-shell/hours/hours.component').then((m) => m.HoursComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/panel-shell/profile/profile.component').then((m) => m.ProfileComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/panel-shell/services/services.component').then((m) => m.ServicesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
