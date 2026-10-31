import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PortfolioCategory, PortfolioClientOption, PortfolioItem, PortfolioItemPayload } from './portfolio.model';
import { PORTFOLIO_REPOSITORY } from './portfolio.repository';

@Injectable({ providedIn: 'root' })
export class PortfolioFacade {
  private readonly repository = inject(PORTFOLIO_REPOSITORY);

  readonly items = signal<PortfolioItem[]>([]);
  readonly categories = signal<PortfolioCategory[]>([]);
  readonly clients = signal<PortfolioClientOption[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (items) => this.items.set(items),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  loadFormOptions() {
    return this.repository.categories().pipe(tap((categories) => this.categories.set(categories)));
  }

  loadClients() {
    return this.repository.clients().pipe(tap((clients) => this.clients.set(clients)));
  }

  create(payload: PortfolioItemPayload) {
    return this.repository.create(payload).pipe(tap(() => this.load().subscribe()));
  }

  update(id: EntityId, payload: PortfolioItemPayload) {
    return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe()));
  }

  remove(id: EntityId) {
    return this.repository.remove(id).pipe(tap(() => this.load().subscribe()));
  }
}
