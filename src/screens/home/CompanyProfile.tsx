import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Save, Building2, Upload, ChevronDown, X, ImageIcon, PenLine, Camera, ArrowLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const COMPANY_TYPES = [
  'Auto-entrepreneur',
  'Entreprise individuelle',
  'Société',
  'Association',
];

const CompanyProfile: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [billingName, setBillingName] = useState('');
  const [siret, setSiret] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');

  const [patente, setPatente] = useState('');
  const [rc, setRc] = useState('');
  const [ice, setIce] = useState('');
  const [ifField, setIfField] = useState('');
  const [cnss, setCnss] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [showCompanyTypePicker, setShowCompanyTypePicker] = useState(false);

  const [logo, setLogo] = useState<any>(null);
  const [signature, setSignature] = useState<any>(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(null);
  const [existingSignatureUrl, setExistingSignatureUrl] = useState<string | null>(null);
  const [activeImagePicker, setActiveImagePicker] = useState<'logo' | 'signature' | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get(Api_Endpoints.customerProfile);
      const d = res.data?.data ?? {};
      console.log('plkllkl', d)
      setBillingName(d.billing_name ?? '');
      setSiret(d.billing_phone ?? '');
      setVatNumber(d.vat_number ?? '');
      setAddress(d.billing_address ?? '');
      // GET returns billing_zip, PUT validates billing_zip_code
      setZipCode(d.billing_zip ?? d.billing_zip_code ?? '');
      setCity(d.billing_city ?? '');
      setWebsite(d.website ?? '');
      setPatente(d.patent_number ?? '');
      setRc(d.rc_number ?? '');
      setIce(d.ice_number ?? '');
      setIfField(d.if_number ?? '');
      setCnss(d.cnss ?? '');
      setCompanyType(d.company_type ?? '');
      setExistingLogoUrl(d.avatar_url ?? null);
      setExistingSignatureUrl(d.signature_url ?? null);
    } catch (e: any) {
      Alert.alert(t('error_title'), e?.response?.data?.message ?? t('error_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleImageSourceSelect = (source: 'camera' | 'gallery') => {
    const field = activeImagePicker;
    setActiveImagePicker(null);
    const options = { mediaType: 'photo' as const, saveToPhotos: false, quality: 0.8 as 0.8 };
    const callback = (response: any) => {
      if (response.didCancel || response.errorCode) return;
      const asset = response.assets?.[0];
      if (!asset?.uri) return;
      const file = {
        uri: asset.uri,
        fileCopyUri: asset.uri,
        name: asset.fileName ?? `photo_${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };
      if (field === 'logo') setLogo(file);
      else setSignature(file);
    };
    // Delay until the modal slide-out animation has fully completed,
    // otherwise iOS silently drops the native picker on the 2nd+ call.
    setTimeout(() => {
      if (source === 'camera') launchCamera(options, callback);
      else launchImageLibrary(options, callback);
    }, 350);
  };

  const handlePickLogo = async () => {
    setActiveImagePicker('logo');
  };

  const handlePickSignature = async () => {
    setActiveImagePicker('signature');
  };

  const handleSave = async () => {
    if (!billingName.trim()) {
      Alert.alert(t('field_required'), t('error_company_name_required'));
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('billing_name', billingName.trim());
      // formData.append('billing_phone', siret.trim());
      // formData.append('vat_number', vatNumber.trim());
      formData.append('billing_address', address.trim());
      formData.append('billing_zip', zipCode.trim());
      formData.append('billing_city', city.trim());
      formData.append('website', website.trim());
      formData.append('patent_number', patente.trim());
      formData.append('rc_number', rc.trim());
      formData.append('ice_number', ice.trim());
      formData.append('if_number', ifField.trim());
      formData.append('cnss', cnss.trim());
      formData.append('company_type', companyType);

      if (logo) {
        formData.append('avatar', {
          uri: logo.fileCopyUri || logo.uri,
          type: logo.type || 'image/jpeg',
          name: logo.name || 'logo.jpg',
        } as any);
      }
      if (signature) {
        formData.append('signature', {
          uri: signature.fileCopyUri || signature.uri,
          type: signature.type || 'image/jpeg',
          name: signature.name || 'signature.jpg',
        } as any);
      }

      await api.post(Api_Endpoints.customerProfile, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert(t('success_title'), t('success_company_updated'));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? t('error_company_update');
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3B6FD4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section: Identité visuelle */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('company_visual_identity')}</Text>

            <View style={styles.uploadRow}>
              {/* Logo */}
              <View style={styles.uploadCol}>
                <Text style={styles.uploadLabel}>{t('company_logo')}</Text>
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickLogo}
                  activeOpacity={0.75}
                >
                  {logo ? (
                    <>
                      <Image
                        source={{ uri: logo.fileCopyUri || logo.uri }}
                        style={styles.uploadPreview}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.uploadClearBtn}
                        onPress={() => setLogo(null)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : existingLogoUrl ? (
                    <>
                      <Image
                        source={{ uri: existingLogoUrl }}
                        style={styles.uploadPreview}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.uploadClearBtn}
                        onPress={() => setExistingLogoUrl(null)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <ImageIcon size={26} color="#3B6FD4" />
                      <Text style={styles.uploadPlaceholderText}>{t('button_choose')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {logo && (
                  <Text style={styles.uploadFileName} numberOfLines={1}>
                    {logo.name}
                  </Text>
                )}
                {!logo && existingLogoUrl && (
                  <Text style={styles.uploadFileName} numberOfLines={1}>
                    {t('current_logo')}
                  </Text>
                )}
              </View>

              {/* Signature */}
              <View style={styles.uploadCol}>
                <Text style={styles.uploadLabel}>{t('company_signature')}</Text>
                <TouchableOpacity
                  style={styles.uploadBox}
                  onPress={handlePickSignature}
                  activeOpacity={0.75}
                >
                  {signature ? (
                    <>
                      <Image
                        source={{ uri: signature.fileCopyUri || signature.uri }}
                        style={styles.uploadPreview}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.uploadClearBtn}
                        onPress={() => setSignature(null)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : existingSignatureUrl ? (
                    <>
                      <Image
                        source={{ uri: existingSignatureUrl }}
                        style={styles.uploadPreview}
                        resizeMode="contain"
                      />
                      <TouchableOpacity
                        style={styles.uploadClearBtn}
                        onPress={() => setExistingSignatureUrl(null)}
                        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                      >
                        <X size={12} color="#FFFFFF" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <PenLine size={26} color="#3B6FD4" />
                      <Text style={styles.uploadPlaceholderText}>{t('button_choose')}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {signature && (
                  <Text style={styles.uploadFileName} numberOfLines={1}>
                    {signature.name}
                  </Text>
                )}
                {!signature && existingSignatureUrl && (
                  <Text style={styles.uploadFileName} numberOfLines={1}>
                    {t('current_signature')}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* ── Section: Informations de l'entreprise ─────────────────────── */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.cardTitle}>{t('company_info_title')}</Text>

            {/* Company avatar */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Building2 size={32} color="#FFFFFF" />
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {billingName.trim() || t('your_company')}
                </Text>
                <Text style={styles.avatarSub} numberOfLines={1}>
                  {city.trim() || t('city_not_provided')}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Nom de l'entreprise */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('company_name')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={billingName}
                onChangeText={setBillingName}
                placeholder={t('company_name_placeholder')}
                placeholderTextColor="#AAAAAA"
              />
            </View>

            {/* Type d'entreprise */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('company_type')}</Text>
              <TouchableOpacity
                style={styles.pickerRow}
                onPress={() => setShowCompanyTypePicker(true)}
                activeOpacity={0.8}
              >
                <Text style={companyType ? styles.pickerValueText : styles.pickerPlaceholderText}>
                  {companyType || t('company_type_placeholder')}
                </Text>
                <ChevronDown size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* SIRET + N° TVA side by side */}
            {/* <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_siret')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={siret}
                  onChangeText={setSiret}
                  placeholder={t('placeholder_siret')}
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_vat')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={vatNumber}
                  onChangeText={setVatNumber}
                  placeholder={t('placeholder_vat')}
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="characters"
                />
              </View>
            </View> */}

            {/* Adresse */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_address')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={address}
                onChangeText={setAddress}
                placeholder={t('placeholder_address')}
                placeholderTextColor="#AAAAAA"
              />
            </View>

            {/* Code postal + Ville side by side */}
            <View style={styles.rowFields}>
              <View style={[styles.halfField, { flex: 0.9 }]}>
                <Text style={styles.fieldLabel}>{t('label_zip_code')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder={t('placeholder_zip_code')}
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.halfField, { flex: 1.1 }]}>
                <Text style={styles.fieldLabel}>{t('label_city')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t('placeholder_city')}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </View>

            {/* Site web */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_website')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={website}
                onChangeText={setWebsite}
                placeholder={t('placeholder_website')}
                placeholderTextColor="#AAAAAA"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.divider} />

            {/* ── Section: Identifiants fiscaux & légaux ─────────────────── */}
            <Text style={styles.sectionSubtitle}>{t('section_fiscal_identifiers')}</Text>

            {/* Patente + RC */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_patente')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={patente}
                  onChangeText={setPatente}
                  placeholder={t('placeholder_patente')}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_cnss')}</Text>
                <TextInput
                style={styles.fieldInput}
                value={cnss}
                onChangeText={setCnss}
                placeholder={t('placeholder_cnss')}
                placeholderTextColor="#AAAAAA"
                keyboardType="numeric"
              />
              </View>
            </View>

            {/* ICE + IF */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ice}
                  onChangeText={setIce}
                  placeholder={t('placeholder_ice')}
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_if')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ifField}
                  onChangeText={setIfField}
                  placeholder={t('placeholder_if')}
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* CNSS */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_rc')}</Text>
              <TextInput
                  style={styles.fieldInput}
                  value={rc}
                  onChangeText={setRc}
                  placeholder={t('placeholder_rc')}
                  placeholderTextColor="#AAAAAA"
                />
            </View>

            <View style={styles.divider} />

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{t('button_cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={17} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>{t('button_save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Image Source Picker Modal ─────────────────────────────────────── */}
      <Modal
        visible={!!activeImagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveImagePicker(null)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setActiveImagePicker(null)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerSheetTitle}>
              {activeImagePicker === 'logo' ? t('company_logo') : t('company_signature')}
            </Text>
            {/* <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleImageSourceSelect('camera')}
              activeOpacity={0.7}
            >
              <Camera size={18} color="#3B6FD4" style={{ marginRight: 4 }} />
              <Text style={styles.pickerOptionText}>{t('button_take_photo')}</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              style={styles.pickerOption}
              onPress={() => handleImageSourceSelect('gallery')}
              activeOpacity={0.7}
            >
              <ImageIcon size={18} color="#3B6FD4" style={{ marginRight: 4 }} />
              <Text style={styles.pickerOptionText}>{t('button_choose_from_gallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.pickerOption, { borderBottomWidth: 0 }]}
              onPress={() => setActiveImagePicker(null)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pickerOptionText, { color: '#9CA3AF' }]}>{t('button_cancel')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Company Type Picker Modal ─────────────────────────────────────── */}
      <Modal
        visible={showCompanyTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCompanyTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCompanyTypePicker(false)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerSheetTitle}>{t('company_type')}</Text>
            {COMPANY_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.pickerOption}
                onPress={() => { setCompanyType(type); setShowCompanyTypePicker(false); }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerOptionText, companyType === type && styles.pickerOptionSelected]}>
                  {type}
                </Text>
                {companyType === type && <Text style={styles.pickerCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },

  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logo: { height: 44, width: 150 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 24,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B6FD4',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  uploadRow: {
    flexDirection: 'row',
    gap: 16,
  },
  uploadCol: {
    flex: 1,
    gap: 8,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555577',
  },
  uploadBox: {
    height: 110,
    borderWidth: 1.5,
    borderColor: '#D0D9F0',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  uploadPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  uploadPlaceholderText: {
    fontSize: 12,
    color: '#3B6FD4',
    fontWeight: '600',
  },
  uploadPreview: {
    width: '100%',
    height: '100%',
  },
  uploadClearBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadFileName: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3B6FD4',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarMeta: { flex: 1 },
  avatarName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  avatarSub: {
    fontSize: 13,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginVertical: 20,
  },

  // Fields
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
    gap: 6,
  },
  fieldBlock: {
    gap: 6,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555577',
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#E2E6F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    fontSize: 14,
    color: '#1A1A2E',
    backgroundColor: '#FAFBFF',
  },

  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: '#E2E6F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    backgroundColor: '#FAFBFF',
  },
  pickerPlaceholderText: { fontSize: 14, color: '#AAAAAA', flex: 1 },
  pickerValueText: { fontSize: 14, color: '#1A1A2E', fontWeight: '500', flex: 1 },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  pickerSheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    paddingHorizontal: 12,
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  pickerOptionText: { fontSize: 15, color: '#374151' },
  pickerOptionSelected: { color: '#3B6FD4', fontWeight: '600' },
  pickerCheck: { fontSize: 15, color: '#3B6FD4', fontWeight: '700' },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D0D5E8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444466',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B6FD4',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CompanyProfile;
