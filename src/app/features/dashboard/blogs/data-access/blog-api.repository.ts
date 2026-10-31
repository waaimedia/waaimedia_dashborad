import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { BlogCategory, BlogImage, BlogListRequest, BlogPost, BlogPostPayload, BlogStatus } from './blog.model';
import { BlogRepository } from './blog.repository';

interface ApiCategory {
  id: number;
  slug?: string | null;
  name?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
  parent_id?: number | null;
  parent?: ApiCategory | null;
  children?: ApiCategory[];
}

interface ApiBlog {
  id: number;
  slug?: string | null;
  status: BlogStatus;
  title_ar?: string | null;
  title_en?: string | null;
  author_name_ar?: string | null;
  author_name_en?: string | null;
  short_description_ar?: string | null;
  short_description_en?: string | null;
  content_ar?: string | null;
  content_en?: string | null;
  category_id: number;
  category?: ApiCategory | null;
  featured_image_id?: number | null;
  featured_image_url?: string | null;
  editor_images?: Array<{ id: number; url: string }>;
  published_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

interface ApiResource<T> { data: T; }
interface ApiList<T> { data: T[]; meta?: { total?: number }; }

@Injectable({ providedIn: 'root' })
export class BlogApiRepository implements BlogRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/blogs`;

  list(request: BlogListRequest): Observable<PageResult<BlogPost>> {
    const params: Record<string, string | number> = { page: request.page, per_page: request.pageSize };
    if (request.search?.trim()) params['search'] = request.search.trim();
    if (request.categoryId) params['category_id'] = request.categoryId;
    if (request.status) params['status'] = request.status;
    return this.http.get<ApiList<ApiBlog>>(this.url, { params }).pipe(map(({ data, meta }) => ({
      items: data.map((post) => this.toPost(post)), totalRecords: meta?.total ?? data.length,
    })));
  }

  getById(id: EntityId): Observable<BlogPost> { return this.http.get<ApiResource<ApiBlog>>(`${this.url}/${id}`).pipe(map(({ data }) => this.toPost(data))); }
  create(payload: BlogPostPayload): Observable<BlogPost> { return this.http.post<ApiResource<ApiBlog>>(this.url, this.toRequestBody(payload, true)).pipe(map(({ data }) => this.toPost(data))); }
  update(id: EntityId, payload: BlogPostPayload): Observable<BlogPost> { return this.http.patch<ApiResource<ApiBlog>>(`${this.url}/${id}`, this.toRequestBody(payload, false)).pipe(map(({ data }) => this.toPost(data))); }
  remove(id: EntityId): Observable<void> { return this.http.delete(`${this.url}/${id}`).pipe(map(() => void 0)); }
  publish(id: EntityId): Observable<BlogPost> { return this.http.post<ApiResource<ApiBlog>>(`${this.url}/${id}/publish`, {}).pipe(map(({ data }) => this.toPost(data))); }
  unpublish(id: EntityId): Observable<BlogPost> { return this.http.post<ApiResource<ApiBlog>>(`${this.url}/${id}/unpublish`, {}).pipe(map(({ data }) => this.toPost(data))); }

  listCategories(): Observable<BlogCategory[]> {
    return this.http.get<ApiResource<ApiCategory[]>>(`${environment.apiUrl}/categories`, { params: { type: 'blogs' } })
      .pipe(map(({ data }) => data.map((category) => this.toCategory(category))));
  }

  uploadImage(file: File, type: 'cover' | 'editor'): Observable<BlogImage> {
    const body = new FormData();
    body.append('image', file);
    body.append('type', type);
    return this.http.post<ApiResource<BlogImage>>(`${this.url}/images`, body).pipe(map(({ data }) => data));
  }

  private toRequestBody(payload: BlogPostPayload, includeStatus: boolean): Record<string, string | number | null> {
    return {
      title_ar: payload.titleAr.trim() || null, title_en: payload.titleEn.trim() || null,
      author_name_ar: payload.authorNameAr.trim() || null, author_name_en: payload.authorNameEn.trim() || null,
      short_description_ar: payload.shortDescriptionAr.trim() || null, short_description_en: payload.shortDescriptionEn.trim() || null,
      content_ar: payload.contentAr.trim() || null, content_en: payload.contentEn.trim() || null,
      category_id: payload.categoryId,
      ...(includeStatus ? { status: payload.status } : {}),
      ...(payload.featuredImageId !== undefined ? { featured_image_id: payload.featuredImageId } : {}),
    };
  }

  private toPost(post: ApiBlog): BlogPost {
    return {
      id: post.id, slug: post.slug ?? null, status: post.status,
      titleAr: post.title_ar ?? '', titleEn: post.title_en ?? '', authorNameAr: post.author_name_ar ?? '', authorNameEn: post.author_name_en ?? '',
      shortDescriptionAr: post.short_description_ar ?? '', shortDescriptionEn: post.short_description_en ?? '', contentAr: post.content_ar ?? '', contentEn: post.content_en ?? '',
      categoryId: post.category_id, category: post.category ? this.toCategory(post.category) : null,
      featuredImageId: post.featured_image_id ?? null, featuredImageUrl: post.featured_image_url ?? '', editorImages: post.editor_images ?? [],
      publishedAt: post.published_at ?? null, createdAt: post.created_at ?? null, updatedAt: post.updated_at ?? null,
    };
  }

  private toCategory(category: ApiCategory): BlogCategory {
    const localizedName = category.name ?? '';
    return {
      id: category.id, slug: category.slug ?? '', nameAr: category.name_ar ?? localizedName, nameEn: category.name_en ?? localizedName,
      parentId: category.parent_id ?? null, parent: category.parent ? this.toCategory(category.parent) : null,
      children: (category.children ?? []).map((child) => this.toCategory(child)),
    };
  }
}
