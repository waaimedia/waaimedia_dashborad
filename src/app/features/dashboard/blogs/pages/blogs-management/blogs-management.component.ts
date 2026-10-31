import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { AuthService } from '../../../../../core/auth/auth.service';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BlogFacade } from '../../data-access/blog.facade';
import { BlogCategory, BlogPost, BlogStatus } from '../../data-access/blog.model';

@Component({ selector: 'app-blogs-management', imports: [FormsModule, RouterLink, Select, PaginationComponent], templateUrl: './blogs-management.component.html', styleUrl: './blogs-management.component.scss' })
export class BlogsManagementComponent implements OnInit {
  private readonly facade = inject(BlogFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);
  protected readonly query = signal('');
  protected readonly status = signal<BlogStatus | null>(null);
  protected readonly categoryId = signal<number | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly posts = this.facade.posts;
  protected readonly totalRecords = this.facade.totalRecords;
  protected readonly canDelete = () => this.auth.canDeleteContent();
  protected readonly statusOptions = [{ label: 'All statuses', value: null }, { label: 'Published', value: 'published' }, { label: 'Draft', value: 'draft' }];
  protected readonly categoryOptions = computed(() => [{ label: 'All categories', value: null }, ...this.flattenCategories(this.facade.categories()).map((category) => ({ label: category.parent ? `${category.parent.nameEn} / ${category.nameEn}` : category.nameEn, value: category.id }))]);

  ngOnInit(): void { this.header.showBlogsList(); this.facade.loadCategories().subscribe(); this.loadPage(1); }
  protected addBlog(): void { void this.router.navigateByUrl('/dashboard/blogs/new'); }
  protected setQuery(query: string): void { this.query.set(query); this.loadPage(1); }
  protected setStatus(status: BlogStatus | null): void { this.status.set(status); this.loadPage(1); }
  protected setCategory(categoryId: number | null): void { this.categoryId.set(categoryId); this.loadPage(1); }
  protected changePage(page: number): void { if (Number.isInteger(page) && page > 0) this.loadPage(page); }
  protected title(post: BlogPost): string { return post.titleEn || post.titleAr || 'Untitled draft'; }
  protected summary(post: BlogPost): string { return post.shortDescriptionEn || post.shortDescriptionAr || 'No description yet.'; }
  protected categoryName(post: BlogPost): string { return !post.category ? '—' : post.category.parent ? `${post.category.parent.nameEn} / ${post.category.nameEn}` : post.category.nameEn; }
  protected deletePost(post: BlogPost): void {
    if (!this.auth.canDeleteContent()) return;
    this.confirmation.confirm({ header: 'Delete blog post?', message: `“${this.title(post)}” will be permanently deleted.`, acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptButtonStyleClass: 'p-button-danger', accept: () => this.facade.remove(post.id).subscribe({ next: () => { this.loadPage(1); this.messages.add({ severity: 'success', summary: 'Blog deleted', detail: 'The blog post has been deleted successfully.', life: 3500 }); } }) });
  }
  private loadPage(page: number): void { this.page.set(page); this.facade.load({ page, pageSize: this.pageSize, search: this.query(), categoryId: this.categoryId() ?? undefined, status: this.status() ?? undefined }).subscribe(); }
  private flattenCategories(categories: BlogCategory[]): BlogCategory[] { return categories.flatMap((category) => category.children.length ? category.children : [category]); }
}
