import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BackgroundMusicSettings } from './background-music.model';
import { BackgroundMusicRepository } from './background-music.repository';

@Injectable({ providedIn: 'root' })
export class BackgroundMusicMockRepository implements BackgroundMusicRepository {
  private settings: BackgroundMusicSettings = { sourceUrl: '', fileName: '', enabled: false, loop: true, volume: 30 };
  get(): Observable<BackgroundMusicSettings> { return of({ ...this.settings }); }
  save(settings: BackgroundMusicSettings): Observable<BackgroundMusicSettings> { this.settings = { ...settings }; return of({ ...this.settings }); }
}
