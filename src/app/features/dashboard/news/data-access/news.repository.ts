import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { NewsArticle, NewsArticlePayload, NewsCategory, NewsImage, NewsListRequest } from './news.model';

export interface NewsRepository {
  list(request: NewsListRequest): Observable<PageResult<NewsArticle>>;
  getById(id: EntityId): Observable<NewsArticle>;
  create(payload: NewsArticlePayload): Observable<NewsArticle>;
  update(id: EntityId, payload: NewsArticlePayload): Observable<NewsArticle>;
  remove(id: EntityId): Observable<void>;
  listCategories(): Observable<NewsCategory[]>;
  uploadImage(file: File, type: 'featured' | 'editor'): Observable<NewsImage>;
}

export const NEWS_REPOSITORY = new InjectionToken<NewsRepository>('NEWS_REPOSITORY');
