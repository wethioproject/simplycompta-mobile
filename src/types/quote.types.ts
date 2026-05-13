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
  invoice_id?: number;
  quotes_id?: number;
  designation: string;
  unit_price_ht: string;
  quantity: number;
  total_price_ht: string;
  tva_percentage: string | number;
  product_id?: number;
}

export interface InvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number?: string;
  quote_number?: string;
  payment_method: string;
  status: string;
  review_status?: string | null;
  document_path?: string | null;
  invoice_url?: string | null;
  valid_until?: string | null;
  due_date?: string | null;
  client?: { id: number; client_name: string } | null;
  articles: InvoiceArticle[];
  notes?: string | null;
  total_ttc: number;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  designation: string;
  unitPriceHT: number;
  quantity: number;
  totalHT: number;
  tva: number | null;
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
export const STATUT_OPTIONS = [
  { key: 'draft',    fr: 'Brouillon',  en: 'Draft' },
  { key: 'sent',     fr: 'Envoyé',     en: 'Sent' },
  { key: 'accepted', fr: 'Accepté',    en: 'Accepted' },
  { key: 'rejected', fr: 'Rejeté',     en: 'Rejected' },
  { key: 'expired',  fr: 'Expiré',     en: 'Expired' },
] as const;

/** Resolves a status key (e.g. "draft") to a display label. */
export const resolveStatus = (key: string | null | undefined, locale: string): string => {
  if (!key) return '—';
  const match = STATUT_OPTIONS.find(s => s.key === key);
  if (!match) return key;
  return locale.startsWith('fr') ? match.fr : match.en;
};

export const PAYMENT_METHODS = [
  { key: 'cash',             fr: 'Espèces',                   en: 'Cash' },
  { key: 'bank transfer',    fr: 'Virement bancaire',          en: 'Bank Transfer' },
  { key: 'card',             fr: 'Carte bancaire',             en: 'Credit / Debit Card' },
  { key: 'cheque',           fr: 'Chèque',                     en: 'Cheque' },
  { key: 'mobile payment',   fr: 'Paiement mobile',            en: 'Mobile Payment' },
  { key: 'online payment',   fr: 'Paiement en ligne',          en: 'Online Payment' },
  { key: 'direct debit',     fr: 'Prélèvement automatique',    en: 'Direct Debit' },
  { key: 'deferred',         fr: 'Paiement différé',           en: 'Deferred Payment' },
  { key: 'instant transfer', fr: 'Virement instantané',        en: 'Instant Bank Transfer' },
  { key: 'other',            fr: 'Autre',                      en: 'Other' },
] as const;

/** Resolves a payment_method key (e.g. "mobile_payment") to a display label.
 *  Falls back to the raw key if not found (handles legacy / unknown values). */
export const resolvePaymentMethod = (key: string | null | undefined, locale: string): string => {
  if (!key) return '—';
  const match = PAYMENT_METHODS.find(p => p.key === key);
  if (!match) return key;
  return locale.startsWith('fr') ? match.fr : match.en;
};
