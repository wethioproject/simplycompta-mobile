export type ActivityFilter =
  | 'all'
  | 'invoices'
  | 'expenses'
  | 'ocr'
  | 'documents'
  | 'payments'
  | 'accountant';

export type ActivityBadge =
  | 'new'
  | 'urgent'
  | 'waiting'
  | 'completed'
  | 'ai_detected'
  | 'insight';

export interface MobileActivityAction {
  screen?: string;
  id?: number;
  filter?: ActivityFilter;
}

export interface MobileActivityEvent {
  id: string;
  type: string;
  source: string;
  source_id: number;
  title: string;
  description?: string | null;
  occurred_at: string;
  group_key: string;
  badge: ActivityBadge;
  badge_label: string;
  icon: string;
  amount?: number | null;
  currency?: string | null;
  metadata?: Record<string, unknown>;
  action?: MobileActivityAction | null;
}

export interface MobileActivityGroup {
  key: string;
  label: string;
  events: MobileActivityEvent[];
}

export interface MobileActivitySuggestion {
  id: string;
  type: ActivityBadge;
  title: string;
  action?: MobileActivityAction;
}

export interface MobileActivityFilterOption {
  key: ActivityFilter;
  label: string;
}

export interface MobileActivityPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
  has_more: boolean;
}

export interface MobileActivityData {
  events: MobileActivityEvent[];
  groups: MobileActivityGroup[];
  suggestions: MobileActivitySuggestion[];
  filters: MobileActivityFilterOption[];
  pagination: MobileActivityPagination;
}

export interface MobileActivityResponse {
  success: boolean;
  message: string;
  data: MobileActivityData;
}
