import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BackgroundMusicSettings, BackgroundMusicUpdate } from './background-music.model';
import { BackgroundMusicRepository } from './background-music.repository';

@Injectable({ providedIn: 'root' })
export class BackgroundMusicMockRepository implements BackgroundMusicRepository {
  private settings: BackgroundMusicSettings = {
    sourceUrl: '',
    fileName: '',
    hasTrack: false,
    fileSize: null,
    mimeType: null,
    enabled: false,
    loop: false,
    updatedAt: null,
  };
  get(): Observable<BackgroundMusicSettings> {
    return of({ ...this.settings });
  }
  save(update: BackgroundMusicUpdate): Observable<BackgroundMusicSettings> {
    this.settings = {
      ...this.settings,
      fileName: update.audioFile?.name ?? this.settings.fileName,
      hasTrack: Boolean(update.audioFile) || this.settings.hasTrack,
      enabled: update.enabled,
      loop: update.loop,
    };
    return of({ ...this.settings });
  }
}
