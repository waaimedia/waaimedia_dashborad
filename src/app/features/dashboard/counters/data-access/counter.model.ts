export type CounterKey = 'clients' | 'projects' | 'events' | 'awards' | 'campaigns';

export interface WebsiteCounter {
  key: CounterKey;
  label: string;
  value: number;
}

export type CounterValues = Record<CounterKey, number>;
