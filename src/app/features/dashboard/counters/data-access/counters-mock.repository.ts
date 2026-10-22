import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CounterValues, WebsiteCounter } from './counter.model';
import { CountersRepository, CountersSaveResult } from './counters.repository';

@Injectable({ providedIn: 'root' })
export class CountersMockRepository implements CountersRepository {
  private counters: WebsiteCounter[] = [
    { id: 1, key: 'clients_served', label: 'Clients Served', value: 15, order: 1 },
    { id: 2, key: 'campaigns_launched', label: 'Campaigns Launched', value: 400, order: 2 },
    { id: 3, key: 'social_content_published', label: 'Social Content Published', value: 2000, order: 3 },
    { id: 4, key: 'industries_covered', label: 'Industries Covered', value: 18, order: 4 },
    { id: 5, key: 'marketing_experts', label: 'Marketing Experts', value: 10, order: 5 },
  ];

  list(): Observable<WebsiteCounter[]> {
    return of([...this.counters]);
  }

  save(values: CounterValues): Observable<CountersSaveResult> {
    this.counters = this.counters.map((counter) => ({ ...counter, value: values[counter.key] }));
    return of({ message: 'Counters updated successfully.', counters: [...this.counters] });
  }
}
