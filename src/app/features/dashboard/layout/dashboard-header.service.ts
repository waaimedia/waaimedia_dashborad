import { Injectable, signal } from '@angular/core';

export interface DashboardHeader {
  title: string;
  subtitle: string;
  action?: {
    label: string;
    route: string;
  };
}

const NEWS_LIST_HEADER: DashboardHeader = {
  title: 'News Management',
  subtitle: 'Manage your news articles and publications',
  action: { label: 'Add News', route: '/dashboard/news/new' },
};

@Injectable({ providedIn: 'root' })
export class DashboardHeaderService {
  readonly header = signal<DashboardHeader>(NEWS_LIST_HEADER);

  showNewsList(): void {
    this.header.set(NEWS_LIST_HEADER);
  }

  showNewsForm(editing: boolean): void {
    this.header.set({
      title: editing ? 'Update News' : 'Add News',
      subtitle: editing ? 'Update and publish your article' : 'Create and publish new articles',
    });
  }

  showTeamList(): void {
    this.header.set({
      title: 'Manage Team',
      subtitle: 'Add, edit, and manage your team members',
      action: { label: 'Add Team Member', route: '/dashboard/team/new' },
    });
  }

  showTeamForm(editing: boolean): void {
    this.header.set({
      title: editing ? 'Update Team Member' : 'Add Team Member',
      subtitle: editing ? 'Update this team member' : 'Create a new member',
    });
  }

  showClientsList(): void {
    this.header.set({
      title: 'Manage Clients',
      subtitle: 'Add, edit, and manage your clients',
      action: { label: 'Add Client', route: '/dashboard/clients/new' },
    });
  }

  showClientForm(editing: boolean): void {
    this.header.set({
      title: editing ? 'Update Client' : 'Add Client',
      subtitle: editing ? 'Update this client' : 'Create a new client',
    });
  }

  showEventsList(): void {
    this.header.set({
      title: 'Events Calendar Management',
      subtitle: 'Manage your events and publications',
      action: { label: 'Add Event', route: '/dashboard/events-calendar/new' },
    });
  }

  showEventForm(editing: boolean): void {
    this.header.set({
      title: editing ? 'Update Event' : 'Add Event',
      subtitle: editing ? 'Update your event details' : 'Create and publish new event',
    });
  }

  showContactInfo(): void {
    this.header.set({
      title: 'Contact Info',
      subtitle: "Manage your website's contact details and location",
    });
  }

  showAppLinks(): void {
    this.header.set({
      title: 'App Links',
      subtitle: 'Manage mobile application download links',
    });
  }

  showBlogsList(): void {
    this.header.set({
      title: 'Blogs Management',
      subtitle: 'Manage your blog posts and publications',
      action: { label: 'Add Blog', route: '/dashboard/blogs/new' },
    });
  }

  showBlogForm(editing: boolean): void {
    this.header.set({
      title: editing ? 'Update Blog' : 'Add Blog',
      subtitle: editing ? 'Update and publish your blog post' : 'Create and publish new blog posts',
    });
  }

  showUsersList(): void {
    this.header.set({ title: 'Manage Users', subtitle: 'Add, edit, and manage dashboard users', action: { label: 'Add User', route: '/dashboard/users/new' } });
  }

  showUserForm(editing: boolean): void {
    this.header.set({ title: editing ? 'Update User' : 'Add User', subtitle: editing ? 'Update this user account' : 'Create a new user account' });
  }

  showUserPassword(name: string): void {
    this.header.set({ title: 'Change Password', subtitle: `Set a new password for ${name}` });
  }

  showBackgroundMusic(): void {
    this.header.set({ title: 'Background Music', subtitle: 'Add and configure music for your website background' });
  }

  showCounters(): void {
    this.header.set({
      title: 'Manage Counters',
      subtitle: 'Update the numeric counters displayed on your website homepage',
    });
  }
}
