import { InjectionToken } from '@angular/core';
import { CrudRepository } from '../../../../core/data-access/crud-repository';
import { PortfolioItem, PortfolioItemPayload } from './portfolio.model';

export const PORTFOLIO_REPOSITORY = new InjectionToken<CrudRepository<PortfolioItem, PortfolioItemPayload>>(
  'PORTFOLIO_REPOSITORY',
);
