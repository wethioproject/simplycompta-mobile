import * as yup from 'yup';

// ─── Client entity ────────────────────────────────────────────────────────────

export interface ClientItem {
  id: number;
  customer_id?: number;
  company_name: string;
  client_name: string;
  email: string;
  telephone: string;
  postal_code: string;
  city: string;
  commercial_register: string;
  ice: string;
  total_revenue_ht?: number;
  late_invoices_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ─── Invoice entity used in AccountStatement ─────────────────────────────────

export interface ClientInvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number: string;
  payment_method: string;
  status: string;
  review_status: string | null;
  notes: string | null;
  document_path: string | null;
  invoice_url: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Create / Edit form ───────────────────────────────────────────────────────

export type ClientFormValues = {
  companyName: string;
  clientName: string;
  email: string;
  telephone?: string;
  postalCode?: string;
  city?: string;
  commercialRegister?: string;
  ice?: string;
  customerType?: string;
  notes?: string;
};

export const clientSchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  clientName: yup.string().required('Client name is required'),
  email: yup
    .string()
    .test(
      'email-format',
      'Invalid email address',
      v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    )
    .optional(),
  telephone: yup.string().optional(),
  postalCode: yup.string().optional(),
  city: yup.string().optional(),
  commercialRegister: yup.string().optional(),
  ice: yup.string().optional(),
  customerType: yup.string().optional(),
  notes: yup.string().optional(),
});
