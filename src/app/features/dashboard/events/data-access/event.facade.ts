import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { CalendarEvent, CalendarEventPayload } from './event.model';
import { EVENT_REPOSITORY } from './event.repository';

@Injectable({ providedIn: 'root' })
export class EventFacade {
  private readonly repository = inject(EVENT_REPOSITORY);

  readonly events = signal<CalendarEvent[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (events) => this.events.set(events),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: CalendarEventPayload) {
    return this.repository.create(payload).pipe(tap(() => this.load().subscribe()));
  }

  update(id: EntityId, payload: CalendarEventPayload) {
    return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe()));
  }

  remove(id: EntityId) {
    return this.repository.remove(id).pipe(tap(() => this.load().subscribe()));
  }
}
