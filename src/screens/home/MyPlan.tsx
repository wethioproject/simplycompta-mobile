import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  Zap,
  Calendar,
  ExternalLink,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import UsageCard from '../../components/common/UsageCard';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

const USAGE_ITEMS = [
  { key: 'invoices', labelKey: 'usage_label_invoices', isStorage: false },
  { key: 'quotes',   labelKey: 'usage_label_quotes',   isStorage: false },
  { key: 'expenses', labelKey: 'usage_label_expenses', isStorage: false },
  { key: 'receipts', labelKey: 'usage_label_receipts', isStorage: false },
  { key: 'ocr',      labelKey: 'usage_label_ocr',      isStorage: false },
  { key: 'storage',  labelKey: 'usage_label_storage',  isStorage: true  },
] as const;

const usagePercent = (used: number, limit: number | null) =>
  typeof limit === 'number' && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

const MyPlan: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const subscription = useSelector((state: any) => state.subscription.data);
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();

  const plan = subscription?.plan;
  const usage = subscription?.usage;
  const sub = subscription?.subscription;
  const upgradeUrl = subscription?.upgrade_url;

  const resolveUsageItem = (key: typeof USAGE_ITEMS[number]['key']) => {
    const data = usage?.[key as keyof typeof usage] as any;
    if (data) return data;
    return key === 'storage'
      ? { used_mb: 0, limit_mb: null, remaining_mb: -1 }
      : { used: 0, limit: null, remaining: -1 };
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(i18n.language, {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const statusColor = sub?.status === 'active' ? '#16A34A' : '#EA580C';
  const statusBg    = sub?.status === 'active' ? '#F0FDF4' : '#FFF7ED';
  const usageOverview = USAGE_ITEMS.map(item => {
    const data = resolveUsageItem(item.key);
    const used = item.isStorage ? Number(data.used_mb ?? data.used ?? 0) : Number(data.used ?? 0);
    const rawLimit = item.isStorage ? (data.limit_mb ?? data.limit ?? null) : (data.limit ?? null);
    const limit = typeof rawLimit === 'number' ? rawLimit : null;
    return {
      key: item.key,
      label: t(item.labelKey),
      percentage: usagePercent(used, limit),
      hasLimit: typeof limit === 'number' && limit > 0,
    };
  });
  const nearLimitItems = usageOverview.filter(item => item.hasLimit && item.percentage >= 80);
  const highestUsage = usageOverview
    .filter(item => item.hasLimit)
    .sort((a, b) => b.percentage - a.percentage)[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{t('menu_my_plan')}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <View style={styles.planCardTop}>
            <View style={styles.planIconBox}>
              <CreditCard size={24} color="#1E5BAC" />
            </View>
            <View style={styles.planInfo}>
              <Text style={styles.planName}>{plan?.name ?? t('plan_free')}</Text>
              {sub?.billing_cycle && (
                <Text style={styles.planCycle}>
                  {t(`billing_${sub.billing_cycle}`, { defaultValue: sub.billing_cycle })}
                </Text>
              )}
            </View>
            {sub?.status && (
              <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                <CheckCircle2 size={12} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {t(`status_${sub.status}`, { defaultValue: sub.status })}
                </Text>
              </View>
            )}
          </View>

          {/* Dates */}
          {sub && (
            <View style={styles.datesRow}>
              <View style={styles.dateItem}>
                <Calendar size={13} color="#6B7280" />
                <Text style={styles.dateLabel}>{t('plan_starts_at')}</Text>
                <Text style={styles.dateValue}>{formatDate(sub.starts_at)}</Text>
              </View>
              <View style={styles.dateDivider} />
              <View style={styles.dateItem}>
                <Calendar size={13} color="#6B7280" />
                <Text style={styles.dateLabel}>{t('plan_renews_at')}</Text>
                <Text style={styles.dateValue}>{formatDate(sub.renews_at)}</Text>
              </View>
            </View>
          )}

          {/* Price */}
          {sub?.price_paid && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>{t('plan_price_paid')}</Text>
              <Text style={styles.priceValue}>
                {parseFloat(sub.price_paid).toLocaleString(i18n.language)} {sub.currency}
              </Text>
            </View>
          )}
        </View>

        {/* Usage Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Zap size={16} color="#1E5BAC" />
            <Text style={styles.sectionTitle}>{t('section_usage_overview')}</Text>
          </View>

          <View style={[
            styles.usageInsightCard,
            nearLimitItems.length ? styles.usageInsightWarning : styles.usageInsightHealthy,
          ]}>
            <View style={styles.usageInsightTop}>
              <View style={[
                styles.usageInsightIcon,
                nearLimitItems.length ? styles.usageInsightIconWarning : styles.usageInsightIconHealthy,
              ]}>
                <Zap size={16} color={nearLimitItems.length ? '#D97706' : '#16A34A'} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.usageInsightTitle}>
                  {nearLimitItems.length
                    ? t('usage_insight_attention_title')
                    : t('usage_insight_healthy_title')}
                </Text>
                <Text style={styles.usageInsightSubtitle}>
                  {nearLimitItems.length
                    ? t('usage_insight_attention_subtitle', { count: nearLimitItems.length })
                    : highestUsage
                      ? t('usage_insight_healthy_subtitle', { feature: highestUsage.label, percent: highestUsage.percentage })
                      : t('usage_insight_unlimited_subtitle')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.usageGrid}>
            {(() => {
              const rows: Array<typeof USAGE_ITEMS[number][]> = [];
              for (let i = 0; i < USAGE_ITEMS.length; i += 2) {
                rows.push(USAGE_ITEMS.slice(i, i + 2) as any);
              }
              return rows.map((row, ri) => (
                <View key={ri} style={styles.usageRow}>
                  {row.map(item => {
                    const data = resolveUsageItem(item.key);
                    const used = item.isStorage ? (data.used_mb ?? data.used ?? 0) : (data.used ?? 0);
                    const limit = item.isStorage ? (data.limit_mb ?? data.limit ?? null) : (data.limit ?? null);
                    return (
                      <UsageCard
                        key={item.key}
                        label={t(item.labelKey)}
                        used={Number(used) || 0}
                        limit={typeof limit === 'number' ? limit : null}
                        isStorage={item.isStorage}
                      />
                    );
                  })}
                </View>
              ));
            })()}
          </View>
        </View>

        {/* Upgrade Button */}
        {upgradeUrl && (
          <TouchableOpacity
            style={styles.upgradeBtn}
            onPress={() => openUpgradeWebView(upgradeUrl)}
            activeOpacity={0.85}
          >
            <ExternalLink size={18} color="#FFFFFF" />
            <Text style={styles.upgradeBtnText}>{t('button_upgrade_plan')}</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
          {upgradeWebViewElement}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  /* Header */
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTop: {
    alignItems: 'center',
    paddingTop: 12,
    marginBottom: 12,
  },
  logo: { width: 110, height: 32 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  scroll: { flex: 1 },
  scrollContent: { padding: 20 },

  /* Plan Card */
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  planIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: { flex: 1 },
  planName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  planCycle: { fontSize: 13, color: '#6B7280', marginTop: 2, textTransform: 'capitalize' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: '600' },

  datesRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    marginBottom: 14,
  },
  dateItem: { flex: 1, alignItems: 'center', gap: 4 },
  dateLabel: { fontSize: 11, color: '#6B7280' },
  dateValue: { fontSize: 12, fontWeight: '600', color: '#111827', textAlign: 'center' },
  dateDivider: { width: 1, backgroundColor: '#F3F4F6', marginHorizontal: 8 },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
  },
  priceLabel: { fontSize: 13, color: '#6B7280' },
  priceValue: { fontSize: 16, fontWeight: '700', color: '#111827' },

  /* Usage Section */
  section: { marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  usageInsightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  usageInsightHealthy: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  usageInsightWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  usageInsightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  usageInsightIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  usageInsightIconHealthy: { backgroundColor: '#DCFCE7' },
  usageInsightIconWarning: { backgroundColor: '#FEF3C7' },
  usageInsightTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  usageInsightSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 3,
    lineHeight: 17,
  },
  usageGrid: { gap: 10 },
  usageRow: { flexDirection: 'row', gap: 10 },

  /* Upgrade Button */
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E5BAC',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 8,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

export default MyPlan;
