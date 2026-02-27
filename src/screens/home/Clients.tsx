import React, { useState, useEffect, useRef } from 'react';
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
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

type StackNavigation = StackNavigationProp<any>;

interface ClientItem {
  id: number;
  customer_id?: number;
  company_name: string;
  client_name: string;
  email: string;
  telephone: string;
  postal_code: string;
  city: string;
  commercial_register: string;
  ice: string;
  created_at?: string;
  updated_at?: string;
}



const CreateClientModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}> = ({ visible, onClose, onCreated }) => {
  const insets = useSafeAreaInsets();
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [ice, setIce] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toLocaleDateString('fr-FR');

  const resetForm = () => {
    setCompanyName(''); setClientName(''); setEmail('');
    setTelephone(''); setPostalCode(''); setCity('');
    setCommercialRegister(''); setIce('');
  };

  useEffect(() => { if (!visible) resetForm(); }, [visible]);

  const handleSave = async () => {
    if (!companyName) { Alert.alert('Requis', 'Veuillez saisir le nom de la société.'); return; }
    setSaving(true);
    try {
      await api.post(Api_Endpoints.createCustomerClient, {
        company_name: companyName,
        client_name: clientName,
        email,
        telephone,
        postal_code: postalCode,
        city,
        commercial_register: commercialRegister,
        ice,
      });
      Alert.alert('Succès', 'Client créé avec succès.');
      onCreated();
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la création du client.';
      Alert.alert('Erreur', msg);
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
          <Text style={styles.modalTitle}>Création d'un client</Text>
          <TouchableOpacity
            style={[styles.modalConfirmBtn, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.modalConfirmText}>Confirmer</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>

            {/* Date subtitle */}
            <Text style={styles.createDateText}>Date de création : {today}</Text>

            {/* Form fields */}
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Nom de la société</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Nom et prénom du contact</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Téléphone</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Code postal</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Ville</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Registre du commerce</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={commercialRegister}
                  onChangeText={setCommercialRegister}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>ICE</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={ice}
                  onChangeText={setIce}
                />
              </View>
            </View>

            {/* Bottom confirm button */}
            <TouchableOpacity
              style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>Confirmer</Text>}
            </TouchableOpacity>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};


const Clients: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const isFirstSearch = useRef(true);

  const fetchData = async () => {
    try {
      const res = await api.get(Api_Endpoints.customerClients);
      setClients(res.data?.data ?? []);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger les clients.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (isFirstSearch.current) { isFirstSearch.current = false; return; }
    if (!searchQuery.trim()) { fetchData(); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(Api_Endpoints.customerClientsSearch, { params: { like: searchQuery.trim() } });
        setClients(res.data?.data ?? []);
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les clients.');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getInitials = (name: string) => name.charAt(0).toUpperCase();

  const renderItem = ({ item }: { item: ClientItem }) => (
    <TouchableOpacity
      style={styles.clientCard}
      onPress={() => nav.navigate('Client Detail', { client: item })}
      activeOpacity={0.8}
    >
      <View style={styles.clientAvatar}>
        <Text style={styles.clientInitial}>{getInitials(item.company_name)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.clientName}>{item.company_name}</Text>
        <Text style={styles.clientMeta}>{item.client_name}</Text>
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
          <Text style={styles.titleText}>Clients</Text>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un client..."
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
          data={clients}
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
              <Text style={styles.emptyText}>Aucun client trouvé</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <CreateClientModal
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

  // Client Card
  clientCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  clientAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C5D5E4',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  clientInitial: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  clientName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  clientMeta: { fontSize: 12, color: '#6B7280' },

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

  // Form card
  formCard: {
    // backgroundColor: '#FFFFFF',
    borderRadius: 16,
    // padding: 18,
    paddingVertical: 18,
    gap: 16,
    // shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
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

  // Confirm button
  confirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});

export default Clients;
