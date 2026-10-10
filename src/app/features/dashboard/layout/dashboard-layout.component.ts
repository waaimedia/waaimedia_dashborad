import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { DashboardHeaderService } from './dashboard-header.service';

interface NavigationItem {
  icon: string;
  label: string;
  route?: string;
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
  protected readonly header = inject(DashboardHeaderService).header;

  protected readonly sidebarOpen = signal(false);
  protected readonly navigation: NavigationItem[] = [
    { icon: 'bi-newspaper', label: 'News', route: '/dashboard/news' },
    { icon: 'bi-people', label: 'Team', route: '/dashboard/team' },
    { icon: 'bi-123', label: 'Counters', route: '/dashboard/counters' },
    { icon: 'bi-briefcase', label: 'Portfolio' },
    { icon: 'bi-person-workspace', label: 'Clients', route: '/dashboard/clients' },
    { icon: 'bi-calendar3', label: 'Events Calendar', route: '/dashboard/events-calendar' },
    { icon: 'bi-layout-text-sidebar-reverse', label: 'Blogs', route: '/dashboard/blogs' },
    { icon: 'bi-person-gear', label: 'Users', route: '/dashboard/users' },
    { icon: 'bi-person-vcard', label: 'Contact Info', route: '/dashboard/contact-info' },
    { icon: 'bi-phone', label: 'App Links', route: '/dashboard/app-links' },
    { icon: 'bi-music-note-beamed', label: 'Background Music', route: '/dashboard/background-music' },
  ];

  protected toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected logout(): void {
    this.auth.clearSession();
    this.router.navigateByUrl('/auth/login');
  }

}
