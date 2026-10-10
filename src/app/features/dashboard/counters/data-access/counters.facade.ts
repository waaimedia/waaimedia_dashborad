import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { CounterValues, WebsiteCounter } from './counter.model';
import { COUNTERS_REPOSITORY } from './counters.repository';

@Injectable({ providedIn: 'root' })
export class CountersFacade {
  private readonly repository = inject(COUNTERS_REPOSITORY);

  readonly counters = signal<WebsiteCounter[]>([]);
  readonly loading = signal(false);

  load() {
    this.loading.set(true);
    return this.repository.list().pipe(
      tap({
        next: (counters) => this.counters.set(counters),
        finalize: () => this.loading.set(false),
      }),
    );
  }

  save(values: CounterValues) {
    return this.repository.save(values).pipe(tap((counters) => this.counters.set(counters)));
  }
}
