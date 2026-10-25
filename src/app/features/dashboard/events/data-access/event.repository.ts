import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageRequest, PageResult } from '../../../../core/data-access/pagination.model';
import { CalendarEvent, CalendarEventPayload, EventStatus } from './event.model';

export interface EventListRequest extends PageRequest {
  status?: EventStatus;
}

export interface EventRepository {
  list(request: EventListRequest): Observable<PageResult<CalendarEvent>>;
  getById(id: EntityId): Observable<CalendarEvent>;
  create(payload: CalendarEventPayload): Observable<CalendarEvent>;
  update(id: EntityId, payload: CalendarEventPayload): Observable<CalendarEvent>;
  publish(id: EntityId): Observable<CalendarEvent>;
  unpublish(id: EntityId): Observable<CalendarEvent>;
  remove(id: EntityId): Observable<void>;
}

export const EVENT_REPOSITORY = new InjectionToken<EventRepository>('EVENT_REPOSITORY');
