import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { NewsFacade } from '../../data-access/news.facade';
import {
  ArticleStatus,
  NEWS_CATEGORIES,
  NewsArticle,
  NewsCategory,
} from '../../data-access/news.model';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-news-management',
  imports: [FormsModule, RouterLink, Select, PaginationComponent],
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.scss',
})
export class NewsManagementComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly facade = inject(NewsFacade);
  private readonly auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly status = signal<'All' | ArticleStatus>('All');
  protected readonly category = signal<'All' | NewsCategory>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Published', value: 'Published' },
    { label: 'Draft', value: 'Draft' },
  ];
  protected readonly categoryOptions = [
    { label: 'All Categories', value: 'All' },
    ...NEWS_CATEGORIES.map((category) => ({ label: category, value: category })),
  ];
  protected readonly articles = this.facade.articles;
  protected readonly canDelete = () => this.auth.hasRole('admin');

  protected readonly filteredArticles = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    const category = this.category();

    return this.articles().filter(
      (article) =>
        (!query || this.articleTitle(article).toLowerCase().includes(query)) &&
        (status === 'All' || article.status === status) &&
        (category === 'All' || article.category === category),
    );
  });
  protected readonly paginatedArticles = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredArticles().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.header.showNewsList();
    this.facade.load().subscribe();
  }

  protected addNews(): void {
    this.router.navigateByUrl('/dashboard/news/new');
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }

  protected articleTitle(article: NewsArticle): string {
    return article.isArabic
      ? (article.arabicTitle ?? article.title ?? '')
      : (article.title ?? article.arabicTitle ?? '');
  }

  protected setStatus(status: 'All' | ArticleStatus): void {
    this.status.set(status);
    this.page.set(1);
  }

  protected setCategory(category: 'All' | NewsCategory): void {
    this.category.set(category);
    this.page.set(1);
  }

  protected changePage(page: number): void {
    this.page.set(page);
  }

  protected deleteArticle(article: NewsArticle): void {
    if (!this.auth.hasRole('admin')) return;
    this.confirmation.confirm({
      header: 'Delete news article?',
      message: `“${article.title}” will be permanently deleted.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(article.id).subscribe({
          next: () => {
            this.page.set(1);
            this.messages.add({
              severity: 'success',
              summary: 'Article deleted',
              detail: 'The news article has been deleted successfully.',
              life: 3500,
            });
          },
        });
      },
    });
  }
}
