import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, afterEach, beforeEach, expect, it } from 'vitest';
import { environment } from '../../../../../environments/environment';
import { BackgroundMusicApiRepository } from './background-music-api.repository';

describe('BackgroundMusicApiRepository', () => {
  const url = `${environment.apiUrl}/admin/background-music`;
  let repository: BackgroundMusicApiRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    repository = TestBed.inject(BackgroundMusicApiRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('sends settings updates as a POST with a PUT method override and no file', () => {
    repository.save({ enabled: false, loop: false, audioFile: null }).subscribe();

    const request = httpTesting.expectOne(url);
    const body = request.request.body as FormData;
    expect(request.request.method).toBe('POST');
    expect(body.get('is_enabled')).toBe('false');
    expect(body.get('is_loop')).toBe('false');
    expect(body.get('_method')).toBe('PUT');
    expect(body.has('audio_file')).toBe(false);

    request.flush({ data: responseData() });
  });

  it('includes the audio file only when a new file is selected', () => {
    const file = new File(['audio'], 'new-track.mp3', { type: 'audio/mpeg' });
    repository.save({ enabled: true, loop: true, audioFile: file }).subscribe();

    const request = httpTesting.expectOne(url);
    const body = request.request.body as FormData;
    expect(request.request.method).toBe('POST');
    expect(body.get('_method')).toBe('PUT');
    expect(body.get('audio_file')).toBe(file);

    request.flush({ data: responseData() });
  });
});

function responseData() {
  return {
    has_track: true,
    file_name: 'track.mp3',
    file_url: 'https://example.com/track.mp3',
    file_size: 123,
    mime_type: 'audio/mpeg',
    is_enabled: false,
    is_loop: false,
    updated_at: '2026-10-26T10:00:00Z',
  };
}
