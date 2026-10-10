import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { CalendarEvent, CalendarEventPayload } from './event.model';

export const EVENT_REPOSITORY = new InjectionToken<CrudRepository<CalendarEvent, CalendarEventPayload>>(
  'EVENT_REPOSITORY',
);
