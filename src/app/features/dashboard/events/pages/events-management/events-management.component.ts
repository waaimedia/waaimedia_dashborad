import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { EventFacade } from '../../data-access/event.facade';
import { CalendarEvent, EventStatus } from '../../data-access/event.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-events-management',
  imports: [DatePipe, FormsModule, RouterLink, Select, PaginationComponent],
  templateUrl: './events-management.component.html',
  styleUrl: './events-management.component.scss',
})
export class EventsManagementComponent implements OnInit {
  private readonly facade = inject(EventFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly status = signal<'All' | EventStatus>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Published', value: 'Published' },
    { label: 'Draft', value: 'Draft' },
  ];
  protected readonly events = this.facade.events;
  protected readonly canDelete = () => this.auth.hasRole('admin');
  protected readonly filteredEvents = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.events().filter(
      (event) =>
        (!query || event.title.toLowerCase().includes(query) || event.category.toLowerCase().includes(query)) &&
        (status === 'All' || event.status === status),
    );
  });
  protected readonly paginatedEvents = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredEvents().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.header.showEventsList();
    this.facade.load().subscribe();
  }

  protected addEvent(): void {
    this.router.navigateByUrl('/dashboard/events-calendar/new');
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }

  protected setStatus(status: 'All' | EventStatus): void {
    this.status.set(status);
    this.page.set(1);
  }

  protected changePage(page: number): void {
    this.page.set(page);
  }

  protected deleteEvent(event: CalendarEvent): void {
    if (!this.auth.hasRole('admin')) return;
    this.confirmation.confirm({
      header: 'Delete event?',
      message: `“${event.title}” will be permanently deleted.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(event.id).subscribe({
          next: () => {
            this.page.set(1);
            this.messages.add({
              severity: 'success',
              summary: 'Event deleted',
              detail: 'The event has been removed successfully.',
              life: 3500,
            });
          },
        });
      },
    });
  }
}
