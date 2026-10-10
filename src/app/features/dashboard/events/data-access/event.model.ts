import { EntityId } from '../../../../core/data-access/crud-repository';

export type EventStatus = 'Published' | 'Draft';

export interface CalendarEvent {
  id: EntityId;
  title: string;
  date: string;
  category: string;
  place: string;
  eventLink?: string;
  status: EventStatus;
  imageName?: string;
}

export interface CalendarEventPayload {
  title: string;
  date: string;
  category: string;
  place: string;
  eventLink?: string;
  status: EventStatus;
  imageName?: string;
}
