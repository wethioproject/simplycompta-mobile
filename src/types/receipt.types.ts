export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'check' | 'other';

export interface ReceiptItem {
  id: string;
  date: string;          
  amount: number;
  paymentMethod: PaymentMethod;
  note?: string;
  documentUrl?: string;
}

export type ReceiptFormData = {
  date: string;          
  amount: string;
  paymentMethod: PaymentMethod;
  note: string;
  document?: {
    uri: string;
    name: string;
    type: string;
    fileCopyUri?: string;
  } | null;
  removedExistingDocument?: boolean;
};

export const PAYMENT_METHODS: PaymentMethod[] = ['transfer', 'cash', 'card', 'check', 'other'];
