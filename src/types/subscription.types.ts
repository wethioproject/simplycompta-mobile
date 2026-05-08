export interface SubscriptionUsageItem {
  used: number;
  limit: number | null;   
  remaining: number;      
}

export interface SubscriptionStorageItem {
  used_mb: number;
  limit_mb: number | null;
  remaining_mb: number;   
}

export interface SubscriptionItem {
  id: number;
  customer_id: number;
  mobile_user_plan_id: number;
  mobile_user_plan_price_id: number;
  referral_code_id?: number | null;
  billing_cycle: string;
  status: string;
  refund_status?: string;
  refund_requested_at?: string | null;
  refunded_at?: string | null;
  refund_rejected_at?: string | null;
  refund_admin_note?: string | null;
  price_paid: string;
  original_price?: string;
  referral_discount_amount?: string;
  currency: string;
  starts_at: string;
  ends_at: string;
  renews_at: string;
  canceled_at: string | null;
  trial_ends_at: string | null;
  refund_eligible: number;
  payment_provider?: string | null;
  provider_customer_id?: string | null;
  provider_subscription_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionData {
  is_b2c: boolean;
  subscription: SubscriptionItem | null;
  plan: {
    id: number;
    name: string;
    slug: string;
  } | null;
  usage: {
    invoices: SubscriptionUsageItem;
    quotes: SubscriptionUsageItem;
    expenses: SubscriptionUsageItem;
    storage: SubscriptionStorageItem;
    receipts: SubscriptionUsageItem;
    ocr: SubscriptionUsageItem;
    clients: SubscriptionUsageItem;
    suppliers: SubscriptionUsageItem;
  } | null;
  features: {
    export_enabled: boolean;
    whatsapp_bot_enabled: boolean;
  } | null;
  upgrade_url: string | null;
}

export const mockSubscription: SubscriptionData = {
  is_b2c: true,
  subscription: {
    id: 10,
    customer_id: 40,
    mobile_user_plan_id: 4,
    mobile_user_plan_price_id: 9,
    billing_cycle: 'quarterly',
    status: 'active',
    price_paid: '494.00',
    currency: 'MAD',
    starts_at: '2026-05-05T08:00:38.000000Z',
    ends_at: '2026-08-05T08:00:38.000000Z',
    renews_at: '2026-08-05T08:00:38.000000Z',
    canceled_at: null,
    trial_ends_at: null,
    refund_eligible: 1,
    created_at: '2026-05-05T08:00:38.000000Z',
    updated_at: '2026-05-05T08:00:38.000000Z',
  },
  plan: { id: 4, name: 'Business', slug: 'business' },
  usage: {
    invoices: { used: 0, limit: null, remaining: -1 },
    quotes:   { used: 0, limit: null, remaining: -1 },
    expenses: { used: 0, limit: null, remaining: -1 },
    storage:  { used_mb: 0, limit_mb: 10240, remaining_mb: 10240 },
    receipts: { used: 0, limit: null, remaining: -1 },
    ocr:      { used: 0, limit: null, remaining: -1 },
    clients:  { used: 0, limit: null, remaining: -1 },
    suppliers: { used: 0, limit: null, remaining: -1 },
  },
  features: {
    export_enabled: true,
    whatsapp_bot_enabled: true,
  },
  upgrade_url: null,
};

export const noSubscription: SubscriptionData = {
  is_b2c: true,
  subscription: null,
  plan: null,
  usage: null,
  features: null,
  upgrade_url: null,
};
