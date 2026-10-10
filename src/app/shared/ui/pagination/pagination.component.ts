import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly totalRecords = input.required<number>();
  readonly pageChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalRecords() / this.pageSize())));
  protected readonly firstRecord = computed(() => (this.totalRecords() ? (this.page() - 1) * this.pageSize() + 1 : 0));
  protected readonly lastRecord = computed(() => Math.min(this.page() * this.pageSize(), this.totalRecords()));
  protected readonly pages = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const start = Math.max(1, Math.min(current - 1, total - 2));
    const end = Math.min(total, start + 2);

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  });

  protected goTo(page: number): void {
    const nextPage = Math.min(Math.max(page, 1), this.totalPages());
    if (nextPage !== this.page()) {
      this.pageChange.emit(nextPage);
    }
  }
}
