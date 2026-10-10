import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { CrudRepository, EntityId } from '../../../../core/data-access/crud-repository';
import { BlogPost, BlogPostPayload } from './blog.model';

@Injectable({ providedIn: 'root' })
export class BlogMockRepository implements CrudRepository<BlogPost, BlogPostPayload> {
  private posts: BlogPost[] = [
    { id: 1, title: 'How to Build a Better Brand Story', excerpt: 'Practical ways to make your brand voice memorable...', category: 'Marketing', status: 'Published', content: 'Practical ways to make your brand voice memorable and connect with your audience.' },
    { id: 2, title: 'Creative Planning for a New Campaign', excerpt: 'A simple framework for planning better creative work...', category: 'Business', status: 'Draft', content: 'A simple framework for planning better creative work and campaigns.' },
    { id: 3, title: 'Design Trends Worth Watching', excerpt: 'The visual trends shaping digital experiences...', category: 'Culture', status: 'Published', content: 'The visual trends shaping digital experiences and brand communication.' },
  ];

  list(): Observable<BlogPost[]> { return of([...this.posts]); }
  getById(id: EntityId): Observable<BlogPost> {
    const post = this.posts.find((item) => item.id === id);
    return post ? of(post) : throwError(() => new Error('Blog post not found.'));
  }
  create(payload: BlogPostPayload): Observable<BlogPost> {
    const post: BlogPost = { ...payload, id: Date.now(), excerpt: this.makeExcerpt(payload.content) };
    this.posts = [post, ...this.posts];
    return of(post);
  }
  update(id: EntityId, payload: BlogPostPayload): Observable<BlogPost> {
    const index = this.posts.findIndex((item) => item.id === id);
    if (index < 0) return throwError(() => new Error('Blog post not found.'));
    const post = { ...this.posts[index], ...payload, excerpt: this.makeExcerpt(payload.content) };
    this.posts = this.posts.map((item) => item.id === id ? post : item);
    return of(post);
  }
  remove(id: EntityId): Observable<void> { this.posts = this.posts.filter((post) => post.id !== id); return of(void 0); }
  private makeExcerpt(content: string): string { return content.length > 52 ? `${content.slice(0, 52)}...` : content; }
}
