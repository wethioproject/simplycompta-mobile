// ─── Invoice types ───────────────────────────────────────────────────────────

export type StackNavigation = any;

export interface Account {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
}

export interface InvoiceArticle {
  id: number;
  invoice_id: number;
  designation: string;
  unit_price_ht: string;
  quantity: number;
  total_price_ht: string;
  tva_percentage: string;
}

export interface InvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number: string;
  payment_method: string;
  status: string;
  review_status: string;
  document_path: string | null;
  invoice_url: string | null;
  client: { id: number; client_name: string } | null;
  articles: InvoiceArticle[];
  notes?: string | null;
}

export interface Article {
  designation: string;
  unitPriceHT: number;
  quantity: number;
  totalHT: number;
  tva: number;
}

export interface InvoiceFormValues {
  invoiceNumber: string;
  date: string;
  clientId: number;
  accountId: number;
  status: string;
  articles: Article[];
  notes: string;
}

export type InvoiceTabType = 'Tous' | 'Quotes' | 'Issued' | 'Paid' | 'Cancelled';

export const INVOICE_TABS: InvoiceTabType[] = ['Tous', 'Quotes', 'Issued', 'Paid', 'Cancelled'];
export const STATUT_OPTIONS = ['Quotes', 'Issued', 'Paid', 'Cancelled'];
