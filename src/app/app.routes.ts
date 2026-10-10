import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/layout/dashboard-layout.component').then(
        (m) => m.DashboardLayoutComponent,
      ),
    children: [
      {
        path: 'counters',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/counters/pages/counters-management/counters-management.component').then(
            (m) => m.CountersManagementComponent,
          ),
      },
      {
        path: 'team/new',
        loadComponent: () =>
          import('./features/dashboard/team/pages/team-form/team-form.component').then((m) => m.TeamFormComponent),
      },
      {
        path: 'team/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/team/pages/team-form/team-form.component').then((m) => m.TeamFormComponent),
      },
      {
        path: 'team',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/team/pages/team-management/team-management.component').then(
            (m) => m.TeamManagementComponent,
          ),
      },
      {
        path: 'users/new',
        loadComponent: () => import('./features/dashboard/users/pages/user-form/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/edit',
        loadComponent: () => import('./features/dashboard/users/pages/user-form/user-form.component').then((m) => m.UserFormComponent),
      },
      {
        path: 'users/:id/change-password',
        loadComponent: () => import('./features/dashboard/users/pages/user-password/user-password.component').then((m) => m.UserPasswordComponent),
      },
      {
        path: 'users',
        pathMatch: 'full',
        loadComponent: () => import('./features/dashboard/users/pages/users-management/users-management.component').then((m) => m.UsersManagementComponent),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/dashboard/clients/pages/client-form/client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/clients/pages/client-form/client-form.component').then((m) => m.ClientFormComponent),
      },
      {
        path: 'clients',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/clients/pages/clients-management/clients-management.component').then(
            (m) => m.ClientsManagementComponent,
          ),
      },
      {
        path: 'events-calendar/new',
        loadComponent: () =>
          import('./features/dashboard/events/pages/event-form/event-form.component').then((m) => m.EventFormComponent),
      },
      {
        path: 'events-calendar/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/events/pages/event-form/event-form.component').then((m) => m.EventFormComponent),
      },
      {
        path: 'events-calendar',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/events/pages/events-management/events-management.component').then(
            (m) => m.EventsManagementComponent,
          ),
      },
      {
        path: 'contact-info',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/contact-info/pages/contact-info/contact-info.component').then(
            (m) => m.ContactInfoComponent,
          ),
      },
      {
        path: 'app-links',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/app-links/pages/app-links/app-links.component').then(
            (m) => m.AppLinksComponent,
          ),
      },
      {
        path: 'background-music',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/background-music/pages/background-music/background-music.component').then(
            (m) => m.BackgroundMusicComponent,
          ),
      },
      {
        path: 'blogs/new',
        loadComponent: () =>
          import('./features/dashboard/blogs/pages/blog-form/blog-form.component').then((m) => m.BlogFormComponent),
      },
      {
        path: 'blogs/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/blogs/pages/blog-form/blog-form.component').then((m) => m.BlogFormComponent),
      },
      {
        path: 'blogs',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/blogs/pages/blogs-management/blogs-management.component').then(
            (m) => m.BlogsManagementComponent,
          ),
      },
      {
        path: 'news/new',
        loadComponent: () =>
          import('./features/dashboard/news/pages/news-form/news-form.component').then((m) => m.NewsFormComponent),
      },
      {
        path: 'news/:id/edit',
        loadComponent: () =>
          import('./features/dashboard/news/pages/news-form/news-form.component').then((m) => m.NewsFormComponent),
      },
      {
        path: 'news',
        pathMatch: 'full',
        loadComponent: () =>
          import('./features/dashboard/news/pages/news-management/news-management.component').then(
            (m) => m.NewsManagementComponent,
          ),
      },
      { path: '', pathMatch: 'full', redirectTo: 'news' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: '**', redirectTo: 'dashboard' },
];
