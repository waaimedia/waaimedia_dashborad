import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { BlogCategory, BlogImage, BlogListRequest, BlogPost, BlogPostPayload } from './blog.model';
import { BLOG_REPOSITORY } from './blog.repository';

@Injectable({ providedIn: 'root' })
export class BlogFacade {
  private readonly repository = inject(BLOG_REPOSITORY);
  readonly posts = signal<BlogPost[]>([]);
  readonly totalRecords = signal(0);
  readonly categories = signal<BlogCategory[]>([]);
  readonly loading = signal(false);

  load(request: BlogListRequest) {
    this.loading.set(true);
    return this.repository.list(request).pipe(tap({
      next: ({ items, totalRecords }) => { this.posts.set(items); this.totalRecords.set(totalRecords); },
      finalize: () => this.loading.set(false),
    }));
  }

  loadCategories() { return this.repository.listCategories().pipe(tap((categories) => this.categories.set(categories))); }
  getById(id: EntityId) { return this.repository.getById(id); }
  create(payload: BlogPostPayload): Observable<BlogPost> { return this.repository.create(payload); }
  update(id: EntityId, payload: BlogPostPayload): Observable<BlogPost> { return this.repository.update(id, payload); }
  remove(id: EntityId) { return this.repository.remove(id); }
  publish(id: EntityId) { return this.repository.publish(id); }
  unpublish(id: EntityId) { return this.repository.unpublish(id); }
  uploadImage(file: File, type: 'cover' | 'editor'): Observable<BlogImage> { return this.repository.uploadImage(file, type); }
}
