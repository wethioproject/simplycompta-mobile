import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  CheckCircle2,
  Heart,
  Mail,
  MapPin,
  Search,
  Settings,
  Shield,
  Sparkles,
  X,
} from 'lucide-react-native';
import pmeNetworkService from '../../services/pmeNetworkService';
import type { PmeCompany, PmeNetworkFilters, PmeNetworkSettings } from '../../types/pmeNetwork.types';
import FeatureLockCard from '../../components/common/FeatureLockCard';
import { canUseBusinessModule } from '../../utils/subscriptionHelpers';
import { useUpgradeWebView } from '../../utils/upgradeWebView';

const EMPTY_SETTINGS: PmeNetworkSettings = {
  directory_visible: false,
  directory_contact_allowed: false,
  directory_whatsapp_allowed: false,
  directory_email_allowed: false,
  directory_sector: '',
  directory_category: '',
  directory_city: '',
  directory_description: '',
  directory_is_supplier: true,
  directory_is_client: true,
};

const PmeNetwork: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const subscription = useSelector((state: any) => state.subscription.data);
  const { openUpgradeWebView, upgradeWebViewElement } = useUpgradeWebView();
  const canUseDirectory = canUseBusinessModule(subscription, 'pme_directory');
  const [companies, setCompanies] = useState<PmeCompany[]>([]);
  const [filtersData, setFiltersData] = useState<PmeNetworkFilters>({ sectors: [], cities: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | 'supplier' | 'client'>('all');
  const [sector, setSector] = useState('');
  const [category, setCategory] = useState('');
  const [city, setCity] = useState('');
  const [dropdown, setDropdown] = useState<'type' | 'sector' | 'category' | 'city' | null>(null);
  const [selected, setSelected] = useState<PmeCompany | null>(null);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [settings, setSettings] = useState<PmeNetworkSettings>(EMPTY_SETTINGS);
  const [savingSettings, setSavingSettings] = useState(false);

  const filteredParams = useMemo(() => ({
    search: search || undefined,
    type: type === 'all' ? undefined : type,
    sector: sector || undefined,
    category: category || undefined,
    city: city || undefined,
    per_page: 30,
  }), [category, city, search, sector, type]);

  const fetchNetwork = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = await pmeNetworkService.list(filteredParams);
      setCompanies(res.data.companies ?? []);
      setFiltersData(res.data.filters ?? { sectors: [], cities: [], categories: [] });
    } catch (e) {
      console.error('PME network error:', e);
      setError(t('pme_load_error', { defaultValue: 'Unable to load the directory.' }));
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }, [filteredParams]);

  const fetchSettings = async () => {
    try {
      const res = await pmeNetworkService.getSettings();
      setSettings({ ...EMPTY_SETTINGS, ...(res.data.settings ?? {}) });
    } catch (e) {
      console.error('PME settings error:', e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchNetwork(), search ? 250 : 0);
    return () => clearTimeout(timer);
  }, [fetchNetwork, search]);

  useEffect(() => { fetchSettings(); }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchNetwork(true);
    await fetchSettings();
    setRefreshing(false);
  };

  const saveAction = async (company: PmeCompany, action: 'saved' | 'interested' | 'skipped') => {
    try {
      await pmeNetworkService.action(company.id, action);
      setCompanies(prev => prev.map(item => item.id === company.id ? { ...item, viewer_action: action } : item));
      if (selected?.id === company.id) setSelected({ ...company, viewer_action: action });
    } catch {
      Alert.alert(t('error_title'), t('pme_action_error'));
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      const res = await pmeNetworkService.updateSettings(settings);
      setSettings(res.data.settings);
      setSettingsVisible(false);
      fetchNetwork(true);
      Alert.alert(t('success_title'), t('pme_settings_saved', { defaultValue: 'Your company visibility has been updated.' }));
    } catch {
      Alert.alert(t('error_title'), t('pme_settings_error'));
    } finally {
      setSavingSettings(false);
    }
  };

  const dropdownOptions = {
    type: [
      { value: 'all', label: t('pme_filter_all') },
      { value: 'supplier', label: t('pme_filter_supplier') },
      { value: 'client', label: t('pme_filter_client') },
    ],
    sector: [{ value: '', label: t('pme_filter_sector_all', { defaultValue: 'All sectors' }) }, ...filtersData.sectors.map(value => ({ value, label: value }))],
    category: [{ value: '', label: t('pme_filter_category_all', { defaultValue: 'All categories' }) }, ...filtersData.categories.map(value => ({ value, label: value }))],
    city: [{ value: '', label: t('pme_filter_city_all', { defaultValue: 'All cities' }) }, ...filtersData.cities.map(value => ({ value, label: value }))],
  };

  const setDropdownValue = (value: string) => {
    if (dropdown === 'type') setType(value as 'all' | 'supplier' | 'client');
    if (dropdown === 'sector') setSector(value);
    if (dropdown === 'category') setCategory(value);
    if (dropdown === 'city') setCity(value);
    setDropdown(null);
  };

  const getDropdownLabel = (key: 'type' | 'sector' | 'category' | 'city') => {
    if (key === 'type') return dropdownOptions.type.find(item => item.value === type)?.label ?? t('pme_filter_all');
    if (key === 'sector') return sector || t('pme_filter_sector_all', { defaultValue: 'All sectors' });
    if (key === 'category') return category || t('pme_filter_category_all', { defaultValue: 'All categories' });
    return city || t('pme_filter_city_all', { defaultValue: 'All cities' });
  };

  const enableDirectory = () => {
    setSettings(s => ({
      ...s,
      directory_visible: true,
      directory_contact_allowed: s.directory_contact_allowed || true,
      directory_is_supplier: s.directory_is_supplier ?? true,
      directory_is_client: s.directory_is_client ?? true,
    }));
  };

  const openContact = (company: PmeCompany) => {
    if (company.contact.whatsapp) {
      Linking.openURL(`https://wa.me/${company.contact.whatsapp.replace(/[^\d]/g, '')}`);
      return;
    }
    if (company.contact.email) {
      Linking.openURL(`mailto:${company.contact.email}`);
    }
  };

  const CompanyCard = ({ company, locked = false }: { company: PmeCompany; locked?: boolean }) => (
    <TouchableOpacity
      style={[styles.companyCard, locked && styles.companyCardLocked]}
      activeOpacity={0.82}
      onPress={() => locked ? openUpgradeWebView(subscription?.upgrade_url) : setSelected(company)}
    >
      <View style={styles.companyTop}>
        <View style={styles.logoBox}>
          {company.logo_url ? <Image source={{ uri: company.logo_url }} style={styles.logo} /> : <Building2 size={24} color="#1E5BAC" />}
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.companyName} numberOfLines={1}>{company.name}</Text>
            {company.verified && <CheckCircle2 size={15} color="#16A34A" />}
          </View>
          <Text style={styles.companyMeta} numberOfLines={1}>
            {[company.city, company.sector].filter(Boolean).join(' • ') || t('pme_meta_fallback')}
          </Text>
        </View>
      </View>
      {!!company.description && <Text style={styles.companyDescription} numberOfLines={2}>{company.description}</Text>}
      <View style={styles.cardFooter}>
        <View style={styles.typePills}>
          {company.types.supplier && <Text style={styles.typePill}>{t('pme_type_supplier')}</Text>}
          {company.types.client && <Text style={styles.typePill}>{t('pme_type_client')}</Text>}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.skipButton} onPress={() => locked ? openUpgradeWebView(subscription?.upgrade_url) : saveAction(company, 'skipped')}>
            <X size={17} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.heartButton} onPress={() => locked ? openUpgradeWebView(subscription?.upgrade_url) : saveAction(company, 'interested')}>
            <Heart size={17} color="#FFFFFF" fill="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t('pme_title')}</Text>
          <Text style={styles.subtitle}>{t('pme_subtitle')}</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsVisible(true)}>
          <Settings size={20} color="#1E5BAC" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#1E5BAC" />}
      >
        {!canUseDirectory && (
          <FeatureLockCard
            requiredPlan="Business"
            title={t('pme_locked_title', { defaultValue: 'PME Network is a Business feature' })}
            subtitle={t('pme_locked_subtitle', { defaultValue: 'Preview discovery, filters and contact actions, then unlock opt-in company networking.' })}
            onUpgrade={() => openUpgradeWebView(subscription?.upgrade_url)}
          />
        )}

        <View style={styles.privacyCard}>
          <Shield size={18} color="#1E5BAC" />
          <Text style={styles.privacyText}>{t('pme_privacy_note')}</Text>
        </View>

        <View style={styles.searchBox}>
          <Search size={18} color="#94A3B8" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder={t('pme_search_placeholder')}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {(['type', 'sector', 'category', 'city'] as const).map(key => (
            <TouchableOpacity key={key} style={styles.dropdownChip} onPress={() => setDropdown(key)} activeOpacity={0.82}>
              <Text style={styles.dropdownLabel} numberOfLines={1}>{getDropdownLabel(key)}</Text>
              <ChevronDownSmall />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loader}><ActivityIndicator color="#1E5BAC" /></View>
        ) : error ? (
          <View style={styles.emptyCard}>
            <Sparkles size={28} color="#1E5BAC" />
            <Text style={styles.emptyTitle}>{t('error_title')}</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        ) : companies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Sparkles size={28} color="#1E5BAC" />
            <Text style={styles.emptyTitle}>{t('pme_empty_title')}</Text>
            <Text style={styles.emptySubtitle}>{t('pme_empty_subtitle')}</Text>
          </View>
        ) : canUseDirectory ? (
          companies.map(company => <CompanyCard key={company.id} company={company} />)
        ) : (
          companies.slice(0, 3).map(company => <CompanyCard key={company.id} company={company} locked />)
        )}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          {selected && (
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity style={styles.iconButton} onPress={() => setSelected(null)}>
                  <ArrowLeft size={20} color="#111827" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selected.name}</Text>
              </View>
              <ScrollView contentContainerStyle={styles.modalContent}>
                <View style={styles.profileHero}>
                  <View style={styles.profileLogo}>
                    {selected.logo_url ? <Image source={{ uri: selected.logo_url }} style={styles.profileLogoImage} /> : <Building2 size={34} color="#1E5BAC" />}
                  </View>
                  <Text style={styles.profileName}>{selected.name}</Text>
                  <Text style={styles.profileMeta}>{[selected.city, selected.sector].filter(Boolean).join(' • ')}</Text>
                </View>
                {!!selected.description && <Text style={styles.profileDescription}>{selected.description}</Text>}
                {!!selected.ice && <Text style={styles.infoLine}>ICE: {selected.ice}</Text>}
                <View style={styles.profileActions}>
                  <TouchableOpacity style={styles.secondaryAction} onPress={() => saveAction(selected, 'saved')}>
                    <Text style={styles.secondaryActionText}>{t('pme_save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryAction} onPress={() => saveAction(selected, 'interested')}>
                    <Heart size={17} color="#FFFFFF" fill="#FFFFFF" />
                    <Text style={styles.primaryActionText}>{t('pme_interested')}</Text>
                  </TouchableOpacity>
                </View>
                {selected.contact.allowed && (selected.contact.whatsapp || selected.contact.email) && (
                  <TouchableOpacity style={styles.contactButton} onPress={() => openContact(selected)}>
                    <Mail size={18} color="#1E5BAC" />
                    <Text style={styles.contactButtonText}>{t('pme_contact')}</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      <Modal visible={settingsVisible} animationType="slide" onRequestClose={() => setSettingsVisible(false)}>
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setSettingsVisible(false)}>
              <ArrowLeft size={20} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('pme_settings_title')}</Text>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <SettingToggle label={t('pme_visible')} value={settings.directory_visible} onValueChange={value => setSettings(s => ({ ...s, directory_visible: value }))} />
            {!settings.directory_visible && (
              <TouchableOpacity style={styles.addCompanyCard} onPress={enableDirectory} activeOpacity={0.84}>
                <Sparkles size={18} color="#1E5BAC" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addCompanyTitle}>{t('pme_add_company_title', { defaultValue: 'Add my company to the directory' })}</Text>
                  <Text style={styles.addCompanyText}>{t('pme_add_company_text', { defaultValue: 'Enable visibility, complete sector, city and contact preferences, then save.' })}</Text>
                </View>
              </TouchableOpacity>
            )}
            <SettingToggle label={t('pme_allow_contact')} value={settings.directory_contact_allowed} onValueChange={value => setSettings(s => ({ ...s, directory_contact_allowed: value }))} />
            <SettingToggle label={t('pme_allow_whatsapp')} value={settings.directory_whatsapp_allowed} onValueChange={value => setSettings(s => ({ ...s, directory_whatsapp_allowed: value }))} />
            <SettingToggle label={t('pme_allow_email')} value={settings.directory_email_allowed} onValueChange={value => setSettings(s => ({ ...s, directory_email_allowed: value }))} />
            <Input label={t('pme_sector')} value={settings.directory_sector ?? ''} onChangeText={(value: string) => setSettings(s => ({ ...s, directory_sector: value }))} />
            <Input label={t('pme_category')} value={settings.directory_category ?? ''} onChangeText={(value: string) => setSettings(s => ({ ...s, directory_category: value }))} />
            <Input label={t('pme_city')} value={settings.directory_city ?? ''} onChangeText={(value: string) => setSettings(s => ({ ...s, directory_city: value }))} />
            <Input label={t('pme_description')} value={settings.directory_description ?? ''} multiline onChangeText={(value: string) => setSettings(s => ({ ...s, directory_description: value }))} />
            <TouchableOpacity style={styles.saveSettingsButton} onPress={saveSettings} disabled={savingSettings}>
              {savingSettings ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveSettingsText}>{t('pme_save_settings')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <Modal visible={!!dropdown} transparent animationType="fade" onRequestClose={() => setDropdown(null)}>
        <TouchableOpacity style={styles.dropdownBackdrop} activeOpacity={1} onPress={() => setDropdown(null)}>
          <View style={styles.dropdownSheet}>
            <Text style={styles.dropdownTitle}>{t('pme_filter_title', { defaultValue: 'Filter directory' })}</Text>
            <ScrollView style={{ maxHeight: 360 }}>
              {(dropdown ? dropdownOptions[dropdown] : []).map(option => (
                <TouchableOpacity
                  key={`${dropdown}-${option.value}`}
                  style={styles.dropdownOption}
                  onPress={() => setDropdownValue(option.value)}
                  activeOpacity={0.78}
                >
                  <Text style={styles.dropdownOptionText}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {upgradeWebViewElement}
    </SafeAreaView>
  );
};

const SettingToggle = ({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) => (
  <View style={styles.settingRow}>
    <Text style={styles.settingLabel}>{label}</Text>
    <Switch value={value} onValueChange={onValueChange} trackColor={{ true: '#BFDBFE', false: '#E5E7EB' }} thumbColor={value ? '#1E5BAC' : '#FFFFFF'} />
  </View>
);

const Input = ({ label, ...props }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput {...props} style={[styles.input, props.multiline && styles.textArea]} placeholderTextColor="#94A3B8" />
  </View>
);

const ChevronDownSmall = () => <ChevronDown size={15} color="#64748B" />;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  iconButton: { width: 38, height: 38, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },
  privacyCard: { flexDirection: 'row', gap: 10, backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1, borderRadius: 16, padding: 12, marginBottom: 12 },
  privacyText: { flex: 1, fontSize: 12, fontWeight: '600', color: '#1E3A8A', lineHeight: 17 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, height: 46, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 14, paddingRight: 8 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 999, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  filterChipActive: { backgroundColor: '#1E5BAC', borderColor: '#1E5BAC' },
  filterText: { fontSize: 12, fontWeight: '800', color: '#64748B' },
  filterTextActive: { color: '#FFFFFF' },
  dropdownChip: { maxWidth: 180, minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 12, borderRadius: 13, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  dropdownLabel: { maxWidth: 138, fontSize: 12, fontWeight: '800', color: '#334155' },
  loader: { padding: 40 },
  emptyCard: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#EEF2F7', padding: 28, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  emptySubtitle: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 18 },
  companyCard: { backgroundColor: '#FFFFFF', borderRadius: 22, borderWidth: 1, borderColor: '#EEF2F7', padding: 16, marginBottom: 14, shadowColor: '#0F172A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 18, elevation: 3 },
  companyCardLocked: { opacity: 0.72 },
  companyTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoBox: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  logo: { width: 48, height: 48 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  companyName: { flex: 1, fontSize: 15, fontWeight: '800', color: '#111827' },
  companyMeta: { fontSize: 12, fontWeight: '600', color: '#64748B', marginTop: 2 },
  companyDescription: { fontSize: 13, color: '#475569', lineHeight: 18, marginTop: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  typePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1 },
  typePill: { fontSize: 10, fontWeight: '800', color: '#1E5BAC', backgroundColor: '#EFF6FF', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 5 },
  actionRow: { flexDirection: 'row', gap: 8 },
  skipButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  heartButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#1E5BAC', alignItems: 'center', justifyContent: 'center' },
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EEF2F7' },
  modalTitle: { flex: 1, fontSize: 17, fontWeight: '800', color: '#111827' },
  modalContent: { padding: 16, paddingBottom: 36 },
  profileHero: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#EEF2F7', padding: 20, marginBottom: 12 },
  profileLogo: { width: 76, height: 76, borderRadius: 24, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: 12 },
  profileLogoImage: { width: 76, height: 76 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#111827', textAlign: 'center' },
  profileMeta: { fontSize: 13, color: '#64748B', marginTop: 4, textAlign: 'center' },
  profileDescription: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, fontSize: 14, color: '#475569', lineHeight: 20, marginBottom: 12 },
  infoLine: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 12 },
  profileActions: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  secondaryAction: { flex: 1, height: 48, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  secondaryActionText: { fontSize: 14, fontWeight: '800', color: '#1E5BAC' },
  primaryAction: { flex: 1, height: 48, borderRadius: 14, backgroundColor: '#1E5BAC', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryActionText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  contactButton: { height: 48, borderRadius: 14, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  contactButtonText: { fontSize: 14, fontWeight: '800', color: '#1E5BAC' },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EEF2F7' },
  settingLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827' },
  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: '800', color: '#64748B', marginBottom: 6 },
  input: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', paddingHorizontal: 12, color: '#111827', fontSize: 14 },
  textArea: { minHeight: 92, textAlignVertical: 'top', paddingTop: 12 },
  saveSettingsButton: { height: 50, borderRadius: 15, backgroundColor: '#1E5BAC', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveSettingsText: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  addCompanyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#EFF6FF', borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE', padding: 14, marginBottom: 12 },
  addCompanyTitle: { fontSize: 14, fontWeight: '900', color: '#111827' },
  addCompanyText: { fontSize: 12, color: '#475569', lineHeight: 17, marginTop: 3 },
  dropdownBackdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.32)', justifyContent: 'flex-end' },
  dropdownSheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18, paddingBottom: 28 },
  dropdownTitle: { fontSize: 16, fontWeight: '900', color: '#111827', marginBottom: 12 },
  dropdownOption: { minHeight: 48, borderRadius: 14, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#F8FAFC', marginBottom: 8 },
  dropdownOptionText: { fontSize: 14, fontWeight: '800', color: '#334155' },
});

export default PmeNetwork;
