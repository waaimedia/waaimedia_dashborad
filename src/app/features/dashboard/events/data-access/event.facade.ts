import { Injectable, inject, signal } from '@angular/core';
import { Observable, switchMap, tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { CalendarEvent, CalendarEventPayload, EventStatus } from './event.model';
import { EventListRequest, EVENT_REPOSITORY } from './event.repository';

@Injectable({ providedIn: 'root' })
export class EventFacade {
  private readonly repository = inject(EVENT_REPOSITORY);

  readonly events = signal<CalendarEvent[]>([]);
  readonly totalRecords = signal(0);
  readonly loading = signal(false);

  load(request: EventListRequest = { page: 1, pageSize: 10 }) {
    this.loading.set(true);
    return this.repository.list(request).pipe(
      tap({
        next: ({ items, totalRecords }) => {
          this.events.set(items);
          this.totalRecords.set(totalRecords);
        },
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: CalendarEventPayload, status: EventStatus): Observable<CalendarEvent> {
    return this.repository.create(payload).pipe(
      switchMap((event) => (status === 'published' ? this.repository.publish(event.id) : [event])),
      tap(() => this.load().subscribe()),
    );
  }

  update(id: EntityId, payload: CalendarEventPayload, status: EventStatus): Observable<CalendarEvent> {
    return this.repository.update(id, payload).pipe(
      switchMap((event) => {
        if (status === 'published') return this.repository.publish(id);
        return event.status === 'published' ? this.repository.unpublish(id) : [event];
      }),
      tap(() => this.load().subscribe()),
    );
  }

  remove(id: EntityId) {
    return this.repository.remove(id);
  }
}
