import { EntityId } from '../../../../core/data-access/crud-repository';

export type NewsStatus = 'draft' | 'published';

export interface NewsCategory {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  parentId: number | null;
  parent?: Pick<NewsCategory, 'id' | 'slug' | 'nameAr' | 'nameEn'> | null;
  children: NewsCategory[];
}

export interface NewsImage { id: number; url: string; }

export interface NewsArticle {
  id: EntityId;
  slug: string | null;
  status: NewsStatus;
  titleAr: string;
  titleEn: string;
  authorNameAr: string;
  authorNameEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  contentAr: string;
  contentEn: string;
  categoryId: number;
  category: NewsCategory | null;
  featuredImageId: number | null;
  featuredImageUrl: string;
  editorImages: NewsImage[];
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface NewsArticlePayload {
  titleAr: string;
  titleEn: string;
  authorNameAr: string;
  authorNameEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  contentAr: string;
  contentEn: string;
  categoryId: number;
  featuredImageId?: number | null;
  status: NewsStatus;
}

export interface NewsListRequest {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: number;
  status?: NewsStatus;
}
