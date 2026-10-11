import { EntityId } from '../../../../core/data-access/crud-repository';

export type PortfolioStatus = 'Published' | 'Draft';

export interface PortfolioItem {
  id: EntityId;
  title: string;
  category: string;
  status: PortfolioStatus;
  linkOne?: string;
  linkTwo?: string;
  imageName?: string;
}

export interface PortfolioItemPayload {
  title: string;
  category: string;
  status: PortfolioStatus;
  linkOne?: string;
  linkTwo?: string;
  imageName?: string;
}
