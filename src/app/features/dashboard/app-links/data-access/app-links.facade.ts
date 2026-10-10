import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AppLinks } from './app-links.model';
import { APP_LINKS_REPOSITORY } from './app-links.repository';

@Injectable({ providedIn: 'root' })
export class AppLinksFacade {
  private readonly repository = inject(APP_LINKS_REPOSITORY);

  readonly links = signal<AppLinks | null>(null);

  load() {
    return this.repository.get().pipe(tap((links) => this.links.set(links)));
  }

  save(links: AppLinks) {
    return this.repository.save(links).pipe(tap((savedLinks) => this.links.set(savedLinks)));
  }
}
