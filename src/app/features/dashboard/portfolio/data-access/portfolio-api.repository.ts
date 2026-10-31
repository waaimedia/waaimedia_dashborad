import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PortfolioCategory, PortfolioCategoryChild, PortfolioClientOption, PortfolioItem, PortfolioItemPayload, PortfolioKind, PortfolioMedia, PortfolioStatus } from './portfolio.model';
import { PortfolioRepository } from './portfolio.repository';

interface ApiCategory { id: number; name: string; slug: string; parent_id?: number; kind?: PortfolioKind; inputs?: string[]; subcategories?: ApiCategory[]; }
interface ApiMedia { id: number; image_url: string | null; url: string | null; sort_order: number; }
interface ApiPortfolioItem {
  id: number; slug: string; title_en: string; title_ar: string | null; status: PortfolioStatus; client_id: number;
  client?: { id: number; name: string }; category: ApiCategory; subcategory: ApiCategory | null; kind: PortfolioKind;
  cover_image_url: string | null; link_1?: string | null; link_2?: string | null; link_3?: string | null; media?: ApiMedia[]; media_count?: number;
}
interface ApiResourceResponse<T> { data: T; }
interface ApiListResponse<T> { data: T[]; }

@Injectable({ providedIn: 'root' })
export class PortfolioApiRepository implements PortfolioRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/portfolio`;

  list(): Observable<PortfolioItem[]> {
    return this.http.get<ApiListResponse<ApiPortfolioItem>>(this.url, { params: { per_page: 100 } }).pipe(map(({ data }) => data.map((item) => this.toItem(item))));
  }

  getById(id: EntityId): Observable<PortfolioItem> {
    return this.http.get<ApiResourceResponse<ApiPortfolioItem>>(`${this.url}/${id}`).pipe(map(({ data }) => this.toItem(data)));
  }

  create(payload: PortfolioItemPayload): Observable<PortfolioItem> {
    return this.http.post<ApiResourceResponse<ApiPortfolioItem>>(this.url, this.toFormData(payload)).pipe(map(({ data }) => this.toItem(data)));
  }

  update(id: EntityId, payload: PortfolioItemPayload): Observable<PortfolioItem> {
    const body = this.toFormData(payload);
    body.append('_method', 'PATCH');
    return this.http.post<ApiResourceResponse<ApiPortfolioItem>>(`${this.url}/${id}`, body).pipe(map(({ data }) => this.toItem(data)));
  }

  remove(id: EntityId): Observable<void> { return this.http.delete(`${this.url}/${id}`).pipe(map(() => void 0)); }

  categories(): Observable<PortfolioCategory[]> {
    return this.http.get<ApiResourceResponse<ApiCategory[]>>(`${this.url}/categories`).pipe(map(({ data }) => data.map((category) => this.toCategory(category))));
  }

  clients(): Observable<PortfolioClientOption[]> {
    return this.http.get<ApiListResponse<{ id: number; name: string }>>(`${environment.apiUrl}/admin/clients`, { params: { per_page: 100 } }).pipe(map(({ data }) => data.map((client) => ({ id: client.id, name: client.name }))));
  }

  private toFormData(payload: PortfolioItemPayload): FormData {
    const body = new FormData();
    body.append('client_id', String(payload.clientId)); body.append('category_id', String(payload.categoryId));
    if (payload.subcategoryId) body.append('subcategory_id', String(payload.subcategoryId));
    body.append('title_en', payload.titleEn.trim()); if (payload.titleAr?.trim()) body.append('title_ar', payload.titleAr.trim()); body.append('status', payload.status);
    if (payload.coverImage) body.append('cover_image', payload.coverImage, payload.coverImage.name);
    if (payload.featuredImage) body.append('featured_image', payload.featuredImage, payload.featuredImage.name);
    this.appendText(body, 'link_1', payload.linkOne); this.appendText(body, 'link_2', payload.linkTwo); this.appendText(body, 'link_3', payload.linkThree);
    if (payload.confirmMediaReset) body.append('confirm_media_reset', 'true');
    payload.removeMediaIds?.forEach((id) => body.append('remove_media_ids[]', String(id)));
    payload.media?.forEach((media, index) => {
      if (media.id) body.append(`media[${index}][id]`, String(media.id));
      if (media.image) body.append(`media[${index}][image]`, media.image, media.image.name);
      if (media.url?.trim()) body.append(`media[${index}][url]`, media.url.trim());
    });
    return body;
  }

  private appendText(body: FormData, name: string, value?: string): void { if (value?.trim()) body.append(name, value.trim()); }

  private toCategory(category: ApiCategory): PortfolioCategory {
    return { id: category.id, name: category.name, slug: category.slug, kind: category.kind, inputs: category.inputs, subcategories: (category.subcategories ?? []).map((child): PortfolioCategoryChild => ({ id: child.id, name: child.name, slug: child.slug, parentId: child.parent_id ?? category.id, kind: child.kind, inputs: child.inputs })) };
  }

  private toItem(item: ApiPortfolioItem): PortfolioItem {
    return { id: item.id, slug: item.slug, titleEn: item.title_en, titleAr: item.title_ar, status: item.status, clientId: item.client_id, clientName: item.client?.name ?? 'Unknown client', categoryId: item.category.id, categoryName: item.category.name, subcategoryId: item.subcategory?.id, subcategoryName: item.subcategory?.name, kind: item.kind, coverImageUrl: item.cover_image_url, linkOne: item.link_1, linkTwo: item.link_2, linkThree: item.link_3, media: (item.media ?? []).map((media): PortfolioMedia => ({ id: media.id, imageUrl: media.image_url, url: media.url, sortOrder: media.sort_order })), mediaCount: item.media_count ?? item.media?.length ?? 0 };
  }
}
