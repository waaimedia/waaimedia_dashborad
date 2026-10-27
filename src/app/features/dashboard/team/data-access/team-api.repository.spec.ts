import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { TeamApiRepository } from './team-api.repository';

describe('TeamApiRepository', () => {
  const url = `${environment.apiUrl}/admin/team-members`;
  let repository: TeamApiRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    repository = TestBed.inject(TeamApiRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('uses POST with a PATCH method override when updating a member photo', () => {
    const photo = new File(['image'], 'member.webp', { type: 'image/webp' });
    repository.update(3, { fullName: 'Maya Hassan', role: 'Editor', photo }).subscribe();

    const request = httpTesting.expectOne(`${url}/3`);
    const body = request.request.body as FormData;
    expect(request.request.method).toBe('POST');
    expect(body.get('_method')).toBe('PATCH');
    expect(body.get('photo')).toBe(photo);

    request.flush({ data: { id: 3, name: 'Maya Hassan', position: 'Editor', photo_url: null } });
  });
});
