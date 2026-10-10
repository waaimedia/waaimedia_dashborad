import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CounterValues, WebsiteCounter } from './counter.model';
import { CountersRepository } from './counters.repository';

@Injectable({ providedIn: 'root' })
export class CountersMockRepository implements CountersRepository {
  private counters: WebsiteCounter[] = [
    { key: 'clients', label: 'Clients', value: 1250 },
    { key: 'projects', label: 'Projects', value: 850 },
    { key: 'events', label: 'Events', value: 475 },
    { key: 'awards', label: 'Awards', value: 125 },
    { key: 'campaigns', label: 'Campaigns', value: 2100 },
  ];

  list(): Observable<WebsiteCounter[]> {
    return of([...this.counters]);
  }

  save(values: CounterValues): Observable<WebsiteCounter[]> {
    this.counters = this.counters.map((counter) => ({ ...counter, value: values[counter.key] }));
    return of([...this.counters]);
  }
}
