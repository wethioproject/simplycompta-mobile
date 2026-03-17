import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Platform,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Phone, Mail, MapPin, User, LayoutGrid, CreditCard, FileText, Trash2 } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

const EditClientModal: React.FC<{
  visible: boolean;
  clientData: any;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}> = ({ visible, clientData, onClose, onUpdated }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [ice, setIce] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && clientData) {
      setCompanyName(clientData.company_name ?? '');
      setClientName(clientData.client_name ?? '');
      setEmail(clientData.email ?? '');
      setTelephone(clientData.telephone ?? '');
      setPostalCode(clientData.postal_code ?? '');
      setCity(clientData.city ?? '');
      setCommercialRegister(clientData.commercial_register ?? '');
      setIce(clientData.ice ?? '');
    }
  }, [visible, clientData]);

  const handleUpdate = async () => {
    if (!companyName) { Alert.alert(t('alert_field_required'), t('message_company_name_required')); return; }
    setSaving(true);
    try {
      const res = await api.post(`${Api_Endpoints.createCustomerClient}/${clientData.id}`, {
        _method: 'PUT',
        company_name: companyName,
        client_name: clientName,
        email,
        telephone,
        postal_code: postalCode,
        city,
        commercial_register: commercialRegister,
        ice,
      });
      const updated = res.data?.data ?? { ...clientData, company_name: companyName, client_name: clientName, email, telephone, postal_code: postalCode, city, commercial_register: commercialRegister, ice };
      Alert.alert(t('success_title'), t('success_client_updated'));
      onUpdated(updated);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la mise à jour du client.';
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E5BAC" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('title_edit_client')}</Text>
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
                <Text style={styles.fieldLabel}>{t('label_company_name')}</Text>
                <TextInput style={styles.fieldInput} value={companyName} onChangeText={setCompanyName} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_contact_name')}</Text>
                <TextInput style={styles.fieldInput} value={clientName} onChangeText={setClientName} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_email')}</Text>
                <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_phone')}</Text>
                <TextInput style={styles.fieldInput} value={telephone} onChangeText={setTelephone} keyboardType="phone-pad" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_postal_code')}</Text>
                <TextInput style={styles.fieldInput} value={postalCode} onChangeText={setPostalCode} keyboardType="numeric" />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_city')}</Text>
                <TextInput style={styles.fieldInput} value={city} onChangeText={setCity} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_commercial_register')}</Text>
                <TextInput style={styles.fieldInput} value={commercialRegister} onChangeText={setCommercialRegister} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <TextInput style={styles.fieldInput} value={ice} onChangeText={setIce} />
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
                : <Text style={styles.confirmBtnText}>Enregistrer les modifications</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

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
      const res = await api.get(`${Api_Endpoints.customerClient}/${routeClient.id}`);
      if (res.data?.success) {
        setClientData(res.data.data?.client ?? res.data.data);
        setInvoiceCount(res.data.data?.invoice_count ?? 0);
        setTotalPriceHt(res.data.data?.total_price_ht ?? 0);
      } else setClientData(routeClient);
    } catch (e) {
      Alert.alert(t('error_title'), t('error_load_client_details'));
      setClientData(routeClient);
    } finally {
      setLoadingDetail(false);
    }
  };

  console.log('clientDataclientData22', clientData)

  useEffect(() => { fetchClient(); }, []);

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_client'),
      t('message_confirm_delete_client', { name: clientData?.company_name ?? '' }),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'), style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(`${Api_Endpoints.createCustomerClient}/${clientData.id}`);
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
  const email = clientData?.email ?? '—';
  const phone = clientData?.telephone ?? '—';
  const postalCity = `${clientData?.postal_code ?? ''} ${clientData?.city ?? ''}`.trim() || '—';
  const registreCommerce = clientData?.commercial_register ?? '—';
  const ice = clientData?.ice ?? '—';
  const initial = companyName !== '—' ? companyName.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{t('title_client_sheet')}</Text>
          <View style={{ flex: 1 }} />
          {!loadingDetail && (
            <TouchableOpacity style={styles.editButton} onPress={() => setShowEditModal(true)} activeOpacity={0.7}>
              <Edit2 size={18} color="#1E5BAC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loadingDetail ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Card */}
        <View style={styles.card}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.contactName}>{contactName}</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.callBtn, phone === '—' && { opacity: 0.5 }]}
              activeOpacity={0.85}
              onPress={() => phone !== '—' && Linking.openURL(`tel:${phone}`)}
            >
              <Phone size={16} color="#FFFFFF" />
              <Text style={styles.callBtnText}>{t('button_call')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emailBtn, email === '—' && { opacity: 0.5 }]}
              activeOpacity={0.85}
              onPress={() => {
                if (email === '—') return;
                Linking.openURL(`mailto:${email}`).catch(() =>
                  Alert.alert(t('error_title'), t('error_open_email_app'))
                );
              }}
            >
              <Mail size={16} color="#374151" />
              <Text style={styles.emailBtnText}>{t('button_email')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coordonnées Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <User size={18} color="#1E5BAC" />
            <Text style={styles.sectionTitle}>{t('section_coordinates')}</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Mail size={16} color="#6B7280" />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>{t('label_email')}</Text>
              <Text style={styles.infoValue}>{email}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoIconBox}>
              <Phone size={16} color="#6B7280" />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>{t('label_phone')}</Text>
              <Text style={styles.infoValue}>{phone}</Text>
            </View>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconBox}>
              <MapPin size={16} color="#6B7280" />
            </View>
            <View style={styles.infoTextBlock}>
              <Text style={styles.infoLabel}>{t('label_address')}</Text>
              <Text style={styles.infoValue}>{postalCity}</Text>
            </View>
          </View>
        </View>

        {/* Informations légales Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <LayoutGrid size={18} color="#1E5BAC" />
            <Text style={styles.sectionTitle}>{t('section_legal_info')}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>{t('label_rc')}</Text>
            <Text style={styles.legalValue}>{registreCommerce}</Text>
          </View>
          <View style={styles.legalRow}>
            <Text style={styles.legalLabel}>{t('label_ice')}</Text>
            <Text style={styles.legalValue}>{ice}</Text>
          </View>
          <View style={[styles.legalRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.legalLabel}>{t('label_status')}</Text>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>{t('status_active')}</Text>
            </View>
          </View>
        </View>

        {/* Finances Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <CreditCard size={18} color="#1E5BAC" />
            <Text style={styles.sectionTitle}>{t('section_finances')}</Text>
          </View>
          <View style={styles.financeStatsRow}>
            <View style={styles.statBoxBlue}>
              <Text style={styles.statLabel}>{t('label_revenue')}</Text>
              <Text style={styles.statValueBlue}>{totalPriceHt.toLocaleString('fr-FR')} MAD</Text>
            </View>
            <View style={styles.statBoxOrange}>
              <Text style={styles.statLabelOrange}>{t('label_pending')}</Text>
              <Text style={styles.statValueOrange}>{invoiceCount} facture{invoiceCount !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.historiqueBtn}
            onPress={() => navigation.navigate('Account Statement', { client: clientData })}
            activeOpacity={0.85}
          >
            <FileText size={16} color="#1E5BAC" />
            <Text style={styles.historiqueBtnText}>{t('button_view_history')}</Text>
          </TouchableOpacity>
        </View>

        {/* Delete */}
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
        onUpdated={(updated) => setClientData(updated)}
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
  editButton: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
  },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // Card
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },

  // Hero
  avatarCircle: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: 12,
  },
  avatarInitial: { fontSize: 32, fontWeight: '700', color: '#1E5BAC' },
  companyName: { fontSize: 20, fontWeight: '700', color: '#1F2937', textAlign: 'center', marginBottom: 4 },
  contactName: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 18 },
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#1E5BAC', borderRadius: 10, paddingVertical: 13,
  },
  callBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
  emailBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 13,
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  emailBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },

  // Section Header
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 14, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },

  // Info rows
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  infoIconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  infoTextBlock: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },

  // Legal rows
  legalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  legalLabel: { fontSize: 14, color: '#6B7280' },
  legalValue: { fontSize: 14, fontWeight: '500', color: '#1F2937', textAlign: 'right', flex: 1, marginLeft: 16 },
  activeBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4,
  },
  activeBadgeText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },

  // Finances
  financeStatsRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  statBoxBlue: {
    flex: 1, backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14,
  },
  statLabel: { fontSize: 12, color: '#3B82F6', marginBottom: 6 },
  statValueBlue: { fontSize: 18, fontWeight: '700', color: '#1E5BAC' },
  statBoxOrange: {
    flex: 1, backgroundColor: '#FFF7ED', borderRadius: 12, padding: 14,
  },
  statLabelOrange: { fontSize: 12, color: '#EA580C', marginBottom: 6 },
  statValueOrange: { fontSize: 18, fontWeight: '700', color: '#EA580C' },
  historiqueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1.5, borderColor: '#BFDBFE', borderRadius: 10,
    paddingVertical: 13,
  },
  historiqueBtnText: { fontSize: 14, fontWeight: '600', color: '#1E5BAC' },

  // Delete
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },

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

export default ClientDetail;
