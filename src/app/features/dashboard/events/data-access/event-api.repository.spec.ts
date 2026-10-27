import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { CalendarEventPayload } from './event.model';
import { EventApiRepository } from './event-api.repository';

describe('EventApiRepository', () => {
  const url = `${environment.apiUrl}/admin/events`;
  let repository: EventApiRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    repository = TestBed.inject(EventApiRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('uses POST with a PATCH method override when updating an event cover image', () => {
    const coverImage = new File(['image'], 'cover.jpg', { type: 'image/jpeg' });
    repository.update(7, eventPayload({ coverImage })).subscribe();

    const request = httpTesting.expectOne(`${url}/7`);
    const body = request.request.body as FormData;
    expect(request.request.method).toBe('POST');
    expect(body.get('_method')).toBe('PATCH');
    expect(body.get('cover_image')).toBe(coverImage);

    request.flush({ data: eventResponse() });
  });

  it('keeps PATCH for updates without a replacement cover image', () => {
    repository.update(7, eventPayload()).subscribe();

    const request = httpTesting.expectOne(`${url}/7`);
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).not.toBeInstanceOf(FormData);

    request.flush({ data: eventResponse() });
  });
});

function eventPayload(overrides: Partial<CalendarEventPayload> = {}): CalendarEventPayload {
  return {
    nameEn: 'Launch', nameAr: 'إطلاق', categoryEn: 'Business', categoryAr: 'أعمال',
    descriptionEn: 'Description', descriptionAr: 'وصف', placeEn: 'Cairo', placeAr: 'القاهرة',
    eventDate: '2026-10-28', eventTime: '10:00', url: 'https://example.com', ...overrides,
  };
}

function eventResponse() {
  return {
    id: 7, name_en: 'Launch', name_ar: 'إطلاق', category_en: 'Business', category_ar: 'أعمال',
    description_en: 'Description', description_ar: 'وصف', place_en: 'Cairo', place_ar: 'القاهرة',
    event_date: '2026-10-28', event_time: '10:00:00', cover_image_url: null, url: 'https://example.com', status: 'draft',
  };
}
