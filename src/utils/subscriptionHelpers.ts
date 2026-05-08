import type { SubscriptionData, SubscriptionUsageItem } from '../types/subscription.types';


export type UsageFeature = 'invoices' | 'quotes' | 'expenses' | 'receipts' | 'ocr' | 'clients' | 'suppliers';
export type BooleanFeature = 'export_enabled' | 'whatsapp_bot_enabled';
export type AnyFeature = UsageFeature | BooleanFeature;


export const canUseFeature = (
  subscriptionData: SubscriptionData | null | undefined,
  feature: AnyFeature,
): boolean => {
  if (!subscriptionData) return false;
//   if (!subscriptionData.is_b2c) return true;
//   const activeSubscription = subscriptionData.subscription?.find(
//     s => s.status === 'active'
//   );
//   if (!activeSubscription) return false;

  if (feature === 'export_enabled' || feature === 'whatsapp_bot_enabled') {
    return subscriptionData.features?.[feature] === true;
  }

  const usage = subscriptionData.usage?.[feature as UsageFeature];
  if (!usage) return false;
  if (usage.remaining === -1) return true;
  return usage.remaining > 0;
};


//Safely returns the usage object for a counter-based feature.

export const getFeatureUsage = (
  subscriptionData: SubscriptionData | null | undefined,
  feature: UsageFeature,
): SubscriptionUsageItem | null => {
  if (!subscriptionData) return null;
  return subscriptionData.usage?.[feature] ?? null;
};


//Returns true if at least one subscription entry has status = 'active'.

export const isSubscriptionActive = (
  subscriptionData: SubscriptionData | null | undefined,
): boolean => {
  return subscriptionData?.subscription?.status === 'active';
};

// Returns display name of the current plan, or null.

export const getPlanName = (
  subscriptionData: SubscriptionData | null | undefined,
): string | null => {
  return subscriptionData?.plan?.name ?? null;
};
