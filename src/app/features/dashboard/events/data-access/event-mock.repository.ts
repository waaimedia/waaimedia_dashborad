import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { CalendarEvent, CalendarEventPayload } from './event.model';

@Injectable({ providedIn: 'root' })
export class EventMockRepository implements CrudRepository<CalendarEvent, CalendarEventPayload> {
  private events: CalendarEvent[] = [
    {
      id: 1,
      title: 'Digital Innovation Summit',
      date: '2026-12-30',
      category: 'Conference',
      place: 'Cairo International Convention Center',
      status: 'Published',
    },
    {
      id: 2,
      title: 'Small Business Marketing Workshop',
      date: '2026-12-28',
      category: 'Workshop',
      place: 'Waai Media Office',
      status: 'Draft',
    },
    {
      id: 3,
      title: 'Future of Remote Work',
      date: '2026-12-27',
      category: 'Panel discussion',
      place: 'Online',
      eventLink: 'https://example.com/events/remote-work',
      status: 'Published',
    },
  ];

  list(): Observable<CalendarEvent[]> {
    return of([...this.events]);
  }

  getById(id: EntityId): Observable<CalendarEvent> {
    const event = this.events.find((item) => item.id === id);
    return event ? of(event) : throwError(() => new Error('Event not found.'));
  }

  create(payload: CalendarEventPayload): Observable<CalendarEvent> {
    const event: CalendarEvent = { ...payload, id: Date.now() };
    this.events = [event, ...this.events];
    return of(event);
  }

  update(id: EntityId, payload: CalendarEventPayload): Observable<CalendarEvent> {
    const index = this.events.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('Event not found.'));
    }

    const event = { ...this.events[index], ...payload };
    this.events = this.events.map((item) => (item.id === id ? event : item));
    return of(event);
  }

  remove(id: EntityId): Observable<void> {
    this.events = this.events.filter((event) => event.id !== id);
    return of(void 0);
  }
}
