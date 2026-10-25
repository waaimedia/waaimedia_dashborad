import { EntityId } from '../../../../core/data-access/crud-repository';

export type EventStatus = 'draft' | 'published';

export interface CalendarEvent {
  id: EntityId;
  slug: string | null;
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  placeEn: string;
  placeAr: string;
  eventDate: string;
  eventTime: string;
  coverImageUrl: string;
  url: string;
  status: EventStatus;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CalendarEventPayload {
  nameEn: string;
  nameAr: string;
  categoryEn: string;
  categoryAr: string;
  descriptionEn: string;
  descriptionAr: string;
  placeEn: string;
  placeAr: string;
  eventDate: string;
  eventTime: string;
  url: string;
  coverImage?: File;
}
