export interface Account {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Supplier {
  id: number;
  name: string;
  supplier_name?: string;
}

export interface ExpenseItem {
  id: number;
  customer_id: number;
  category_id: number;
  supplier_id: number;
  date: string;
  payment_method: string;
  file: string | null;
  file_url: string | null;
  ttc: string;
  tva: string;
  total_ttc: string;
  total_tva: string;
  notes: string | null;
  category: { id: number; name: string };
}

export type ExpenseFormValues = {
  date: string;
  amountTTC: string;
  amountTVA: string;
  accountId: string;
  categoryId: number;
  supplierId?: number | null;
};
