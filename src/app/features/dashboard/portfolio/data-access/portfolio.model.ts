import { EntityId } from '../../../../core/data-access/crud-repository';

export type PortfolioStatus = 'published' | 'draft';
export type PortfolioKind = 'images' | 'images_with_url' | 'video_urls' | 'web_design';

export interface PortfolioMedia { id: number; imageUrl?: string | null; url?: string | null; sortOrder: number; }

export interface PortfolioItem {
  id: EntityId;
  slug: string;
  titleEn: string;
  titleAr?: string | null;
  status: PortfolioStatus;
  clientId: number;
  clientName: string;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number | null;
  subcategoryName?: string | null;
  kind: PortfolioKind;
  coverImageUrl?: string | null;
  linkOne?: string | null;
  linkTwo?: string | null;
  linkThree?: string | null;
  media: PortfolioMedia[];
  mediaCount: number;
}

export interface PortfolioMediaPayload { id?: number; image?: File; url?: string; }

export interface PortfolioItemPayload {
  clientId: number;
  categoryId: number;
  subcategoryId?: number | null;
  titleEn: string;
  titleAr?: string;
  status: PortfolioStatus;
  coverImage?: File;
  media?: PortfolioMediaPayload[];
  removeMediaIds?: number[];
  featuredImage?: File;
  linkOne?: string;
  linkTwo?: string;
  linkThree?: string;
  confirmMediaReset?: boolean;
}

export interface PortfolioCategoryChild { id: number; name: string; slug: string; parentId: number; kind?: PortfolioKind; inputs?: string[]; }
export interface PortfolioCategory { id: number; name: string; slug: string; kind?: PortfolioKind; inputs?: string[]; subcategories: PortfolioCategoryChild[]; }
export interface PortfolioClientOption { id: number; name: string; }
