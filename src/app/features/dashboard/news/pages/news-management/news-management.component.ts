import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { AuthService } from '../../../../../core/auth/auth.service';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { NewsFacade } from '../../data-access/news.facade';
import { NewsArticle, NewsCategory, NewsStatus } from '../../data-access/news.model';

@Component({
  selector: 'app-news-management',
  imports: [FormsModule, RouterLink, Select, PaginationComponent],
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.scss',
})
export class NewsManagementComponent implements OnInit {
  private readonly facade = inject(NewsFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly status = signal<NewsStatus | null>(null);
  protected readonly categoryId = signal<number | null>(null);
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly articles = this.facade.articles;
  protected readonly totalRecords = this.facade.totalRecords;
  protected readonly canDelete = () => this.auth.canDeleteContent();
  protected readonly statusOptions = [
    { label: 'All statuses', value: null },
    { label: 'Published', value: 'published' },
    { label: 'Draft', value: 'draft' },
  ];
  protected readonly categoryOptions = computed(() => [
    { label: 'All categories', value: null },
    ...this.flattenCategories(this.facade.categories()).map((category) => ({
      label: category.parent ? `${category.parent.nameEn} / ${category.nameEn}` : category.nameEn,
      value: category.id,
    })),
  ]);

  ngOnInit(): void {
    this.header.showNewsList();
    this.facade.loadCategories().subscribe();
    this.loadPage(1);
  }

  protected addNews(): void { void this.router.navigateByUrl('/dashboard/news/new'); }
  protected setQuery(query: string): void { this.query.set(query); this.loadPage(1); }
  protected setStatus(status: NewsStatus | null): void { this.status.set(status); this.loadPage(1); }
  protected setCategory(categoryId: number | null): void { this.categoryId.set(categoryId); this.loadPage(1); }
  protected changePage(page: number): void { if (Number.isInteger(page) && page > 0) this.loadPage(page); }

  protected title(article: NewsArticle): string { return article.titleEn || article.titleAr || 'Untitled draft'; }
  protected summary(article: NewsArticle): string { return article.shortDescriptionEn || article.shortDescriptionAr || 'No description yet.'; }
  protected categoryName(article: NewsArticle): string {
    if (!article.category) return '—';
    return article.category.parent ? `${article.category.parent.nameEn} / ${article.category.nameEn}` : article.category.nameEn;
  }

  protected deleteArticle(article: NewsArticle): void {
    if (!this.auth.canDeleteContent()) return;
    this.confirmation.confirm({
      header: 'Delete news article?', message: `“${this.title(article)}” will be permanently deleted.`,
      acceptLabel: 'Delete', rejectLabel: 'Cancel', acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.facade.remove(article.id).subscribe({
        next: () => { this.loadPage(1); this.messages.add({ severity: 'success', summary: 'Article deleted', detail: 'The news article has been deleted successfully.', life: 3500 }); },
      }),
    });
  }

  private loadPage(page: number): void {
    this.page.set(page);
    this.facade.load({ page, pageSize: this.pageSize, search: this.query(), categoryId: this.categoryId() ?? undefined, status: this.status() ?? undefined }).subscribe();
  }

  private flattenCategories(categories: NewsCategory[]): NewsCategory[] {
    return categories.flatMap((category) => category.children.length ? category.children : [category]);
  }
}
