import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { BlogFacade } from '../../data-access/blog.facade';
import { BlogPost, BlogStatus } from '../../data-access/blog.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({ selector: 'app-blogs-management', imports: [FormsModule, RouterLink, Select, PaginationComponent], templateUrl: './blogs-management.component.html', styleUrl: './blogs-management.component.scss' })
export class BlogsManagementComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly facade = inject(BlogFacade);
  private readonly auth = inject(AuthService);
  protected readonly query = signal('');
  protected readonly status = signal<'All' | BlogStatus>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly statusOptions = [{ label: 'All Status', value: 'All' }, { label: 'Published', value: 'Published' }, { label: 'Draft', value: 'Draft' }];
  protected readonly posts = this.facade.posts;
  protected readonly canDelete = () => this.auth.canDeleteContent();
  protected readonly filteredPosts = computed(() => {
    const query = this.query().trim().toLowerCase(); const status = this.status();
    return this.posts().filter((post) => (!query || post.title.toLowerCase().includes(query)) && (status === 'All' || post.status === status));
  });
  protected readonly paginatedPosts = computed(() => { const start = (this.page() - 1) * this.pageSize; return this.filteredPosts().slice(start, start + this.pageSize); });
  ngOnInit(): void { this.header.showBlogsList(); this.facade.load().subscribe(); }
  protected addBlog(): void { this.router.navigateByUrl('/dashboard/blogs/new'); }
  protected setQuery(query: string): void { this.query.set(query); this.page.set(1); }
  protected setStatus(status: 'All' | BlogStatus): void { this.status.set(status); this.page.set(1); }
  protected changePage(page: number): void { this.page.set(page); }
  protected deletePost(post: BlogPost): void {
    if (!this.auth.canDeleteContent()) return;
    this.confirmation.confirm({ header: 'Delete blog post?', message: `“${post.title}” will be permanently deleted.`, acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptButtonStyleClass: 'p-button-danger', accept: () => this.facade.remove(post.id).subscribe({ next: () => { this.page.set(1); this.messages.add({ severity: 'success', summary: 'Blog post deleted', detail: 'The blog post has been deleted successfully.', life: 3500 }); } }) });
  }
}
