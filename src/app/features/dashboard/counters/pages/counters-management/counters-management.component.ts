import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MessageService } from 'primeng/api';
import { DashboardHeaderService } from '../../../layout/dashboard-header.service';
import { CountersFacade } from '../../data-access/counters.facade';
import { CounterKey, CounterValues } from '../../data-access/counter.model';

@Component({
  selector: 'app-counters-management',
  imports: [DecimalPipe],
  templateUrl: './counters-management.component.html',
  styleUrl: './counters-management.component.scss',
})
export class CountersManagementComponent implements OnInit {
  private readonly facade = inject(CountersFacade);
  private readonly header = inject(DashboardHeaderService);
  private readonly messages = inject(MessageService);

  protected readonly counters = this.facade.counters;
  protected readonly editingKey = signal<CounterKey | null>(null);
  protected readonly values = signal<CounterValues>({ clients: 0, projects: 0, events: 0, awards: 0, campaigns: 0 });
  protected readonly hasChanges = computed(() =>
    this.counters().some((counter) => counter.value !== this.values()[counter.key]),
  );

  ngOnInit(): void {
    this.header.showCounters();
    this.facade.load().subscribe({
      next: (counters) => {
        this.values.set(
          counters.reduce<CounterValues>((result, counter) => ({ ...result, [counter.key]: counter.value }), {
            clients: 0,
            projects: 0,
            events: 0,
            awards: 0,
            campaigns: 0,
          }),
        );
      },
    });
  }

  protected startEditing(key: CounterKey): void {
    this.editingKey.set(key);
  }

  protected finishEditing(): void {
    this.editingKey.set(null);
  }

  protected setValue(key: CounterKey, rawValue: string): void {
    const value = Math.max(0, Math.trunc(Number(rawValue) || 0));
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  protected saveAll(): void {
    if (!this.hasChanges()) {
      return;
    }

    this.finishEditing();
    this.facade.save(this.values()).subscribe({
      next: () =>
        this.messages.add({
          severity: 'success',
          summary: 'Counters saved',
          detail: 'All homepage counters have been updated.',
          life: 3500,
        }),
    });
  }
}
