import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { NewsArticle, NewsArticlePayload, NewsCategory, NewsImage, NewsListRequest } from './news.model';
import { NEWS_REPOSITORY } from './news.repository';

@Injectable({ providedIn: 'root' })
export class NewsFacade {
  private readonly repository = inject(NEWS_REPOSITORY);
  readonly articles = signal<NewsArticle[]>([]);
  readonly totalRecords = signal(0);
  readonly categories = signal<NewsCategory[]>([]);
  readonly loading = signal(false);

  load(request: NewsListRequest) {
    this.loading.set(true);
    return this.repository.list(request).pipe(tap({ next: ({ items, totalRecords }) => { this.articles.set(items); this.totalRecords.set(totalRecords); }, finalize: () => this.loading.set(false) }));
  }

  loadCategories() { return this.repository.listCategories().pipe(tap((categories) => this.categories.set(categories))); }
  getById(id: EntityId) { return this.repository.getById(id); }
  create(payload: NewsArticlePayload): Observable<NewsArticle> { return this.repository.create(payload); }
  update(id: EntityId, payload: NewsArticlePayload): Observable<NewsArticle> { return this.repository.update(id, payload); }
  remove(id: EntityId) { return this.repository.remove(id); }
  uploadImage(file: File, type: 'featured' | 'editor'): Observable<NewsImage> { return this.repository.uploadImage(file, type); }
}
