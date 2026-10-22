export type CounterKey =
  | 'clients_served'
  | 'campaigns_launched'
  | 'social_content_published'
  | 'industries_covered'
  | 'marketing_experts';

export interface WebsiteCounter {
  id: number;
  key: CounterKey;
  label: string;
  value: number;
  order: number;
}

export type CounterValues = Record<CounterKey, number>;

export const EMPTY_COUNTER_VALUES: CounterValues = {
  clients_served: 0,
  campaigns_launched: 0,
  social_content_published: 0,
  industries_covered: 0,
  marketing_experts: 0,
};
