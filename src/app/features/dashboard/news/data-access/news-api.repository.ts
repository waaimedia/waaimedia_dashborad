import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { NewsArticle, NewsArticlePayload, NewsCategory, NewsImage, NewsListRequest, NewsStatus } from './news.model';
import { NewsRepository } from './news.repository';

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
interface ApiNews {
  id: number; slug?: string | null; status: NewsStatus;
  title_ar?: string | null; title_en?: string | null; author_name_ar?: string | null; author_name_en?: string | null;
  short_description_ar?: string | null; short_description_en?: string | null; content_ar?: string | null; content_en?: string | null;
  category_id: number; category?: ApiCategory | null; featured_image_id?: number | null; featured_image_url?: string | null;
  editor_images?: Array<{ id: number; url: string }>; published_at?: string | null; created_at?: string | null; updated_at?: string | null;
}
interface ApiResource<T> { data: T; }
interface ApiList<T> { data: T[]; meta?: { total?: number }; }

@Injectable({ providedIn: 'root' })
export class NewsApiRepository implements NewsRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/news`;

  list(request: NewsListRequest): Observable<PageResult<NewsArticle>> {
    const params: Record<string, string | number> = { page: request.page, per_page: request.pageSize };
    if (request.search?.trim()) params['search'] = request.search.trim();
    if (request.categoryId) params['category_id'] = request.categoryId;
    if (request.status) params['status'] = request.status;
    return this.http.get<ApiList<ApiNews>>(this.url, { params }).pipe(map(({ data, meta }) => ({
      items: data.map((article) => this.toArticle(article)), totalRecords: meta?.total ?? data.length,
    })));
  }

  getById(id: EntityId): Observable<NewsArticle> { return this.http.get<ApiResource<ApiNews>>(`${this.url}/${id}`).pipe(map(({ data }) => this.toArticle(data))); }
  create(payload: NewsArticlePayload): Observable<NewsArticle> { return this.http.post<ApiResource<ApiNews>>(this.url, this.toRequestBody(payload)).pipe(map(({ data }) => this.toArticle(data))); }
  update(id: EntityId, payload: NewsArticlePayload): Observable<NewsArticle> { return this.http.patch<ApiResource<ApiNews>>(`${this.url}/${id}`, this.toRequestBody(payload)).pipe(map(({ data }) => this.toArticle(data))); }
  remove(id: EntityId): Observable<void> { return this.http.delete<void>(`${this.url}/${id}`); }

  listCategories(): Observable<NewsCategory[]> {
    return this.http.get<ApiResource<ApiCategory[]>>(`${environment.apiUrl}/categories`, { params: { type: 'news' } }).pipe(map(({ data }) => data.map((category) => this.toCategory(category))));
  }

  uploadImage(file: File, type: 'featured' | 'editor'): Observable<NewsImage> {
    const body = new FormData(); body.append('image', file); body.append('type', type);
    return this.http.post<ApiResource<NewsImage>>(`${this.url}/images`, body).pipe(map(({ data }) => data));
  }

  private toRequestBody(payload: NewsArticlePayload): Record<string, string | number | null> {
    return {
      title_ar: payload.titleAr.trim() || null, title_en: payload.titleEn.trim() || null,
      author_name_ar: payload.authorNameAr.trim() || null, author_name_en: payload.authorNameEn.trim() || null,
      short_description_ar: payload.shortDescriptionAr.trim() || null, short_description_en: payload.shortDescriptionEn.trim() || null,
      content_ar: payload.contentAr.trim() || null, content_en: payload.contentEn.trim() || null,
      category_id: payload.categoryId, status: payload.status,
      ...(payload.featuredImageId !== undefined ? { featured_image_id: payload.featuredImageId } : {}),
    };
  }

  private toArticle(article: ApiNews): NewsArticle {
    return {
      id: article.id, slug: article.slug ?? null, status: article.status,
      titleAr: article.title_ar ?? '', titleEn: article.title_en ?? '', authorNameAr: article.author_name_ar ?? '', authorNameEn: article.author_name_en ?? '',
      shortDescriptionAr: article.short_description_ar ?? '', shortDescriptionEn: article.short_description_en ?? '', contentAr: article.content_ar ?? '', contentEn: article.content_en ?? '',
      categoryId: article.category_id, category: article.category ? this.toCategory(article.category) : null,
      featuredImageId: article.featured_image_id ?? null, featuredImageUrl: article.featured_image_url ?? '', editorImages: article.editor_images ?? [],
      publishedAt: article.published_at ?? null, createdAt: article.created_at ?? null, updatedAt: article.updated_at ?? null,
    };
  }

  private toCategory(category: ApiCategory): NewsCategory {
    const localizedName = category.name ?? '';
    return {
      id: category.id, slug: category.slug ?? '', nameAr: category.name_ar ?? localizedName, nameEn: category.name_en ?? localizedName,
      parentId: category.parent_id ?? null, parent: category.parent ? this.toCategory(category.parent) : null,
      children: (category.children ?? []).map((child) => this.toCategory(child)),
    };
  }
}
