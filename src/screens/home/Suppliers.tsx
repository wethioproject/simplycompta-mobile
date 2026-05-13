import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  RefreshControl,
} from 'react-native';
import { ArrowLeft, Plus, Search, X, ChevronRight } from 'lucide-react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { appLogoIcon } from '../../assets/icons';
import { useSupplier } from '../../hooks/useSupplier';
import { useSelector, useDispatch } from 'react-redux';
import { Linking } from 'react-native';
import { canUseFeature } from '../../utils/subscriptionHelpers';
import { loadSubscription } from '../../store/slices/subscriptionSlice';
import type { AppDispatch } from '../../store';
import { SupplierPayload } from '../../services/supplierService';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

type StackNavigation = StackNavigationProp<any>;

export interface SupplierItem {
  id: number;
  customer_id?: number;
  company_name: string;
  supplier_name: string;
  email: string;
  telephone: string;
  postal_code: string;
  city: string;
  commercial_register: string;
  ice: string;
  total_ttc?: number;
  expenses_count?: number;
  created_at?: string;
  updated_at?: string;
}


// ─── Yup schema (Supplier) ─────────────────────────────────────────────────────
const supplierSchema = yup.object({
  companyName: yup.string().required('Company name is required'),
  supplierName: yup.string().trim().required('Supplier name is required'),
  email: yup.string().trim().required('Email is required').test('email-format', 'Invalid email address', v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)),
  telephone: yup.string().trim().required('Phone is required'),
  postalCode: yup.string().optional(),
  city: yup.string().optional(),
  commercialRegister: yup.string().optional(),
  ice: yup.string().optional(),
});

type SupplierFormValues = {
  companyName: string;
  supplierName: string;
  email?: string;
  telephone?: string;
  postalCode: string;
  city: string;
  commercialRegister?: string;
  ice?: string;
};

// ─── Create Supplier Modal ─────────────────────────────────────────────────────
export const CreateSupplierModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ visible, onClose, onCreated }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { createSupplier } = useSupplier();
  const dispatch = useDispatch<AppDispatch>();
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();
  const subscription = useSelector((state: any) => state.subscription.data);
  const upgradeUrl = subscription?.upgrade_url;

//   const [companyName, setCompanyName] = useState('');
//   const [supplierName, setSupplierName] = useState('');
//   const [email, setEmail] = useState('');
//   const [telephone, setTelephone] = useState('');
//   const [postalCode, setPostalCode] = useState('');
//   const [city, setCity] = useState('');
//   const [commercialRegister, setCommercialRegister] = useState('');
//   const [ice, setIce] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR');

//   const resetForm = () => {
//     setCompanyName(''); setSupplierName(''); setEmail('');
//     setTelephone(''); setPostalCode(''); setCity('');
//     setCommercialRegister(''); setIce('');
//   };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<SupplierFormValues>({
    resolver: yupResolver(supplierSchema) as any,
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      supplierName: '',
      email: '',
      telephone: '',
      postalCode: '',
      city: '',
      commercialRegister: '',
      ice: '',
    },
  });

//   useEffect(() => { if (!visible) resetForm(); }, [visible]);
  useEffect(() => { if (!visible) reset(); }, [visible]);

