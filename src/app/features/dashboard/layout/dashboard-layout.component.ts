import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { finalize } from 'rxjs';
import { DashboardHeaderService } from './dashboard-header.service';

interface NavigationItem {
  icon: string;
  label: string;
  route?: string;
  roles?: ('super_admin' | 'admin' | 'editor')[];
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss',
})
export class DashboardLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  protected readonly header = inject(DashboardHeaderService).header;

  protected readonly sidebarOpen = signal(false);
  private readonly navigation: NavigationItem[] = [
    { icon: 'bi-newspaper', label: 'News', route: '/dashboard/news' },
    { icon: 'bi-people', label: 'Team', route: '/dashboard/team' },
    { icon: 'bi-123', label: 'Counters', route: '/dashboard/counters' },
    { icon: 'bi-briefcase', label: 'Portfolio', route: '/dashboard/portfolio' },
    { icon: 'bi-person-workspace', label: 'Clients', route: '/dashboard/clients' },
    { icon: 'bi-calendar3', label: 'Events Calendar', route: '/dashboard/events-calendar' },
    { icon: 'bi-layout-text-sidebar-reverse', label: 'Blogs', route: '/dashboard/blogs' },
    { icon: 'bi-person-gear', label: 'Users', route: '/dashboard/users', roles: ['super_admin', 'admin'] },
    { icon: 'bi-person-vcard', label: 'Contact Info', route: '/dashboard/contact-info' },
    { icon: 'bi-phone', label: 'App Links', route: '/dashboard/app-links' },
    { icon: 'bi-music-note-beamed', label: 'Background Music', route: '/dashboard/background-music' },
  ];
  protected readonly visibleNavigation = computed(() =>
    this.navigation.filter((item) => !item.roles || this.auth.hasRole(...item.roles)),
  );
  protected readonly currentUser = this.auth.currentUser;

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected confirmLogout(): void {
    this.confirmation.confirm({
      header: 'Log out?',
      message: 'Are you sure you want to log out of your account?',
      icon: 'bi bi-box-arrow-right',
      acceptLabel: 'Log out',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.logout(),
    });
  }

  private logout(): void {
    this.auth
      .logout()
      .pipe(
        finalize(() => {
          this.auth.clearSession();
          void this.router.navigateByUrl('/auth/login');
        }),
      )
      .subscribe();
  }

}
