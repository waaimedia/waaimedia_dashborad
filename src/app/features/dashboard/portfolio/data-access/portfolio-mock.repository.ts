import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { PortfolioItem, PortfolioItemPayload } from './portfolio.model';

@Injectable({ providedIn: 'root' })
export class PortfolioMockRepository implements CrudRepository<PortfolioItem, PortfolioItemPayload> {
  private items: PortfolioItem[] = [
    { id: 1, title: 'Nile Commerce Platform', category: 'Web Development', status: 'Published', linkOne: 'https://example.com' },
    { id: 2, title: 'Cairo Brand Identity', category: 'Branding', status: 'Published' },
    { id: 3, title: 'Summer Launch Campaign', category: 'Marketing', status: 'Draft' },
  ];

  list(): Observable<PortfolioItem[]> {
    return of([...this.items]);
  }

  getById(id: EntityId): Observable<PortfolioItem> {
    const item = this.items.find((portfolioItem) => portfolioItem.id === id);
    return item ? of(item) : throwError(() => new Error('Portfolio item not found.'));
  }

  create(payload: PortfolioItemPayload): Observable<PortfolioItem> {
    const item: PortfolioItem = { ...payload, id: Date.now() };
    this.items = [item, ...this.items];
    return of(item);
  }

  update(id: EntityId, payload: PortfolioItemPayload): Observable<PortfolioItem> {
    const existingItem = this.items.find((portfolioItem) => portfolioItem.id === id);
    if (!existingItem) {
      return throwError(() => new Error('Portfolio item not found.'));
    }

    const item = { ...existingItem, ...payload };
    this.items = this.items.map((portfolioItem) => (portfolioItem.id === id ? item : portfolioItem));
    return of(item);
  }

  remove(id: EntityId): Observable<void> {
    this.items = this.items.filter((portfolioItem) => portfolioItem.id !== id);
    return of(void 0);
  }
}
