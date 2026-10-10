import { Injectable } from '@angular/core';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { Observable, of, throwError } from 'rxjs';
import { NewsArticle, NewsArticlePayload } from './news.model';

@Injectable({ providedIn: 'root' })
export class NewsMockRepository implements CrudRepository<NewsArticle, NewsArticlePayload> {
  private articles: NewsArticle[] = [
    {
      id: 1,
      title: 'Breaking: New Technology Trends in 2024',
      excerpt: 'Latest insights on emerging technologies...',
      category: 'Technology',
      status: 'Published',
      content: 'Latest insights on emerging technologies.',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategies for Small Business',
      excerpt: 'Comprehensive guide to digital marketing...',
      category: 'Marketing',
      status: 'Draft',
      content: 'Comprehensive guide to digital marketing.',
    },
    {
      id: 3,
      title: 'The Future of Remote Work',
      excerpt: 'Exploring trends in remote work culture...',
      category: 'Business',
      status: 'Published',
      content: 'Exploring trends in remote work culture.',
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
      excerpt: this.makeExcerpt(payload.content),
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
      excerpt: this.makeExcerpt(payload.content),
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
