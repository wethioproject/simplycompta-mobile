import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Building2,
  Copy,
  FileText,
  Layers,
  CreditCard,
  ChevronRight,
  Package,
  Trash2,
} from 'lucide-react-native';
import { useSupplier } from '../../hooks/useSupplier';
import { SupplierPayload } from '../../services/supplierService';
import { SupplierItem } from './Suppliers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';


// ─── Helpers ───────────────────────────────────────────────────────────────────
const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0].length >= 2) return words[0].substring(0, 2).toUpperCase();
  return words[0][0].toUpperCase();
};

// ─── Static chart data (visual only) ──────────────────────────────────────────
const CHART_POINTS = [
  { label: 'Janv', x: 0,   y: 50  },
  { label: 'Fév',  x: 33,  y: 30  },
  { label: 'Mars', x: 66,  y: 35  },
  { label: 'Avr',  x: 100, y: 15  },
];

// ─── Edit Supplier Modal ───────────────────────────────────────────────────────
const EditSupplierModal: React.FC<{
  visible: boolean;
  supplierData: any;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}> = ({ visible, supplierData, onClose, onUpdated }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { updateSupplier } = useSupplier();

  const [companyName, setCompanyName] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [ice, setIce] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && supplierData) {
      setCompanyName(supplierData.company_name ?? '');
      setSupplierName(supplierData.supplier_name ?? '');
      setEmail(supplierData.email ?? '');
      setTelephone(supplierData.telephone ?? '');
      setPostalCode(supplierData.postal_code ?? '');
      setCity(supplierData.city ?? '');
      setCommercialRegister(supplierData.commercial_register ?? '');
      setIce(supplierData.ice ?? supplierData.ice_number ?? '');
    }
  }, [visible, supplierData]);

  const handleUpdate = async () => {
    if (!companyName.trim()) { Alert.alert(t('alert_field_required'), t('message_company_name_required')); return; }
    if (!supplierName.trim()) { Alert.alert(t('alert_field_required'), t('message_supplier_name_required')); return; }
    if (!email.trim()) { Alert.alert(t('alert_field_required'), t('message_email_required')); return; }
    if (!postalCode.trim()) { Alert.alert(t('alert_field_required'), t('message_postal_code_required')); return; }
    if (!city.trim()) { Alert.alert(t('alert_field_required'), t('message_city_required')); return; }
    setSaving(true);
    const payload: SupplierPayload = {
      company_name: companyName.trim(),
      supplier_name: supplierName.trim(),
      email: email.trim(),
      telephone: telephone.trim(),
      postal_code: postalCode.trim(),
      city: city.trim(),
      commercial_register: commercialRegister.trim(),
      ice_number: ice.trim(),
    };
    const result = await updateSupplier(supplierData.id, payload);
    setSaving(false);
    if (result.success) {
      const updated = result.supplier ?? { ...supplierData, ...payload };
      Alert.alert(t('success_title'), t('success_supplier_updated'));
      onUpdated(updated);
      onClose();
    } else {
      Alert.alert(t('error_title'), result.error ?? t('error_update_supplier'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E5BAC" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('title_edit_supplier')}</Text>
          <TouchableOpacity
            style={[styles.modalConfirmBtn, saving && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_company_name')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={companyName} onChangeText={setCompanyName} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_supplier_name')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={supplierName} onChangeText={setSupplierName} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_email')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_phone')}</Text>
                <TextInput style={styles.fieldInput} value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_postal_code')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_city')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={city} onChangeText={setCity} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_commercial_register')}</Text>
                <TextInput style={styles.fieldInput} value={commercialRegister} onChangeText={setCommercialRegister} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <TextInput style={styles.fieldInput} value={ice} onChangeText={setIce} keyboardType="numeric" />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>{t('button_save_changes')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// ─── Supplier Detail Screen ────────────────────────────────────────────────────
const SupplierDetail: React.FC = ({ navigation, route }: any) => {
  const { supplier: routeSupplier } = route.params ?? {};
  const { t } = useTranslation();
  const { getSupplierById, getSupplierExpenses, deleteSupplier } = useSupplier();
  const dispatch = useDispatch<AppDispatch>();
  const [supplierData, setSupplierData] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  console.log('exppp detlll254', expenses)

  const fetchSupplier = async () => {
    setLoadingDetail(true);
    const result = await getSupplierById(routeSupplier.id);
    if (result.success && result.supplier) {
      setSupplierData(result.supplier.supplier);
    } else {
      setSupplierData(routeSupplier);
    }
    setLoadingDetail(false);
  };

  const fetchExpenses = async () => {
    setLoadingExpenses(true);
    const result = await getSupplierExpenses(routeSupplier.id);
    if (result.success) setExpenses(result.expenses);
    setLoadingExpenses(false);
  };

  useEffect(() => {
    fetchSupplier();
    fetchExpenses();
  }, []);

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_supplier'),
      t('message_confirm_delete_supplier', { name: supplierData?.company_name ?? '' }),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'), style: 'destructive', onPress: async () => {
            setDeleting(true);
            const result = await deleteSupplier(supplierData.id);
            dispatch(loadSubscription() as any);
            setDeleting(false);
            if (result.success) {
              Alert.alert(t('success_title'), t('success_supplier_deleted'), [
                { text: t('button_ok'), onPress: () => navigation.goBack() },
              ]);
            } else {
              Alert.alert(t('error_title'), result.error ?? t('error_delete_supplier'));
            }
          },
        },
      ],
    );
  };
  console.log('supp data333', supplierData);

  const companyName = supplierData?.company_name ?? '—';
  const contactName = supplierData?.supplier_name ?? '—';
  const email = supplierData?.email ?? '—';
  const phone = supplierData?.telephone ?? '—';
  const postalCity = `${supplierData?.postal_code ?? ''} ${supplierData?.city ?? ''}`.trim() || '—';
  const registreCommerce = supplierData?.commercial_register ?? '—';
  const ice = supplierData?.ice ?? supplierData?.ice_number ?? '—';
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.total_ttc ?? e.ttc ?? '0') || 0), 0);

  const copyToClipboard = (text: string) =>
    Alert.alert('', `"${text}" ${t('message_copied')}`);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header (always visible) ──────────────────────────────────────── */}
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
              ? <ActivityIndicator size="small" color="#EA580C" />
              : <Text style={styles.avatarText}>{getInitials(companyName)}</Text>}
          </View>

          {/* Name & subtitle */}
          <View style={styles.heroInfo}>
            <Text style={styles.heroName} numberOfLines={1}>{companyName}</Text>
            <View style={styles.heroSubRow}>
              <Building2 size={14} color="#6B7280" />
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

          {/* FOURNISSEUR badge */}
          <View style={styles.supplierBadge}>
            <Package size={14} color="#EA580C" />
            <Text style={styles.supplierBadgeText}>{t('badge_supplier')}</Text>
          </View>
        </View>
      </View>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      {loadingDetail ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#EA580C" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Informations du fournisseur ────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('detail_supplier_info')}</Text>

            {/* Email */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Mail size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoTextFlex}>{email}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(email)} style={styles.copyBtn} activeOpacity={0.7}>
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Phone */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Phone size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoTextFlex}>{phone}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(phone)} style={styles.copyBtn} activeOpacity={0.7}>
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Company */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Building2 size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoTextFlex}>{companyName}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(companyName)} style={styles.copyBtn} activeOpacity={0.7}>
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* ICE / RC */}
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <FileText size={18} color="#EA580C" />
              </View>
              <Text style={styles.infoTextFlex}>ICE {ice}  RC {registreCommerce}</Text>
              <TouchableOpacity onPress={() => copyToClipboard(`ICE ${ice}  RC ${registreCommerce}`)} style={styles.copyBtn} activeOpacity={0.7}>
                <Copy size={14} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Address */}
            <View style={[styles.infoRow, { alignItems: 'flex-start' }]}>
              <View style={[styles.infoIconBox, { marginTop: 2 }]}>
                <MapPin size={18} color="#EA580C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoText}>{registreCommerce}</Text>
                <Text style={styles.infoSubText}>{postalCity}</Text>
              </View>
            </View>
          </View>

          {/* ── Stats Row ────────────────────────────────────────────────── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_supplier_status')}</Text>
              <Text style={styles.statValueGreen}>{t('status_active')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_total_expenses')}</Text>
              <Text style={styles.statValue}>{totalExpenses.toLocaleString('fr-FR')} MAD</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>{t('detail_expense_count')}</Text>
              <Text style={styles.statValue}>{t('text_expense_or_expenses', { count: expenses.length })}</Text>
            </View>
          </View>

          {/* ── Chart + Activity ──────────────────────────────────────────── */}
          <View style={styles.bottomRow}>
            {/* Montant dépensé – bar chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{t('detail_amount_spent')}</Text>
              {/* Simple bar chart approximation */}
              <View style={styles.barChart}>
                {[{ label: 'Janv', ratio: 0.5 }, { label: 'Fév', ratio: 0.7 }, { label: 'Mars', ratio: 0.65 }, { label: 'Avr', ratio: 0.85 }].map(bar => (
                  <View key={bar.label} style={styles.barWrapper}>
                    <View style={[styles.bar, { height: 72 * bar.ratio, backgroundColor: '#FB923C' }]} />
                    <Text style={styles.barLabel}>{bar.label}</Text>
                  </View>
                ))}
              </View>
              <Text>
                <Text style={styles.chartTotalAmount}>{totalExpenses.toLocaleString('fr-FR')} </Text>
                <Text style={styles.chartTotalUnit}>{t('detail_expenses_unit')}</Text>
              </Text>
            </View>

            {/* Activité */}
            <View style={styles.activityCard}>
              <Text style={styles.activityTitle}>{t('detail_activity')}</Text>
              <TouchableOpacity style={styles.activityBtnPrimary} activeOpacity={0.8}
              onPress={() => navigation.navigate('Expenses', { openCreateModal: true, defaultSupplierId: supplierData?.id })}
              >
                <CreditCard size={16} color="#EA580C" />
                <Text style={styles.activityBtnPrimaryText}>{t('detail_new_expense')}</Text>
                <ChevronRight size={14} color="#EA580C" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.activityBtnSecondary} activeOpacity={0.8}>
                <Layers size={16} color="#6B7280" />
                <Text style={styles.activityBtnSecondaryText}>{t('detail_expense_history')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Expenses History ──────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('section_expenses')}</Text>
            {loadingExpenses ? (
              <ActivityIndicator color="#EA580C" style={{ marginVertical: 16 }} />
            ) : expenses.length === 0 ? (
              <Text style={styles.emptyText}>{t('text_no_associated_expenses')}</Text>
            ) : (
              expenses.map((expense, index) => (
                <View
                  key={expense.id ?? index}
                  style={[styles.expenseRow, index === expenses.length - 1 && { borderBottomWidth: 0 }]}
                >
                  <View style={styles.expenseIconBox}>
                    <Package size={20} color="#EA580C" />
                  </View>
                  <View style={styles.expenseInfo}>
                    <Text style={styles.expenseLabel}>
                      {expense.description ?? expense.category ?? expense.payment_method ?? '—'}
                    </Text>
                    <Text style={styles.expenseDate}>
                      {expense.date ? new Date(expense.date).toLocaleDateString('fr-FR') : '—'}
                    </Text>
                  </View>
                  <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>
                      {parseFloat(expense.total_ttc ?? expense.ttc ?? '0').toLocaleString('fr-FR')} MAD
                    </Text>
                    <View style={styles.paidBadge}>
                      <Text style={styles.paidBadgeText}>Payée</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ── Delete ───────────────────────────────────────────────────── */}
          <TouchableOpacity
            style={[styles.deleteBtn, deleting && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#DC2626" />
              : <Trash2 size={16} color="#DC2626" />}
            <Text style={styles.deleteBtnText}>{t('button_delete_supplier')}</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <EditSupplierModal
        visible={showEditModal}
        supplierData={supplierData}
        onClose={() => setShowEditModal(false)}
        onUpdated={(updated) => setSupplierData(updated)}
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
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
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
  supplierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    flexShrink: 0,
  },
  supplierBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
    letterSpacing: 0.5,
  },

  // ── Loading ──────────────────────────────────────────────────────────────────
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Scroll ───────────────────────────────────────────────────────────────────
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  // ── Generic card ─────────────────────────────────────────────────────────────
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
    backgroundColor: '#FFF7ED',
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
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
  },
  activityBtnPrimaryText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    color: '#EA580C',
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

  // ── Expenses history ──────────────────────────────────────────────────────────
  emptyText: { fontSize: 13, color: '#9CA3AF', textAlign: 'center', paddingVertical: 12 },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  expenseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  expenseInfo: { flex: 1 },
  expenseLabel: { fontSize: 13, fontWeight: '600', color: '#111827' },
  expenseDate: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  expenseRight: { alignItems: 'flex-end', gap: 4 },
  expenseAmount: { fontSize: 13, fontWeight: '600', color: '#111827' },
  paidBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
  },
  paidBadgeText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },

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

  // ── Modal (EditSupplierModal – unchanged) ─────────────────────────────────────
  modalContainer: { flex: 1, backgroundColor: '#F5F7FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalBackBtn: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  modalConfirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    minWidth: 90, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },
  formCard: {
    borderRadius: 16,
    paddingVertical: 18,
    gap: 16,
    marginBottom: 16,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#1E5BAC' },
  fieldInput: {
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#1F2937',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  confirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default SupplierDetail;
