import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Briefcase,
  ChevronDown,
  Plus,
  Target,
  TrendingUp,
  Trophy,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react-native';
import commercialService from '../../services/commercialService';
import type { CommercialStatsData, Salesperson } from '../../types/commercial.types';
import { canUseBusinessModule } from '../../utils/subscriptionHelpers';
import { useUpgradeWebView } from '../../utils/upgradeWebView';
import FeatureLockCard from '../../components/common/FeatureLockCard';
import { useSecurity } from '../../contexts/SecurityContext';

const currentDate = new Date();

const CommercialPerformance: React.FC = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const subscription = useSelector((state: any) => state.subscription.data);
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();
  const { maskAmount } = useSecurity();

  const canUseCommercial = canUseBusinessModule(subscription, 'commercial_performance');
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [stats, setStats] = useState<CommercialStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [commercialId, setCommercialId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const selectedCommercial = salespeople.find(item => item.id === commercialId) ?? null;

  const load = useCallback(async (silent = false) => {
    if (!canUseCommercial) {
      setLoading(false);
      return;
    }
    if (!silent) setLoading(true);
    try {
      const [peopleResponse, statsResponse] = await Promise.all([
        commercialService.getSalespeople(),
        commercialService.getStats({ month, year, commercial_id: commercialId }),
      ]);
      setSalespeople(peopleResponse.data ?? []);
      setStats(statsResponse.data);
    } catch (error: any) {
      Alert.alert(t('error_title'), error?.response?.data?.message ?? t('commercial_load_error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canUseCommercial, commercialId, month, t, year]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const resetCreateForm = () => {
    setName('');
    setEmail('');
    setPhone('');
  };

  const createSalesperson = async () => {
    if (!name.trim()) {
      Alert.alert(t('error_title'), t('commercial_name_required'));
      return;
    }
    setSaving(true);
    try {
      const response = await commercialService.createSalesperson({
        name: name.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        active: true,
      });
      setSalespeople(prev => [response.data, ...prev.filter(item => item.id !== response.data.id)]);
      setCommercialId(response.data.id);
      setCreateOpen(false);
      resetCreateForm();
      await load(true);
    } catch (error: any) {
      Alert.alert(t('error_title'), error?.response?.data?.message ?? t('commercial_create_error'));
    } finally {
      setSaving(false);
    }
  };

  const summary = stats?.summary;
  const maxTrend = useMemo(() => Math.max(1, ...(stats?.monthly_trend ?? []).map(item => item.revenue)), [stats]);

  return (
    <SafeAreaView style={screenStyles.container} edges={['top']}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <ArrowLeft size={22} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={screenStyles.title}>{t('commercial_title')}</Text>
          <Text style={screenStyles.subtitle}>{t('commercial_subtitle')}</Text>
        </View>
        <TouchableOpacity
          style={screenStyles.addButton}
          onPress={() => canUseCommercial ? setCreateOpen(true) : openUpgradeWebView(subscription?.upgrade_url)}
          activeOpacity={0.8}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {!canUseCommercial ? (
        <ScrollView contentContainerStyle={screenStyles.lockContent}>
          <FeatureLockCard
            requiredPlan="Business"
            title={t('commercial_locked_title')}
            subtitle={t('commercial_locked_subtitle')}
            onUpgrade={() => openUpgradeWebView(subscription?.upgrade_url)}
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={screenStyles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1E5BAC" />}
          showsVerticalScrollIndicator={false}
        >
          <View style={screenStyles.filterRow}>
            <TouchableOpacity style={screenStyles.filterPill} onPress={() => setMonth(month === 12 ? 1 : month + 1)}>
              <Text style={screenStyles.filterLabel}>{t('commercial_month_short')}</Text>
              <Text style={screenStyles.filterValue}>{String(month).padStart(2, '0')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={screenStyles.filterPill} onPress={() => setYear(year + 1)}>
              <Text style={screenStyles.filterLabel}>{t('commercial_year')}</Text>
              <Text style={screenStyles.filterValue}>{year}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[screenStyles.filterPill, { flex: 1.3 }]} onPress={() => setPickerOpen(true)}>
              <Text style={screenStyles.filterLabel}>{t('commercial_filter')}</Text>
              <View style={screenStyles.filterValueRow}>
                <Text style={screenStyles.filterValue} numberOfLines={1}>
                  {selectedCommercial?.name ?? t('commercial_all')}
                </Text>
                <ChevronDown size={16} color="#1E5BAC" />
              </View>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={screenStyles.loadingBox}>
              <ActivityIndicator size="large" color="#1E5BAC" />
            </View>
          ) : (
            <>
              <View style={screenStyles.kpiGrid}>
                <KpiCard icon={<WalletCards size={20} color="#1E5BAC" />} label={t('commercial_revenue')} value={maskAmount(summary?.total_invoiced_amount ?? 0)} />
                <KpiCard icon={<Briefcase size={20} color="#0F766E" />} label={t('commercial_quotes_sent')} value={String(summary?.total_quotes ?? 0)} />
                <KpiCard icon={<Target size={20} color="#7C3AED" />} label={t('commercial_conversion')} value={`${summary?.conversion_rate ?? 0}%`} />
                <KpiCard icon={<TrendingUp size={20} color="#DC2626" />} label={t('commercial_unpaid')} value={maskAmount(summary?.unpaid_amount ?? 0)} />
              </View>

              <InsightCard stats={stats} t={t} maskAmount={maskAmount} />

              <Section title={t('commercial_ranking')}>
                {(stats?.ranking ?? []).map((item, index) => (
                  <TouchableOpacity
                    key={item.commercial_id}
                    style={screenStyles.rankingRow}
                    onPress={() => setCommercialId(item.commercial_id)}
                    activeOpacity={0.75}
                  >
                    <View style={screenStyles.rankBadge}>
                      <Text style={screenStyles.rankText}>{index + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={screenStyles.rankName}>{item.name}</Text>
                      <Text style={screenStyles.rankMeta}>{item.quotes} {t('commercial_quotes')} · {item.conversion_rate}%</Text>
                    </View>
                    <Text style={screenStyles.rankAmount}>{maskAmount(item.revenue)}</Text>
                  </TouchableOpacity>
                ))}
                {(stats?.ranking ?? []).length === 0 && <EmptyText text={t('commercial_empty_ranking')} />}
              </Section>

              <Section title={t('commercial_monthly_trend')}>
                <View style={screenStyles.trendRow}>
                  {(stats?.monthly_trend ?? []).map(item => (
                    <View key={item.month} style={screenStyles.trendItem}>
                      <View style={[screenStyles.trendBar, { height: 18 + (item.revenue / maxTrend) * 68 }]} />
                      <Text style={screenStyles.trendLabel}>{item.month}</Text>
                    </View>
                  ))}
                </View>
              </Section>

              <Section title={t('commercial_top_clients')}>
                {(stats?.top_clients ?? []).map(item => (
                  <View key={item.id} style={screenStyles.clientRow}>
                    <UserRound size={18} color="#1E5BAC" />
                    <Text style={screenStyles.clientName} numberOfLines={1}>{item.name}</Text>
                    <Text style={screenStyles.clientAmount}>{maskAmount(item.revenue)}</Text>
                  </View>
                ))}
                {(stats?.top_clients ?? []).length === 0 && <EmptyText text={t('commercial_empty_clients')} />}
              </Section>
            </>
          )}
        </ScrollView>
      )}

      <PickerModal
        visible={pickerOpen}
        salespeople={salespeople}
        selectedId={commercialId}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => { setCommercialId(id); setPickerOpen(false); }}
        t={t}
      />

      <Modal visible={createOpen} transparent animationType="fade" onRequestClose={() => setCreateOpen(false)}>
        <View style={screenStyles.modalOverlay}>
          <View style={screenStyles.sheet}>
            <View style={screenStyles.sheetHeader}>
              <Text style={screenStyles.sheetTitle}>{t('commercial_add')}</Text>
              <TouchableOpacity onPress={() => setCreateOpen(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TextInput style={screenStyles.input} value={name} onChangeText={setName} placeholder={t('commercial_name')} placeholderTextColor="#94A3B8" />
            <TextInput style={screenStyles.input} value={email} onChangeText={setEmail} placeholder={t('commercial_email')} placeholderTextColor="#94A3B8" keyboardType="email-address" autoCapitalize="none" />
            <TextInput style={screenStyles.input} value={phone} onChangeText={setPhone} placeholder={t('commercial_phone')} placeholderTextColor="#94A3B8" keyboardType="phone-pad" />
            <TouchableOpacity style={screenStyles.primaryButton} onPress={createSalesperson} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={screenStyles.primaryButtonText}>{t('button_confirm')}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {upgradeWebViewElement}
    </SafeAreaView>
  );
};

const KpiCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={screenStyles.kpiCard}>
    <View style={screenStyles.kpiIcon}>{icon}</View>
    <Text style={screenStyles.kpiValue} numberOfLines={1}>{value}</Text>
    <Text style={screenStyles.kpiLabel} numberOfLines={2}>{label}</Text>
  </View>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={screenStyles.section}>
    <Text style={screenStyles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const EmptyText = ({ text }: { text: string }) => <Text style={screenStyles.emptyText}>{text}</Text>;

const InsightCard = ({ stats, t, maskAmount }: { stats: CommercialStatsData | null; t: any; maskAmount: (value: number, suffix?: string) => string }) => {
  const best = stats?.insights?.best_commercial;
  const conversion = stats?.insights?.highest_conversion;
  return (
    <View style={screenStyles.insightCard}>
      <View style={screenStyles.insightIcon}><Trophy size={20} color="#B45309" /></View>
      <View style={{ flex: 1 }}>
        <Text style={screenStyles.insightTitle}>{t('commercial_insights')}</Text>
        <Text style={screenStyles.insightLine}>
          {best ? t('commercial_best_revenue', { name: best.name, amount: maskAmount(best.revenue) }) : t('commercial_no_best_revenue')}
        </Text>
        <Text style={screenStyles.insightLine}>
          {conversion ? t('commercial_best_conversion', { name: conversion.name, rate: conversion.conversion_rate }) : t('commercial_no_best_conversion')}
        </Text>
      </View>
    </View>
  );
};

const PickerModal = ({
  visible,
  salespeople,
  selectedId,
  onClose,
  onSelect,
  t,
}: {
  visible: boolean;
  salespeople: Salesperson[];
  selectedId: number | null;
  onClose: () => void;
  onSelect: (id: number | null) => void;
  t: any;
}) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={screenStyles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={screenStyles.sheet}>
        <Text style={screenStyles.sheetTitle}>{t('commercial_choose')}</Text>
        <TouchableOpacity style={screenStyles.option} onPress={() => onSelect(null)}>
          <Text style={[screenStyles.optionText, selectedId === null && screenStyles.optionSelected]}>{t('commercial_all')}</Text>
        </TouchableOpacity>
        {salespeople.map(item => (
          <TouchableOpacity key={item.id} style={screenStyles.option} onPress={() => onSelect(item.id)}>
            <Text style={[screenStyles.optionText, selectedId === item.id && screenStyles.optionSelected]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

const screenStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  addButton: { width: 42, height: 42, borderRadius: 15, backgroundColor: '#1E5BAC', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 34 },
  lockContent: { padding: 18 },
  filterRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  filterPill: { minHeight: 54, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#DBEAFE', paddingHorizontal: 12, justifyContent: 'center' },
  filterLabel: { fontSize: 10, fontWeight: '800', color: '#64748B', textTransform: 'uppercase' },
  filterValue: { fontSize: 14, fontWeight: '900', color: '#1E5BAC', marginTop: 3 },
  filterValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  loadingBox: { minHeight: 260, alignItems: 'center', justifyContent: 'center' },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { width: '48.5%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
  kpiIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  kpiValue: { fontSize: 18, fontWeight: '900', color: '#111827', maxWidth: '100%' },
  kpiLabel: { fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 3 },
  insightCard: { flexDirection: 'row', gap: 12, backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 14 },
  insightIcon: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center' },
  insightTitle: { fontSize: 15, fontWeight: '900', color: '#92400E' },
  insightLine: { fontSize: 12, color: '#92400E', marginTop: 4, lineHeight: 17 },
  section: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 10 },
  rankingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  rankBadge: { width: 30, height: 30, borderRadius: 12, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 13, fontWeight: '900', color: '#1E5BAC' },
  rankName: { fontSize: 14, fontWeight: '900', color: '#111827' },
  rankMeta: { fontSize: 12, color: '#64748B', marginTop: 2 },
  rankAmount: { fontSize: 13, fontWeight: '900', color: '#16A34A' },
  trendRow: { height: 116, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8 },
  trendItem: { alignItems: 'center', gap: 5, flex: 1 },
  trendBar: { width: 12, borderRadius: 8, backgroundColor: '#1E5BAC' },
  trendLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '700' },
  clientRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  clientName: { flex: 1, fontSize: 13, fontWeight: '800', color: '#111827' },
  clientAmount: { fontSize: 13, fontWeight: '900', color: '#16A34A' },
  emptyText: { fontSize: 13, color: '#94A3B8', textAlign: 'center', paddingVertical: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.35)', justifyContent: 'flex-end', padding: 16 },
  sheet: { backgroundColor: '#FFFFFF', borderRadius: 22, padding: 18 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { fontSize: 17, fontWeight: '900', color: '#111827', marginBottom: 10 },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 14, marginBottom: 10, color: '#111827', backgroundColor: '#F8FAFC' },
  primaryButton: { minHeight: 48, borderRadius: 15, backgroundColor: '#1E5BAC', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  option: { paddingVertical: 13, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  optionText: { fontSize: 15, color: '#111827', fontWeight: '700' },
  optionSelected: { color: '#1E5BAC' },
});

export default CommercialPerformance;
