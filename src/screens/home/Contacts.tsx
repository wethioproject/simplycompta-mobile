import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  RefreshControl,
  Pressable,
  Modal,
} from 'react-native';
import {
  Plus,
  Search,
  X,
  ChevronRight,
  SlidersHorizontal,
  Check,
  Clock,
  CheckCircle2,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { appLogoIcon } from '../../assets/icons';
import { ClientItem } from '../../types/client.types';
import { SupplierItem } from './Suppliers';
import { getClients, searchClients } from '../../services/client.service';
import { useSupplier } from '../../hooks/useSupplier';
import { CreateClientModal } from '../../components/clients/CreateClientModal';
import { CreateSupplierModal } from './Suppliers';


type ContactTab = 'clients' | 'suppliers';
type SortOption = 'name-asc' | 'name-desc' | 'amount-asc' | 'amount-desc';
type StackNavigation = StackNavigationProp<any>;


const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  if (words[0].length >= 2) return words[0].substring(0, 2).toUpperCase();
  return words[0][0].toUpperCase();
};




const Contacts: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const { t } = useTranslation();
  const { getSuppliers } = useSupplier();


  const [activeTab, setActiveTab] = useState<ContactTab>('clients');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showCreateSupplierModal, setShowCreateSupplierModal] = useState(false);


  const [clients, setClients] = useState<ClientItem[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsRefreshing, setClientsRefreshing] = useState(false);

  const [suppliers, setSuppliers] = useState<SupplierItem[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [suppliersRefreshing, setSuppliersRefreshing] = useState(false);

  const isFirstSearch = useRef(true);


  const fetchClients = async (query?: string) => {
    try {
      const data = query ? await searchClients(query) : await getClients();
      setClients(data);
    } catch {
      Alert.alert(t('error_title'), t('error_load_clients'));
    } finally {
      setClientsLoading(false);
      setClientsRefreshing(false);
    }
  };

  const fetchSuppliers = async (query?: string) => {
    const result = await getSuppliers(query ? { like: query } : undefined);
    if (result.success) {
      setSuppliers(result.suppliers);
    } else {
      Alert.alert(t('error_title'), t('error_load_suppliers'));
    }
    setSuppliersLoading(false);
    setSuppliersRefreshing(false);
  };


  useEffect(() => {
    fetchClients();
    fetchSuppliers();
  }, []);


  useEffect(() => {
    if (isFirstSearch.current) { isFirstSearch.current = false; return; }
    if (!searchQuery.trim()) {
      fetchClients();
      fetchSuppliers();
      return;
    }
    const timer = setTimeout(() => {
      if (activeTab === 'clients') {
        setClientsLoading(true);
        fetchClients(searchQuery.trim());
      } else {
        setSuppliersLoading(true);
        fetchSuppliers(searchQuery.trim());
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, activeTab]);


  const sortedClients = [...clients].sort((a, b) => {
    if (sortOption === 'name-asc')    return a.company_name.localeCompare(b.company_name);
    if (sortOption === 'name-desc')   return b.company_name.localeCompare(a.company_name);
    if (sortOption === 'amount-desc') return (b.total_revenue_ht ?? 0) - (a.total_revenue_ht ?? 0);
    if (sortOption === 'amount-asc')  return (a.total_revenue_ht ?? 0) - (b.total_revenue_ht ?? 0);
    return 0;
  });

  const sortedSuppliers = [...suppliers].sort((a, b) => {
    if (sortOption === 'name-asc')    return a.company_name.localeCompare(b.company_name);
    if (sortOption === 'name-desc')   return b.company_name.localeCompare(a.company_name);
    if (sortOption === 'amount-desc') return (b.total_ttc ?? 0) - (a.total_ttc ?? 0);
    if (sortOption === 'amount-asc')  return (a.total_ttc ?? 0) - (b.total_ttc ?? 0);
    return 0;
  });


  const isLoading = activeTab === 'clients' ? clientsLoading : suppliersLoading;
  const isRefreshing = activeTab === 'clients' ? clientsRefreshing : suppliersRefreshing;

  const handleRefresh = () => {
    if (activeTab === 'clients') {
      setClientsRefreshing(true);
      fetchClients(searchQuery.trim() || undefined);
    } else {
      setSuppliersRefreshing(true);
      fetchSuppliers(searchQuery.trim() || undefined);
    }
  };

  const handleTabSwitch = (tab: ContactTab) => {
    setActiveTab(tab);
    setSearchQuery('');
    isFirstSearch.current = true;
  };


  const renderClientItem = ({ item }: { item: ClientItem }) => {
    const revenue = item.total_revenue_ht ?? 0;
    const lateCount = item.late_invoices_count ?? 0;
    const displayRevenue = lateCount <= 0 ? 0 : revenue;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('Client Detail', { client: item })}
        activeOpacity={0.8}
      >
        <View style={styles.clientAvatar}>
          <Text style={[styles.avatarText, { color: '#1E5BAC' }]}>{getInitials(item.company_name)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.company_name}</Text>
          <Text style={styles.cardMeta}>{item.client_name}</Text>
        </View>
        {
          lateCount > 0 && (
            <View style={styles.cardRight}>
              <View style={lateCount > 0 ? styles.badgeLate : styles.badgePending}>
                <Clock size={14} color={lateCount > 0 ? '#EF4444' : '#EA580C'} />
                <Text style={lateCount > 0 ? styles.badgeLateText : styles.badgePendingText}>{lateCount} {t('contacts_pending')}</Text>
              </View>
              <Text style={displayRevenue > 0 ? styles.amountGreen : styles.amountGray}>+{displayRevenue.toLocaleString('fr-FR')} MAD</Text>
            </View>
          )
        }

      </TouchableOpacity>
    );
  };

  const renderSupplierItem = ({ item }: { item: SupplierItem }) => {
    const total = item.total_ttc ?? 0;
    const lateCount = item.expenses_count ?? 0;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => nav.navigate('Supplier Detail', { supplier: item })}
        activeOpacity={0.8}
      >
        <View style={styles.supplierAvatar}>
          <Text style={[styles.avatarText, { color: '#EA580C' }]}>{getInitials(item.company_name)}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.company_name}</Text>
          <Text style={styles.cardMeta}>{item.supplier_name}</Text>
        </View>
        <View style={styles.cardRight}>
          {lateCount > 0 ? (
            <View style={styles.badgePending}>
              <Clock size={14} color="#EA580C" />
              <Text style={styles.badgePendingText}>{lateCount} {t('label_expenses')}</Text>
            </View>
          ) : (
            <View style={styles.badgePaid}>
              <CheckCircle2 size={14} color="#16A34A" />
              <Text style={styles.badgePaidText}>{t('contacts_settle')}</Text>
            </View>
          )}
          {total > 0 && <Text style={styles.amountRed}>-{total.toLocaleString('fr-FR')} MAD</Text>}
        </View>
      </TouchableOpacity>
    );
  };


  const SortMenu = () => (
    <Modal
      visible={showSortMenu}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortMenu(false)}
    >
      <Pressable style={styles.sortBackdrop} onPress={() => setShowSortMenu(false)}>
        <View style={styles.sortMenu}>
          {/* Header */}
          <View style={styles.sortMenuHeader}>
            <Text style={styles.sortMenuTitle}>{t('contacts_sort_by')}</Text>
          </View>

          {/* Alphabetical section */}
          <View style={styles.sortMenuSection}>
            <Text style={styles.sortMenuSectionLabel}>{t('contacts_sort_alphabetical')}</Text>
            <TouchableOpacity
              style={styles.sortMenuItem}
              onPress={() => { setSortOption('name-asc'); setShowSortMenu(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sortMenuItemText}>A → Z</Text>
              {sortOption === 'name-asc' && <Check size={16} color="#1E5BAC" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortMenuItem}
              onPress={() => { setSortOption('name-desc'); setShowSortMenu(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sortMenuItemText}>Z → A</Text>
              {sortOption === 'name-desc' && <Check size={16} color="#1E5BAC" />}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.sortMenuDivider} />

          {/* Amount section */}
          <View style={styles.sortMenuSection}>
            <Text style={styles.sortMenuSectionLabel}>{t('contacts_sort_amount')}</Text>
            <TouchableOpacity
              style={styles.sortMenuItem}
              onPress={() => { setSortOption('amount-desc'); setShowSortMenu(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sortMenuItemText}>{t('contacts_sort_amount_high')}</Text>
              {sortOption === 'amount-desc' && <Check size={16} color="#1E5BAC" />}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortMenuItem}
              onPress={() => { setSortOption('amount-asc'); setShowSortMenu(false); }}
              activeOpacity={0.7}
            >
              <Text style={styles.sortMenuItemText}>{t('contacts_sort_amount_low')}</Text>
              {sortOption === 'amount-asc' && <Check size={16} color="#1E5BAC" />}
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );


  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        {/* Top row: sort | logo | add */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={[styles.iconBtn, showSortMenu && styles.iconBtnActive]}
            onPress={() => setShowSortMenu(true)}
            activeOpacity={0.8}
          >
            <SlidersHorizontal size={20} color={showSortMenu ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>

          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />

          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (activeTab === 'clients') setShowCreateClientModal(true);
              else setShowCreateSupplierModal(true);
            }}
            activeOpacity={0.85}
          >
            <Plus size={22} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'clients' && styles.tabActive]}
            onPress={() => handleTabSwitch('clients')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'clients' && styles.tabTextActive]}>
              {t('tab_clients')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'suppliers' && styles.tabActive]}
            onPress={() => handleTabSwitch('suppliers')}
            activeOpacity={0.85}
          >
            <Text style={[styles.tabText, activeTab === 'suppliers' && styles.tabTextActive]}>
              {t('tab_suppliers')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'clients'
                ? t('placeholder_search_client')
                : t('placeholder_search_supplier')
            }
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


      <SortMenu />


      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : activeTab === 'clients' ? (
        <FlatList<ClientItem>
          data={sortedClients}
          renderItem={renderClientItem}
          keyExtractor={item => `client-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#1E5BAC"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('text_no_clients_found')}</Text>
            </View>
          }
        />
      ) : (
        <FlatList<SupplierItem>
          data={sortedSuppliers}
          renderItem={renderSupplierItem}
          keyExtractor={item => `supplier-${item.id}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
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

      {/* Create modals */}
      <CreateClientModal
        visible={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onCreated={() => fetchClients()}
      />
      <CreateSupplierModal
        visible={showCreateSupplierModal}
        onClose={() => setShowCreateSupplierModal(false)}
        onCreated={() => fetchSuppliers()}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8EAF6' },


  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  logo: { height: 40, width: 140 },

  // Icon buttons (sort / add)
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnActive: {
    backgroundColor: '#1E5BAC',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },


  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EAF6',
    borderRadius: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#1E5BAC',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  searchRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },


  sortBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-start',
    paddingTop: 140, // position below header
    paddingHorizontal: 16,
  },
  sortMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  sortMenuHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sortMenuTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
  },
  sortMenuSection: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sortMenuDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 8,
  },
  sortMenuSectionLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  sortMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  sortMenuItemText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },


  listContent: { padding: 16, paddingBottom: 100, gap: 10 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },


  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  cardMeta: { fontSize: 12, color: '#6B7280' },


  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  supplierAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFEDD5',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
//   avatarText: { fontSize: 16, fontWeight: '700', color: '#1E5BAC' },
  avatarText: { fontSize: 16, fontWeight: '700' },


  cardRight: { alignItems: 'flex-end', gap: 4, flexShrink: 0 },


  badgePaid: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#F0FDF4', borderRadius: 8,
  },
  badgePaidText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },


  badgePending: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#FFF7ED', borderRadius: 8,
  },
  badgePendingText: { fontSize: 11, fontWeight: '600', color: '#EA580C' },


  badgeLate: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#FEF2F2', borderRadius: 8,
  },
  badgeLateText: { fontSize: 11, fontWeight: '600', color: '#EF4444' },

  badgeSettled: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#F0FDF4', borderRadius: 8,
  },
  badgeSettledText: { fontSize: 11, fontWeight: '600', color: '#16A34A' },

  amountRed:   { fontSize: 13, fontWeight: '600', color: '#EF4444' },
  amountGreen: { fontSize: 13, fontWeight: '600', color: '#16A34A' },
  amountGray:  { fontSize: 13, fontWeight: '600', color: '#9CA3AF' },
});

export default Contacts;
