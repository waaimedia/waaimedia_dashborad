import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { CalendarEvent, CalendarEventPayload, EventStatus } from './event.model';
import { EventListRequest, EventRepository } from './event.repository';

interface ApiEvent {
  id: number;
  slug?: string | null;
  name_en?: string | null;
  name_ar?: string | null;
  category_en?: string | null;
  category_ar?: string | null;
  description_en?: string | null;
  description_ar?: string | null;
  place_en?: string | null;
  place_ar?: string | null;
  event_date?: string | null;
  event_time?: string | null;
  cover_image_url?: string | null;
  url?: string | null;
  status: EventStatus;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ApiResourceResponse { data: ApiEvent; }
interface ApiListResponse {
  data: ApiEvent[];
  meta: {
    total: number;
  };
}

@Injectable({ providedIn: 'root' })
export class EventApiRepository implements EventRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/events`;

  list(request: EventListRequest): Observable<PageResult<CalendarEvent>> {
    const params: Record<string, string | number> = {
      page: request.page,
      per_page: request.pageSize,
    };
    if (request.status) params['status'] = request.status;

    return this.http
      .get<ApiListResponse>(this.url, {
        params,
      })
      .pipe(
        map(({ data, meta }) => ({
          items: data.map((event) => this.toEvent(event)),
          totalRecords: meta.total,
        })),
      );
  }

  getById(id: EntityId): Observable<CalendarEvent> {
    return this.http.get<ApiResourceResponse>(`${this.url}/${id}`).pipe(map(({ data }) => this.toEvent(data)));
  }

  create(payload: CalendarEventPayload): Observable<CalendarEvent> {
    return this.http.post<ApiResourceResponse>(this.url, this.toRequestBody(payload)).pipe(map(({ data }) => this.toEvent(data)));
  }

  update(id: EntityId, payload: CalendarEventPayload): Observable<CalendarEvent> {
    const body = this.toRequestBody(payload);
    if (body instanceof FormData) {
      body.append('_method', 'PATCH');
      return this.http.post<ApiResourceResponse>(`${this.url}/${id}`, body).pipe(map(({ data }) => this.toEvent(data)));
    }

    return this.http.patch<ApiResourceResponse>(`${this.url}/${id}`, body).pipe(map(({ data }) => this.toEvent(data)));
  }

  publish(id: EntityId): Observable<CalendarEvent> {
    return this.http.post<ApiResourceResponse>(`${this.url}/${id}/publish`, {}).pipe(map(({ data }) => this.toEvent(data)));
  }

  unpublish(id: EntityId): Observable<CalendarEvent> {
    return this.http.post<ApiResourceResponse>(`${this.url}/${id}/unpublish`, {}).pipe(map(({ data }) => this.toEvent(data)));
  }

  remove(id: EntityId): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private toRequestBody(payload: CalendarEventPayload): FormData | Record<string, string> {
    const values: Record<string, string> = {
      name_en: payload.nameEn.trim(), name_ar: payload.nameAr.trim(),
      category_en: payload.categoryEn.trim(), category_ar: payload.categoryAr.trim(),
      description_en: payload.descriptionEn.trim(), description_ar: payload.descriptionAr.trim(),
      place_en: payload.placeEn.trim(), place_ar: payload.placeAr.trim(),
      event_date: payload.eventDate, event_time: payload.eventTime, url: payload.url.trim(),
    };
    if (!payload.coverImage) return values;
    const body = new FormData();
    Object.entries(values).forEach(([key, value]) => body.append(key, value));
    body.append('cover_image', payload.coverImage);
    return body;
  }

  private toEvent(event: ApiEvent): CalendarEvent {
    return {
      id: event.id, slug: event.slug ?? null, nameEn: event.name_en ?? '', nameAr: event.name_ar ?? '',
      categoryEn: event.category_en ?? '', categoryAr: event.category_ar ?? '',
      descriptionEn: event.description_en ?? '', descriptionAr: event.description_ar ?? '',
      placeEn: event.place_en ?? '', placeAr: event.place_ar ?? '',
      eventDate: event.event_date ?? '', eventTime: event.event_time?.slice(0, 5) ?? '',
      coverImageUrl: event.cover_image_url ?? '', url: event.url ?? '', status: event.status,
      publishedAt: event.published_at ?? null, createdAt: event.created_at ?? null, updatedAt: event.updated_at ?? null,
    };
  }
}
