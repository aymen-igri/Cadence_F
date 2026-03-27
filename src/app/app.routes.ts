import { Routes } from '@angular/router';

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
    loadComponent: () => import('./pages/auth/sign-in/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/auth/sign-up/sign-up').then((m) => m.SignUp),
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
    path: 'user',
    loadComponent: () =>
      import('./layouts/side-bar-layout/side-bar-layout').then((m) => m.SideBarLayout),
    children: [
      {
        path: '',
        redirectTo: 'user/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/user/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'inbox',
        loadComponent: () => import('./pages/user/inbox/inbox').then((m) => m.Inbox),
      },
      {
        path: 'availability',
        loadComponent: () =>
          import('./pages/user/availability/availability').then((m) => m.AvailabilityComponent),
      },
      {
        path: 'sessions',
        loadComponent: () =>
          import('./pages/user/sessions/sessions').then((m) => m.SessionsComponent),
      },
      {
        path: 'study-map',
        loadComponent: () =>
          import('./pages/user/study-map/study-map').then((m) => m.StudyMapComponent),
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
