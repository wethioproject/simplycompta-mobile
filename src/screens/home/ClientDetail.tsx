import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Edit2, Mail, Phone, MapPin, Trash2,
  Building2, Copy, Layers, FileText, ChevronRight,
} from 'lucide-react-native';

import { getClientDetails, deleteClient } from '../../services/client.service';
import { EditClientModal } from '../../components/clients/EditClientModal';

// ─── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0].length >= 2) return words[0].substring(0, 2).toUpperCase();
  return words[0][0].toUpperCase();
};

// ─── Static chart data (visual only) ──────────────────────────────────────────
const CHART_BARS = [
  { label: 'Janv', ratio: 0.5,  active: false },
  { label: 'Fév',  ratio: 0.7,  active: true  },
  { label: 'Mars', ratio: 0.65, active: true  },
  { label: 'Avr',  ratio: 0.85, active: true  },
];
const BAR_MAX_H = 72;

const ClientDetail: React.FC = ({ navigation, route }: any) => {
  const { client: routeClient } = route.params ?? {};
  const { t } = useTranslation();

  const [clientData, setClientData] = useState<any>(null);
  const [invoiceCount, setInvoiceCount] = useState<number>(0);
  const [totalPriceHt, setTotalPriceHt] = useState<number>(0);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchClient = async () => {
    try {
      setLoadingDetail(true);
      const res = await getClientDetails(routeClient.id);
      if (res.data?.success) {
        console.log('Client details response:', res.data);
        setClientData(res.data.data?.client ?? res.data.data);
        setInvoiceCount(res.data.data?.invoice_count ?? 0);
        setTotalPriceHt(res.data.data?.total_price_ht ?? 0);
      } else {
        setClientData(routeClient);
      }
    } catch (e) {
      Alert.alert(t('error_title'), t('error_load_client_details'));
      setClientData(routeClient);
    } finally {
      setLoadingDetail(false);
    }
  };

  console.log('clientDataclientData22', clientData);

  useEffect(() => { fetchClient(); }, []);

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_client'),
      t('message_confirm_delete_client', { name: clientData?.company_name ?? '' }),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteClient(clientData.id);
              Alert.alert(t('success_title'), t('success_client_deleted'), [
                { text: t('button_ok'), onPress: () => navigation.goBack() },
              ]);
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? 'Erreur lors de la suppression.';
              Alert.alert(t('error_title'), msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const companyName = clientData?.company_name ?? '—';
  const contactName = clientData?.client_name ?? '—';
  const email       = clientData?.email ?? '—';
  const phone       = clientData?.telephone ?? '—';
  const postalCity  = `${clientData?.postal_code ?? ''} ${clientData?.city ?? ''}`.trim() || '—';
  const registreCommerce = clientData?.commercial_register ?? '—';
  const ice         = clientData?.ice ?? '—';

  const copyToClipboard = (text: string) =>
    Alert.alert('', `"${text}" ${t('message_copied')}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header (always visible) ─────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#374151" />
        </TouchableOpacity>

        <View style={styles.heroRow}>
          {/* Avatar */}
          <View style={styles.avatar}>
            {loadingDetail
              ? <ActivityIndicator size="small" color="#1E5BAC" />
              : <Text style={styles.avatarText}>{getInitials(companyName)}</Text>}
          </View>

          {/* Name & subtitle */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>{companyName}</Text>
            <View style={styles.heroSubRow}>
              <Layers size={14} color="#6B7280" />
              <Text style={styles.heroSubText} numberOfLines={1}>{contactName}</Text>
              {!loadingDetail && (
                <TouchableOpacity
                  onPress={() => setShowEditModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Edit2 size={13} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* CLIENT badge */}
          <View style={styles.clientBadge}>
            <View style={styles.clientBadgeOuter}>
              <View style={styles.clientBadgeInner} />
            </View>
            <Text style={styles.clientBadgeText}>{t('badge_client')}</Text>
          </View>
        </View>
      </View>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      {loadingDetail ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Informations du client ──────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('detail_client_info')}</Text>

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Mail size={18} color="#1E5BAC" />
              </View>
              <Text style={styles.infoText}>{email}</Text>
            </View>

            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Phone size={18} color="#1E5BAC" />
              </View>
              <Text style={styles.infoTextFlex}>{phone}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(phone)}
                style={styles.copyBtn}
                activeOpacity={0.7}
              >
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Company */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Building2 size={18} color="#1E5BAC" />
              </View>
              <Text style={styles.infoTextFlex}>{companyName}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(companyName)}
                style={styles.copyBtn}
                activeOpacity={0.7}
              >
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* ICE / RC / Address */}
            <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
              <View style={[styles.infoIconBox, { marginTop: 2 }]}>
                <MapPin size={18} color="#1E5BAC" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoText}>ICE {ice}  RC {registreCommerce}</Text>
                <Text style={styles.infoSubText}>{postalCity}</Text>
              </View>
            </View>
          </View>

          {/* ── Stats Row ───────────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_client_status')}</Text>
              <Text style={styles.statValueGreen}>{t('status_active')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_total_invoiced')}</Text>
              <Text style={styles.statValue}>{totalPriceHt.toLocaleString('fr-FR')} MAD</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_invoice_count')}</Text>
              <Text style={styles.statValue}>{t('label_3_factures', { count: invoiceCount })}</Text>
            </View>
          </View>

          {/* ── Chart + Activity ─────────────────────────────────────────────── */}
          <View style={styles.bottomRow}>
            {/* Chiffre d'affaires */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('detail_revenue')}</Text>
              <View style={styles.barChart}>
                {CHART_BARS.map(bar => (
                  <View key={bar.label} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: BAR_MAX_H * bar.ratio,
                          backgroundColor: bar.active ? '#1E5BAC' : '#DBEAFE',
                        },
                      ]}
                    />
                    <Text style={styles.barLabel}>{bar.label}</Text>
                  </View>
                ))}
              </View>
              <Text>
                <Text style={styles.chartTotalAmount}>{totalPriceHt.toLocaleString('fr-FR')} </Text>
                <Text style={styles.chartTotalUnit}>{t('detail_revenue_unit')}</Text>
              </Text>
            </View>

            {/* Activité */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>{t('detail_activity')}</Text>
              <TouchableOpacity
                style={styles.activityBtnPrimary}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('Invoice', { openCreateModal: true, defaultClientId: clientData?.id })}
              >
                <FileText size={16} color="#1E5BAC" />
                <Text style={styles.activityBtnPrimaryText}>{t('detail_create_invoice')}</Text>
                <ChevronRight size={14} color="#1E5BAC" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.activityBtnSecondary}
                onPress={() => navigation.navigate('Account Statement', { client: clientData })}
                activeOpacity={0.8}
              >
                <Layers size={16} color="#6B7280" />
                <Text style={styles.activityBtnSecondaryText}>{t('detail_invoice_history')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Delete ──────────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#DC2626" />
              : <Trash2 size={16} color="#DC2626" />}
            <Text style={styles.deleteBtnText}>{t('button_delete_client')}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <EditClientModal
        visible={showEditModal}
        clientData={clientData}
        onClose={() => setShowEditModal(false)}
        onUpdated={updated => setClientData(updated)}
      />
    </SafeAreaView>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF6' },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1E5BAC',
  },
  heroInfo: {
    flex: 1,
    gap: 4,
  },
  heroName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroSubText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  clientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    flexShrink: 0,
  },
  clientBadgeOuter: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clientBadgeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  clientBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1E5BAC',
    letterSpacing: 0.5,
  },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  // ── Info card ─────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  // ── Info rows ─────────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoText: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
    lineHeight: 20,
  },
  infoTextFlex: {
    fontSize: 13,
    color: '#374151',
    flex: 1,
  },
  infoSubText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
    lineHeight: 18,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // ── Stats row ─────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginBottom: 6,
    lineHeight: 14,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  statValueGreen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#16A34A',
  },

  // ── Bottom row ────────────────────────────────────────────────────────────────
  bottomRow: {
    flexDirection: 'row',
    gap: 8,
  },

  // Chart card
  chartCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 5,
    marginBottom: 10,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 3,
  },
  barLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  chartTotalAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chartTotalUnit: {
    fontSize: 11,
    color: '#6B7280',
  },

  // Activity card
  activityCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  activityBtnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
  },
  activityBtnPrimaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#1E5BAC',
  },
  activityBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  activityBtnSecondaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },

  // ── Delete ────────────────────────────────────────────────────────────────────
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FFF5F5',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
});

export default ClientDetail;
