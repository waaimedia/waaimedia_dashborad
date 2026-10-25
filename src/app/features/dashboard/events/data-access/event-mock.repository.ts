import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { CalendarEvent, CalendarEventPayload } from './event.model';
import { EventListRequest, EventRepository } from './event.repository';

@Injectable({ providedIn: 'root' })
export class EventMockRepository implements EventRepository {
  private events: CalendarEvent[] = [
    {
      id: 1,
      slug: 'digital-innovation-summit-1',
      nameEn: 'Digital Innovation Summit', nameAr: 'قمة الابتكار الرقمي',
      categoryEn: 'Conference', categoryAr: 'مؤتمر',
      descriptionEn: 'A summit for digital innovation.', descriptionAr: 'قمة للابتكار الرقمي.',
      placeEn: 'Cairo International Convention Center', placeAr: 'مركز القاهرة الدولي للمؤتمرات',
      eventDate: '2026-12-30', eventTime: '18:00', coverImageUrl: '', url: '', status: 'published',
      publishedAt: '2026-10-24T20:00:00.000000Z', createdAt: '2026-10-24T20:00:00.000000Z', updatedAt: '2026-10-24T20:00:00.000000Z',
    },
    {
      id: 2,
      slug: 'small-business-marketing-workshop-2',
      nameEn: 'Small Business Marketing Workshop', nameAr: 'ورشة تسويق الأعمال الصغيرة',
      categoryEn: 'Workshop', categoryAr: 'ورشة عمل',
      descriptionEn: '', descriptionAr: '', placeEn: 'Waai Media Office', placeAr: 'مكتب وعي ميديا',
      eventDate: '2026-12-28', eventTime: '', coverImageUrl: '', url: '', status: 'draft',
      publishedAt: null, createdAt: '2026-10-24T20:00:00.000000Z', updatedAt: '2026-10-24T20:00:00.000000Z',
    },
    {
      id: 3,
      slug: 'future-of-remote-work-3',
      nameEn: 'Future of Remote Work', nameAr: 'مستقبل العمل عن بعد',
      categoryEn: 'Panel discussion', categoryAr: 'حلقة نقاش',
      descriptionEn: 'A remote work panel.', descriptionAr: 'حلقة نقاش حول العمل عن بعد.',
      placeEn: 'Online', placeAr: 'عبر الإنترنت',
      eventDate: '2026-12-27', eventTime: '16:00', coverImageUrl: '', url: 'https://example.com/events/remote-work', status: 'published',
      publishedAt: '2026-10-24T20:00:00.000000Z', createdAt: '2026-10-24T20:00:00.000000Z', updatedAt: '2026-10-24T20:00:00.000000Z',
    },
  ];

  list({ page, pageSize, status }: EventListRequest): Observable<PageResult<CalendarEvent>> {
    const start = (page - 1) * pageSize;
    const matchingEvents = status ? this.events.filter((event) => event.status === status) : this.events;
    return of({
      items: matchingEvents.slice(start, start + pageSize),
      totalRecords: matchingEvents.length,
    });
  }

  getById(id: EntityId): Observable<CalendarEvent> {
    const event = this.events.find((item) => item.id === id);
    return event ? of(event) : throwError(() => new Error('Event not found.'));
  }

  create(payload: CalendarEventPayload): Observable<CalendarEvent> {
    const event: CalendarEvent = {
      ...payload,
      id: Date.now(),
      slug: null,
      coverImageUrl: '',
      status: 'draft',
      publishedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
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

  publish(id: EntityId): Observable<CalendarEvent> {
    return this.setStatus(id, 'published');
  }

  unpublish(id: EntityId): Observable<CalendarEvent> {
    return this.setStatus(id, 'draft');
  }

  remove(id: EntityId): Observable<void> {
    this.events = this.events.filter((event) => event.id !== id);
    return of(void 0);
  }

  private setStatus(id: EntityId, status: CalendarEvent['status']): Observable<CalendarEvent> {
    const event = this.events.find((item) => item.id === id);
    if (!event) return throwError(() => new Error('Event not found.'));

    const updatedEvent = { ...event, status };
    this.events = this.events.map((item) => (item.id === id ? updatedEvent : item));
    return of(updatedEvent);
  }
}
