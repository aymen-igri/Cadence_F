import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { SignIn } from './pages/auth/sign-in/sign-in';
import { SignUp } from './pages/auth/sign-up/sign-up';
import { Forbidden } from './pages/forbidden/forbidden';
import { NotFound } from './pages/not-found/not-found';
import { MainLayout } from './layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        component: Home,
      },
    ],
  },
  {
    path: 'sign-in',
    component: SignIn,
  },
  {
    path: 'sign-up',
    component: SignUp,
  },
  {
    path: 'forbidden',
    component: Forbidden,
  },
  {
    path: 'not-found',
    component: NotFound,
  },
  {
    path: 'user',
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
