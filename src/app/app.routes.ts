import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { mfaGuard } from './core/guards/mfa.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
    ],
  },
  {
    path: 'sign-in',
    canMatch: [guestGuard],
    loadComponent: () => import('./pages/auth/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'sign-up',
    canMatch: [guestGuard],
    loadComponent: () => import('./pages/auth/sign-up/sign-up').then((m) => m.SignUp),
  },
  {
    path: 'auth/mfa',
    canMatch: [mfaGuard],
    children: [
      {
        path: 'type',
        loadComponent: () => import('./pages/auth/mfa/mfa-type/mfa-type').then((m) => m.MfaType),
      },
      {
        path: 'verify',
        loadComponent: () =>
          import('./pages/auth/mfa/mfa-verify/mfa-verify').then((m) => m.MfaVerify),
      },
    ],
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./pages/forbidden/forbidden').then((m) => m.Forbidden),
  },
  {
    path: 'not-found',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  {
    path: 'server-error',
    loadComponent: () => import('./pages/server-error/server-error').then((m) => m.ServerErrorPage),
  },
  {
    path: 'user',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./layouts/side-bar-layout/side-bar-layout').then((m) => m.SideBarLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        data: { preload: true },
        loadComponent: () => import('./pages/user/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'inbox',
        loadComponent: () => import('./pages/user/inbox/inbox').then((m) => m.Inbox),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./pages/user/sessions/sessions').then((m) => m.SessionsComponent),
      },
      {
        path: 'weekly-plan',
        loadComponent: () =>
          import('./pages/user/weekly-plan/weekly-plan').then((m) => m.WeeklyPlanComponent),
      },
      {
        path: 'groups',
        loadComponent: () => import('./pages/user/groups/groups').then((m) => m.GroupsComponent),
      },
      {
        path: 'groups/:id',
        loadComponent: () =>
          import('./pages/user/group-detail/group-detail').then((m) => m.GroupDetailComponent),
      },
      {
        path: 'study-map',
        loadComponent: () =>
          import('./pages/user/study-map/study-map').then((m) => m.StudyMapComponent),
      },
      {
        path: 'logout',
        loadComponent: () => import('./pages/user/logout/logout').then((m) => m.LogoutComponent),
      },
      {
        path: 'availability-plan',
        loadComponent: () =>
          import('./pages/user/availability-plan/availability-plan').then(
            (m) => m.AvailibilityPlan,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/user/settings/settings').then((m) => m.SettingsComponent),
      },
      {
        path: 'availability-plan/list',
        loadComponent: () =>
          import('./pages/user/availability-list/availability-list').then(
            (m) => m.AvailabilityListComponent,
          ),
      },
      {
        path: 'availability-plan/:id',
        loadComponent: () =>
          import('./pages/user/availability-plan/availability-plan').then(
            (m) => m.AvailibilityPlan,
          ),
      },
    ],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./layouts/side-bar-layout/side-bar-layout').then((m) => m.SideBarLayout),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard').then((m) => m.AdminDashboard),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/admin/users/users').then((m) => m.AdminUsers),
      },
      {
        path: 'settings',
        loadComponent: () => import('./pages/admin/settings/settings').then((m) => m.AdminSettings),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