//   const handleSave = async () => {
//     if (!companyName.trim()) {
//       Alert.alert(t('alert_field_required'), t('message_company_name_required'));
//       return;
//     }
//     if (!supplierName.trim()) {
//       Alert.alert(t('alert_field_required'), t('message_supplier_name_required'));
//       return;
//     }
//     if (!email.trim()) {
//       Alert.alert(t('alert_field_required'), t('message_email_required'));
//       return;
//     }
//     if (!postalCode.trim()) {
//       Alert.alert(t('alert_field_required'), t('message_postal_code_required'));
//       return;
//     }
//     if (!city.trim()) {
//       Alert.alert(t('alert_field_required'), t('message_city_required'));
//       return;
//     }
//     setSaving(true);
//     const payload: SupplierPayload = {
//       company_name: companyName.trim(),
//       supplier_name: supplierName.trim(),
//       email: email.trim(),
//       telephone: telephone.trim(),
//       postal_code: postalCode.trim(),
//       city: city.trim(),
//       commercial_register: commercialRegister.trim(),
//       ice: ice.trim(),
//     };
//     const result = await createSupplier(payload);
//     setSaving(false);
//     if (result.success) {
//       Alert.alert(t('success_title'), t('success_supplier_created'));
//       onCreated();
//       onClose();
//     } else {
//       Alert.alert(t('error_title'), result.error ?? t('error_create_supplier'));
//     }
//   };

    const onSubmit = async (data: SupplierFormValues) => {
    if (!canUseFeature(subscription, 'suppliers')) {
      Alert.alert(t('subscription_limit_title'), t('subscription_limit_suppliers'), [
        { text: t('button_maybe_later'), style: 'cancel' },
        { text: t('button_upgrade_plan'), onPress: () => openUpgradeWebView(upgradeUrl) },
      ]);
      return;
    }
    setSaving(true);
    try {
    const payload: SupplierPayload = {
      company_name: data.companyName,
      supplier_name: data.supplierName,
      email: data.email ?? '',
      telephone: data.telephone ?? '',
      postal_code: data.postalCode,
      city: data.city,
      commercial_register: data.commercialRegister ?? '',
      ice: data.ice ?? '',
    };
    const res = await createSupplier(payload);
    if (!res.success) {
      Alert.alert(t('error_title'), res.error ?? t('error_create_supplier'));
      return;
    }
      dispatch(loadSubscription() as any);
      Alert.alert(t('success_title'), t('success_supplier_created'));
      onCreated();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? t('error_create_supplier');
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        {/* Modal Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E5BAC" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('title_create_supplier')}</Text>
          <TouchableOpacity
            // style={[styles.modalConfirmBtn, saving && { opacity: 0.7 }]}
            // onPress={handleSave}
            style={[styles.modalConfirmBtn, !isValid && styles.modalConfirmBtnDisabled]}
            onPress={handleSubmit(onSubmit as any)}
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
            <Text style={styles.createDateText}>{t('text_creation_date')}{today}</Text>

            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                {/* <Text style={styles.fieldLabel}>{t('label_company_name')} <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.fieldInput} value={companyName} onChangeText={setCompanyName} placeholder="Bureautique Maroc SARL" placeholderTextColor="#AAAAAA" /> */}
                                <Text style={styles.fieldLabel}>{t('label_company_name')} <Text style={styles.required}>*</Text></Text>
                                <Controller
                                    control={control}
                                    name="companyName"
                                    render={({ field: { value, onChange, onBlur } }) => (
                                        <TextInput
                                            style={[styles.fieldInput, errors.companyName && styles.fieldInputError]}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    )}
                                />
                                {errors.companyName && <Text style={styles.fieldError}>{errors.companyName.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_supplier_name')} <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="supplierName"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.supplierName && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Mohammed El Fassi"
                      placeholderTextColor="#AAAAAA"
                    />
                  )}
                />
                {errors.supplierName && <Text style={styles.fieldError}>{errors.supplierName.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_email')} <Text style={styles.required}>*</Text></Text>
                {/* <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="contact@bureautique.ma" placeholderTextColor="#AAAAAA" /> */}
                                <Controller
                                  control={control}
                                  name="email"
                                  render={({ field: { value, onChange, onBlur } }) => (
                                    <TextInput
                                      style={[styles.fieldInput, errors.email && styles.fieldInputError]}
                                      value={value}
                                      onChangeText={onChange}
                                      onBlur={onBlur}
                                      keyboardType="email-address"
                                      autoCapitalize="none"
                                    />
                                  )}
                                />
                                {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_phone')} <Text style={styles.required}>*</Text></Text>
                <Controller
                  control={control}
                  name="telephone"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={styles.fieldInput}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
                {errors.telephone && <Text style={styles.fieldError}>{errors.telephone.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_postal_code')}</Text>
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.postalCode && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="numeric"
                      placeholder="20000"
                      placeholderTextColor="#AAAAAA"
                    />
                  )}
                />
                {errors.postalCode && <Text style={styles.fieldError}>{errors.postalCode.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_city')}</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.city && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="Casablanca"
                      placeholderTextColor="#AAAAAA"
                    />
                  )}
                />
                {errors.city && <Text style={styles.fieldError}>{errors.city.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_commercial_register')}</Text>
                <Controller
                  control={control}
                  name="commercialRegister"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.commercialRegister && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="RC-00000"
                      placeholderTextColor="#AAAAAA"
                    />
                  )}
                />
                {errors.commercialRegister && <Text style={styles.fieldError}>{errors.commercialRegister.message}</Text>}
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <Controller
                  control={control}
                  name="ice"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.fieldInput, errors.ice && styles.fieldInputError]}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      placeholder="123456789123456"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.ice && <Text style={styles.fieldError}>{errors.ice.message}</Text>}
              </View>
            </View>

            <TouchableOpacity
            //   style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
            //   onPress={handleSave}
              style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
              onPress={handleSubmit(onSubmit as any)}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>{t('modal_confirm_text')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
          {upgradeWebViewElement}
    </Modal>
  );
};

// ─── Suppliers Screen ──────────────────────────────────────────────────────────
const Suppliers: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const { t } = useTranslation();
  const { getSuppliers } = useSupplier();

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isFirstSearch = useRef(true);

  const fetchData = async (params?: { like?: string }) => {
    const result = await getSuppliers(params);
    if (result.success) {
      setSuppliers(result.suppliers);
    } else {
      Alert.alert(t('error_title'), t('error_load_suppliers'));
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (isFirstSearch.current) { isFirstSearch.current = false; return; }
    if (!searchQuery.trim()) { fetchData(); return; }
    const timer = setTimeout(() => {
      setLoading(true);
      fetchData({ like: searchQuery.trim() });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const renderItem = ({ item }: { item: SupplierItem }) => (
    <TouchableOpacity
      style={styles.supplierCard}
      onPress={() => nav.navigate('Supplier Detail', { supplier: item })}
      activeOpacity={0.8}
    >
      <View style={styles.supplierAvatar}>
        <Text style={styles.supplierInitial}>{getInitials(item.company_name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.supplierName}>{item.company_name}</Text>
        <Text style={styles.supplierMeta}>{item.supplier_name}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => nav.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{t('title_suppliers')}</Text>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={t('placeholder_search_supplier')}
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <X size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={suppliers}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchData(); }}
              tintColor="#1E5BAC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('text_no_suppliers_found')}</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <CreateSupplierModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: { alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logo: { height: 48, width: 160 },
  titleText: { fontSize: 20, fontWeight: '700', color: '#1F2937' },

  // Search
  searchRow: {
    paddingHorizontal: 16, paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F3F4F6', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1F2937', paddingVertical: 0 },

  // List
  listContent: { padding: 12, paddingBottom: 100, gap: 8 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Supplier Card
  supplierCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  supplierAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  supplierInitial: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  supplierName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  supplierMeta: { fontSize: 12, color: '#6B7280' },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },

  // Modal
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
    minWidth: 80, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },
  createDateText: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 16 },

  // Form
  formCard: {
    borderRadius: 16,
    paddingVertical: 18,
    gap: 16,
    marginBottom: 16,
  },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
//   required: { color: '#1E5BAC' },
  fieldInput: {
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 14, color: '#1F2937',
    borderWidth: 1, borderColor: '#E5E7EB',
  },

  // Confirm button
  confirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  // Validation
  required: { color: '#DC2626' },
  fieldError: { fontSize: 12, color: '#DC2626', marginTop: 3, fontWeight: '500' },
  fieldInputError: { borderColor: '#DC2626', backgroundColor: '#FFF5F5' },
  modalConfirmBtnDisabled: { backgroundColor: '#93C5FD' },
  confirmBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0, elevation: 0 },
});

export default Suppliers;
