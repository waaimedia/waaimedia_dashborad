import { Injectable, inject, signal } from '@angular/core';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { tap } from 'rxjs';
import { NewsArticle, NewsArticlePayload } from './news.model';
import { NEWS_REPOSITORY } from './news.repository';

@Injectable({ providedIn: 'root' })
export class NewsFacade {
  private readonly repository = inject(NEWS_REPOSITORY);

  readonly articles = signal<NewsArticle[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (articles) => this.articles.set(articles),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  getById(id: EntityId) {
    return this.repository.getById(id);
  }

  create(payload: NewsArticlePayload) {
    return this.repository.create(payload).pipe(tap(() => this.load().subscribe()));
  }

  update(id: EntityId, payload: NewsArticlePayload) {
    return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe()));
  }

  remove(id: EntityId) {
    return this.repository.remove(id).pipe(tap(() => this.load().subscribe()));
  }
}
