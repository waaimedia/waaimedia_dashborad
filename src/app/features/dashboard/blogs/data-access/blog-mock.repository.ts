import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { BlogCategory, BlogImage, BlogListRequest, BlogPost, BlogPostPayload } from './blog.model';
import { BlogRepository } from './blog.repository';

/** Kept for isolated UI development; the application uses BlogApiRepository. */
@Injectable({ providedIn: 'root' })
export class BlogMockRepository implements BlogRepository {
  private posts: BlogPost[] = [];

  list(request: BlogListRequest): Observable<PageResult<BlogPost>> {
    const start = (request.page - 1) * request.pageSize;
    return of({ items: this.posts.slice(start, start + request.pageSize), totalRecords: this.posts.length });
  }
  getById(id: EntityId): Observable<BlogPost> {
    const post = this.posts.find((item) => item.id === id);
    return post ? of(post) : throwError(() => new Error('Blog post not found.'));
  }
  create(payload: BlogPostPayload): Observable<BlogPost> {
    const post = this.toPost(Date.now(), payload);
    this.posts = [post, ...this.posts];
    return of(post);
  }
  update(id: EntityId, payload: BlogPostPayload): Observable<BlogPost> {
    const index = this.posts.findIndex((item) => item.id === id);
    if (index < 0) return throwError(() => new Error('Blog post not found.'));
    const post = { ...this.posts[index], ...this.toPost(id, payload), status: this.posts[index].status };
    this.posts = this.posts.map((item) => item.id === id ? post : item);
    return of(post);
  }
  remove(id: EntityId): Observable<void> { this.posts = this.posts.filter((post) => post.id !== id); return of(void 0); }
  publish(id: EntityId): Observable<BlogPost> { return this.changeStatus(id, 'published'); }
  unpublish(id: EntityId): Observable<BlogPost> { return this.changeStatus(id, 'draft'); }
  listCategories(): Observable<BlogCategory[]> { return of([]); }
  uploadImage(file: File, _type: 'cover' | 'editor'): Observable<BlogImage> { return of({ id: Date.now(), url: URL.createObjectURL(file) }); }

  private changeStatus(id: EntityId, status: 'draft' | 'published'): Observable<BlogPost> {
    const post = this.posts.find((item) => item.id === id);
    if (!post) return throwError(() => new Error('Blog post not found.'));
    const updated = { ...post, status };
    this.posts = this.posts.map((item) => item.id === id ? updated : item);
    return of(updated);
  }

  private toPost(id: EntityId, payload: BlogPostPayload): BlogPost {
    return {
      id, slug: null, status: payload.status, titleAr: payload.titleAr, titleEn: payload.titleEn,
      authorNameAr: payload.authorNameAr, authorNameEn: payload.authorNameEn,
      shortDescriptionAr: payload.shortDescriptionAr, shortDescriptionEn: payload.shortDescriptionEn,
      contentAr: payload.contentAr, contentEn: payload.contentEn, categoryId: payload.categoryId,
      category: null, featuredImageId: payload.featuredImageId ?? null, featuredImageUrl: '', editorImages: [],
      publishedAt: null, createdAt: null, updatedAt: null,
    };
  }
}
