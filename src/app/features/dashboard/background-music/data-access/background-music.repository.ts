import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { BackgroundMusicSettings } from './background-music.model';

export interface BackgroundMusicRepository {
  get(): Observable<BackgroundMusicSettings>;
  save(settings: BackgroundMusicSettings): Observable<BackgroundMusicSettings>;
}

export const BACKGROUND_MUSIC_REPOSITORY = new InjectionToken<BackgroundMusicRepository>('BACKGROUND_MUSIC_REPOSITORY');
