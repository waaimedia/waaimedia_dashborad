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
  protected readonly status = signal<'all' | EventStatus>('all');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ];
  protected readonly events = this.facade.events;
  protected readonly totalRecords = this.facade.totalRecords;
  protected readonly canDelete = () => this.auth.hasRole('admin');
  protected readonly filteredEvents = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.events().filter(
      (event) =>
        (!query ||
          event.nameEn.toLowerCase().includes(query) ||
          event.nameAr.toLowerCase().includes(query) ||
          event.categoryEn.toLowerCase().includes(query) ||
          event.categoryAr.toLowerCase().includes(query)) &&
        (status === 'all' || event.status === status),
    );
  });
  // The API already returns one page of results, so do not slice it again.
  protected readonly paginatedEvents = this.filteredEvents;

  ngOnInit(): void {
    this.header.showEventsList();
    this.loadPage(1);
  }

  protected addEvent(): void {
    this.router.navigateByUrl('/dashboard/events-calendar/new');
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.loadPage(1);
  }

  protected setStatus(status: 'all' | EventStatus): void {
    this.status.set(status);
    this.loadPage(1);
  }

  protected changePage(page: number): void {
    if (!Number.isInteger(page) || page < 1) return;
    this.loadPage(page);
  }

  protected deleteEvent(event: CalendarEvent): void {
    if (!this.auth.hasRole('admin')) return;
    this.confirmation.confirm({
      header: 'Delete event?',
      message: `“${event.nameEn}” will be permanently deleted.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(event.id).subscribe({
          next: () => {
            this.loadPage(1);
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

  private loadPage(page: number): void {
    this.page.set(page);
    const status = this.status();
    this.facade.load({
      page,
      pageSize: this.pageSize,
      ...(status === 'all' ? {} : { status }),
    }).subscribe();
  }
}
