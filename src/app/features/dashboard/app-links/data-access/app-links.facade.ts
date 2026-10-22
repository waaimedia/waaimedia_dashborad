import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { AppLinks } from './app-links.model';
import { APP_LINKS_REPOSITORY } from './app-links.repository';

@Injectable({ providedIn: 'root' })
export class AppLinksFacade {
  private readonly repository = inject(APP_LINKS_REPOSITORY);

  readonly links = signal<AppLinks | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.get().pipe(
      tap({
        next: (links) => this.links.set(links),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  save(links: AppLinks) {
    this.saving.set(true);
    return this.repository.save(links).pipe(
      tap({
        next: ({ links: savedLinks }) => this.links.set(savedLinks),
        finalize: () => this.saving.set(false),
      }),
    );
  }
}
