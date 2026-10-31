import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PortfolioItem, PortfolioItemPayload } from './portfolio.model';

import { PortfolioCategory, PortfolioClientOption } from './portfolio.model';

export interface PortfolioRepository {
  list(): Observable<PortfolioItem[]>;
  getById(id: EntityId): Observable<PortfolioItem>;
  create(payload: PortfolioItemPayload): Observable<PortfolioItem>;
  update(id: EntityId, payload: PortfolioItemPayload): Observable<PortfolioItem>;
  remove(id: EntityId): Observable<void>;
  categories(): Observable<PortfolioCategory[]>;
  clients(): Observable<PortfolioClientOption[]>;
}

export const PORTFOLIO_REPOSITORY = new InjectionToken<PortfolioRepository>('PORTFOLIO_REPOSITORY');
