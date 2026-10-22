import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CounterKey, CounterValues, WebsiteCounter } from './counter.model';
import { CountersRepository, CountersSaveResult } from './counters.repository';

interface ApiCounter {
  id: number;
  key: CounterKey;
  name: string;
  value: number;
  order: number;
}

interface CountersResponse {
  data: ApiCounter[];
}

interface UpdateCountersResponse extends CountersResponse {
  message: string;
}

@Injectable({ providedIn: 'root' })
export class CountersApiRepository implements CountersRepository {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/admin/counters`;

  list(): Observable<WebsiteCounter[]> {
    return this.http.get<CountersResponse>(this.url).pipe(map(({ data }) => this.toCounters(data)));
  }

  save(values: CounterValues): Observable<CountersSaveResult> {
    const counters = Object.entries(values).map(([key, value]) => ({
      key: key as CounterKey,
      value,
    }));

    return this.http.put<UpdateCountersResponse>(this.url, { counters }).pipe(
      map(({ message, data }) => ({ message, counters: this.toCounters(data) })),
    );
  }

  private toCounters(counters: ApiCounter[]): WebsiteCounter[] {
    return counters
      .map(({ id, key, name, value, order }) => ({ id, key, label: name, value, order }))
      .sort((first, second) => first.order - second.order);
  }
}
