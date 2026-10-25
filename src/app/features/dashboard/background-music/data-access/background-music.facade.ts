import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { BackgroundMusicSettings, BackgroundMusicUpdate } from './background-music.model';
import { BACKGROUND_MUSIC_REPOSITORY } from './background-music.repository';

@Injectable({ providedIn: 'root' })
export class BackgroundMusicFacade {
  private readonly repository = inject(BACKGROUND_MUSIC_REPOSITORY);
  readonly settings = signal<BackgroundMusicSettings | null>(null);
  load() {
    return this.repository.get().pipe(tap((settings) => this.settings.set(settings)));
  }
  save(update: BackgroundMusicUpdate) {
    return this.repository
      .save(update)
      .pipe(tap((savedSettings) => this.settings.set(savedSettings)));
  }
}
