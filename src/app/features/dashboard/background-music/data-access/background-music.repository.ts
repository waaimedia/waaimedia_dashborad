import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BackgroundMusicSettings, BackgroundMusicUpdate } from './background-music.model';

export interface BackgroundMusicRepository {
  get(): Observable<BackgroundMusicSettings>;
  save(update: BackgroundMusicUpdate): Observable<BackgroundMusicSettings>;
}

export const BACKGROUND_MUSIC_REPOSITORY = new InjectionToken<BackgroundMusicRepository>(
  'BACKGROUND_MUSIC_REPOSITORY',
);
