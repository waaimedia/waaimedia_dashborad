import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { BackgroundMusicSettings, BackgroundMusicUpdate } from './background-music.model';
import { BackgroundMusicRepository } from './background-music.repository';

interface ApiBackgroundMusic {
  has_track: boolean;
  file_name: string | null;
  file_url: string | null;
  file_size: number | null;
  mime_type: string | null;
  is_enabled: boolean;
  is_loop: boolean;
  updated_at: string | null;
}

interface BackgroundMusicResponse {
  data: ApiBackgroundMusic;
}

@Injectable({ providedIn: 'root' })
export class BackgroundMusicApiRepository implements BackgroundMusicRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/background-music`;

  get(): Observable<BackgroundMusicSettings> {
    return this.http
      .get<BackgroundMusicResponse>(this.url)
      .pipe(map(({ data }) => this.toSettings(data)));
  }

  save(update: BackgroundMusicUpdate): Observable<BackgroundMusicSettings> {
    const body = new FormData();
    body.append('is_enabled', String(update.enabled));
    body.append('is_loop', String(update.loop));
    if (update.audioFile) {
      body.append('audio_file', update.audioFile, update.audioFile.name);
    }

    // The backend uses POST for multipart uploads/replacements and PUT only for
    // settings changes. Sending a file through PUT is not part of its contract.
    const request = update.audioFile
      ? this.http.post<BackgroundMusicResponse>(this.url, body)
      : this.http.put<BackgroundMusicResponse>(this.url, body);

    return request.pipe(map(({ data }) => this.toSettings(data)));
  }

  private toSettings(data: ApiBackgroundMusic): BackgroundMusicSettings {
    return {
      sourceUrl: data.file_url ?? '',
      fileName: data.file_name ?? '',
      hasTrack: data.has_track,
      fileSize: data.file_size,
      mimeType: data.mime_type,
      enabled: data.is_enabled,
      loop: data.is_loop,
      updatedAt: data.updated_at,
    };
  }
}
