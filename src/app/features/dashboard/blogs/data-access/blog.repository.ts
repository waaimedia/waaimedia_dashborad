import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { PageResult } from '../../../../core/data-access/pagination.model';
import { BlogCategory, BlogImage, BlogListRequest, BlogPost, BlogPostPayload } from './blog.model';

export interface BlogRepository {
  list(request: BlogListRequest): Observable<PageResult<BlogPost>>;
  getById(id: EntityId): Observable<BlogPost>;
  create(payload: BlogPostPayload): Observable<BlogPost>;
  update(id: EntityId, payload: BlogPostPayload): Observable<BlogPost>;
  remove(id: EntityId): Observable<void>;
  publish(id: EntityId): Observable<BlogPost>;
  unpublish(id: EntityId): Observable<BlogPost>;
  listCategories(): Observable<BlogCategory[]>;
  uploadImage(file: File, type: 'cover' | 'editor'): Observable<BlogImage>;
}

export const BLOG_REPOSITORY = new InjectionToken<BlogRepository>('BLOG_REPOSITORY');
