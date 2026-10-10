import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { CounterValues, WebsiteCounter } from './counter.model';

export interface CountersRepository {
  list(): Observable<WebsiteCounter[]>;
  save(values: CounterValues): Observable<WebsiteCounter[]>;
}

export const COUNTERS_REPOSITORY = new InjectionToken<CountersRepository>('COUNTERS_REPOSITORY');
