import { Injectable } from '@angular/core';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { Observable, of, throwError } from 'rxjs';
import { NewsArticle, NewsArticlePayload } from './news.model';

@Injectable({ providedIn: 'root' })
export class NewsMockRepository implements CrudRepository<NewsArticle, NewsArticlePayload> {
  private articles: NewsArticle[] = [
    {
      id: 1,
      title: 'Building Better Everyday Health Habits',
      excerpt: 'Simple, practical ways to support your health...',
      category: 'Health',
      status: 'Published',
      content: 'Simple, practical ways to support your health.',
    },
    {
      id: 2,
      title: 'Seasonal Food Trends Worth Trying',
      excerpt: 'A guide to the flavours defining this season...',
      category: 'Food',
      status: 'Draft',
      content: 'A guide to the flavours defining this season.',
    },
    {
      id: 3,
      title: 'New TV Shows to Add to Your Watchlist',
      excerpt: 'A selection of TV shows worth watching now...',
      category: 'Entertainment',
      subcategory: 'TV Shows',
      status: 'Published',
      content: 'A selection of TV shows worth watching now.',
    },
  ];

  list(): Observable<NewsArticle[]> {
    return of([...this.articles]);
  }

  getById(id: EntityId): Observable<NewsArticle> {
    const article = this.articles.find((item) => item.id === id);
    return article ? of(article) : throwError(() => new Error('News article not found.'));
  }

  create(payload: NewsArticlePayload): Observable<NewsArticle> {
    const article: NewsArticle = {
      ...payload,
      id: Date.now(),
      excerpt: this.makeExcerpt(
        payload.description ?? payload.arabicDescription ?? payload.content ?? payload.arabicContent ?? '',
      ),
    };
    this.articles = [article, ...this.articles];
    return of(article);
  }

  update(id: EntityId, payload: NewsArticlePayload): Observable<NewsArticle> {
    const index = this.articles.findIndex((item) => item.id === id);
    if (index < 0) {
      return throwError(() => new Error('News article not found.'));
    }

    const article: NewsArticle = {
      ...this.articles[index],
      ...payload,
      excerpt: this.makeExcerpt(
        payload.description ?? payload.arabicDescription ?? payload.content ?? payload.arabicContent ?? '',
      ),
    };
    this.articles = this.articles.map((item) => (item.id === id ? article : item));
    return of(article);
  }

  remove(id: EntityId): Observable<void> {
    this.articles = this.articles.filter((article) => article.id !== id);
    return of(void 0);
  }

  private makeExcerpt(content: string): string {
    return content.length > 52 ? `${content.slice(0, 52)}...` : content;
  }
}
