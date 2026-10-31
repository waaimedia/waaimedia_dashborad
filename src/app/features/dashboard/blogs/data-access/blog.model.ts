import { EntityId } from '../../../../core/data-access/crud-repository';

export type BlogStatus = 'draft' | 'published';

export interface BlogCategory {
  id: number;
  slug: string;
  nameAr: string;
  nameEn: string;
  parentId: number | null;
  parent?: Pick<BlogCategory, 'id' | 'slug' | 'nameAr' | 'nameEn'> | null;
  children: BlogCategory[];
}

export interface BlogImage { id: number; url: string; }

export interface BlogPost {
  id: EntityId;
  slug: string | null;
  status: BlogStatus;
  titleAr: string;
  titleEn: string;
  authorNameAr: string;
  authorNameEn: string;
  shortDescriptionAr: string;
  shortDescriptionEn: string;
  contentAr: string;
  contentEn: string;
  categoryId: number;
  category: BlogCategory | null;
  featuredImageId: number | null;
  featuredImageUrl: string;
  editorImages: BlogImage[];
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface BlogPostPayload {
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
  status: BlogStatus;
}

export interface BlogListRequest {
  page: number;
  pageSize: number;
  search?: string;
  categoryId?: number;
  status?: BlogStatus;
}
