import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { EntityId } from '../../../../core/data-access/crud-repository';
import { BlogPost, BlogPostPayload } from './blog.model';
import { BLOG_REPOSITORY } from './blog.repository';

@Injectable({ providedIn: 'root' })
export class BlogFacade {
  private readonly repository = inject(BLOG_REPOSITORY);
  readonly posts = signal<BlogPost[]>([]);
  readonly loading = signal(false);
  load() { this.loading.set(true); return this.repository.list().pipe(tap({ next: (posts) => this.posts.set(posts), finalize: () => this.loading.set(false) })); }
  getById(id: EntityId) { return this.repository.getById(id); }
  create(payload: BlogPostPayload) { return this.repository.create(payload).pipe(tap(() => this.load().subscribe())); }
  update(id: EntityId, payload: BlogPostPayload) { return this.repository.update(id, payload).pipe(tap(() => this.load().subscribe())); }
  remove(id: EntityId) { return this.repository.remove(id).pipe(tap(() => this.load().subscribe())); }
}
