import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Select } from 'primeng/select';
import { PaginationComponent } from '../../../../../shared/ui/pagination/pagination.component';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { PortfolioFacade } from '../../data-access/portfolio.facade';
import { PortfolioItem, PortfolioStatus } from '../../data-access/portfolio.model';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-portfolio-management',
  imports: [FormsModule, RouterLink, Select, PaginationComponent],
  templateUrl: './portfolio-management.component.html',
  styleUrl: './portfolio-management.component.scss',
})
export class PortfolioManagementComponent implements OnInit {
  private readonly confirmation = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly header = inject(DashboardHeaderService);
  private readonly router = inject(Router);
  private readonly facade = inject(PortfolioFacade);
  private readonly auth = inject(AuthService);

  protected readonly query = signal('');
  protected readonly status = signal<'All' | PortfolioStatus>('All');
  protected readonly page = signal(1);
  protected readonly pageSize = 10;
  protected readonly statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Published', value: 'Published' },
    { label: 'Draft', value: 'Draft' },
  ];
  protected readonly items = this.facade.items;
  protected readonly canDelete = () => this.auth.canDeleteContent();
  protected readonly filteredItems = computed(() => {
    const query = this.query().trim().toLowerCase();
    const status = this.status();
    return this.items().filter((item) =>
      (!query || item.title.toLowerCase().includes(query)) && (status === 'All' || item.status === status),
    );
  });
  protected readonly paginatedItems = computed(() => {
    const start = (this.page() - 1) * this.pageSize;
    return this.filteredItems().slice(start, start + this.pageSize);
  });

  ngOnInit(): void {
    this.header.showPortfolioList();
    this.facade.load().subscribe();
  }

  protected addPortfolioItem(): void {
    this.router.navigateByUrl('/dashboard/portfolio/new');
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.page.set(1);
  }

  protected setStatus(status: 'All' | PortfolioStatus): void {
    this.status.set(status);
    this.page.set(1);
  }

  protected changePage(page: number): void {
    this.page.set(page);
  }

  protected deleteItem(item: PortfolioItem): void {
    if (!this.auth.canDeleteContent()) return;
    this.confirmation.confirm({
      header: 'Delete portfolio item?',
      message: `“${item.title}” will be permanently deleted.`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.facade.remove(item.id).subscribe({
          next: () => {
            this.page.set(1);
            this.messages.add({ severity: 'success', summary: 'Portfolio item deleted', detail: 'The portfolio item has been deleted successfully.', life: 3500 });
          },
        });
      },
    });
  }
}
