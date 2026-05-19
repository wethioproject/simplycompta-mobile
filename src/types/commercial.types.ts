export interface Salesperson {
  id: number;
  customer_id?: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  active: boolean;
}

export interface CommercialSummary {
  total_quotes: number;
  accepted_quotes: number;
  rejected_quotes: number;
  pending_quotes: number;
  conversion_rate: number;
  total_invoiced_amount: number;
  total_paid_amount: number;
  unpaid_amount: number;
  average_quote_value: number;
  invoices_generated: number;
}

export interface CommercialRankingItem {
  commercial_id: number;
  name: string;
  revenue: number;
  quotes: number;
  conversion_rate: number;
}

export interface CommercialTopClient {
  id: number;
  name: string;
  revenue: number;
}

export interface CommercialTrendItem {
  month: number;
  revenue: number;
  quotes: number;
}

export interface CommercialStatsData {
  filters: {
    year: number;
    month: number | null;
    commercial_id: number | null;
  };
  summary: CommercialSummary;
  ranking: CommercialRankingItem[];
  top_clients: CommercialTopClient[];
  monthly_trend: CommercialTrendItem[];
  insights: {
    best_commercial?: CommercialRankingItem | null;
    highest_conversion?: CommercialRankingItem | null;
    quotes_waiting_follow_up?: number;
  };
}

export interface CommercialStatsParams {
  month?: number;
  year?: number;
  commercial_id?: number | null;
}
