import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PortfolioCategory, PortfolioClientOption, PortfolioItem, PortfolioItemPayload } from './portfolio.model';
import { PortfolioRepository } from './portfolio.repository';

/** Lightweight offline fixture retained for local UI development. The app uses PortfolioApiRepository. */
@Injectable({ providedIn: 'root' })
export class PortfolioMockRepository implements PortfolioRepository {
  private items: PortfolioItem[] = [{
    id: 1, slug: 'nile-commerce-platform-1', titleEn: 'Nile Commerce Platform', titleAr: null, status: 'published',
    clientId: 1, clientName: 'Nile Commerce', categoryId: 1, categoryName: 'Web Design', kind: 'web_design',
    coverImageUrl: null, linkOne: 'https://example.com', media: [], mediaCount: 0,
  }];

  list(): Observable<PortfolioItem[]> { return of([...this.items]); }
  getById(id: EntityId): Observable<PortfolioItem> { const item = this.items.find((candidate) => candidate.id === id); return item ? of(item) : throwError(() => new Error('Portfolio item not found.')); }
  create(payload: PortfolioItemPayload): Observable<PortfolioItem> {
    const item: PortfolioItem = { id: Date.now(), slug: `${payload.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`, titleEn: payload.titleEn, titleAr: payload.titleAr, status: payload.status, clientId: payload.clientId, clientName: 'Client', categoryId: payload.categoryId, categoryName: 'Category', subcategoryId: payload.subcategoryId, kind: 'images', media: [], mediaCount: 0 };
    this.items = [item, ...this.items]; return of(item);
  }
  update(id: EntityId, payload: PortfolioItemPayload): Observable<PortfolioItem> { const index = this.items.findIndex((candidate) => candidate.id === id); if (index < 0) return throwError(() => new Error('Portfolio item not found.')); const item = { ...this.items[index], titleEn: payload.titleEn, titleAr: payload.titleAr, status: payload.status, clientId: payload.clientId, categoryId: payload.categoryId, subcategoryId: payload.subcategoryId }; this.items[index] = item; return of(item); }
  remove(id: EntityId): Observable<void> { this.items = this.items.filter((item) => item.id !== id); return of(void 0); }
  categories(): Observable<PortfolioCategory[]> { return of([]); }
  clients(): Observable<PortfolioClientOption[]> { return of([]); }
}
