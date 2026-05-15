import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { AlertTriangle, FileText, Plus, TrendingUp } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StackNavigationProp } from '@react-navigation/stack';

import { ClientItem } from '../../types/client.types';
import { getClients, searchClients } from '../../services/client.service';
import { styles } from '../../styles/clients.styles';
import { ClientHeader } from '../../components/clients/ClientHeader';
import { ClientSearchBar } from '../../components/clients/ClientSearchBar';
import { ClientCard } from '../../components/clients/ClientCard';
import { CreateClientModal } from '../../components/clients/CreateClientModal';

type StackNavigation = StackNavigationProp<any>;

const Clients: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const { t } = useTranslation();

  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isFirstSearch = useRef(true);

  const fetchData = async () => {
    try {
      const data = await getClients();
      setClients(data);
    } catch (e) {
      Alert.alert(t('error_title'), t('error_load_clients'));
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
        const data = await searchClients(searchQuery.trim());
        setClients(data);
      } catch (e) {
        Alert.alert(t('error_title'), t('error_load_clients'));
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const totalRevenue = clients.reduce((sum, client) => sum + Number(client.total_revenue_ht ?? 0), 0);
  const lateClients = clients.filter(client => Number(client.late_invoices_count ?? 0) > 0).length;
  const missingIce = clients.filter(client => !client.ice).length;
  const topClient = [...clients].sort((a, b) => Number(b.total_revenue_ht ?? 0) - Number(a.total_revenue_ht ?? 0))[0];

  const renderClientAssistant = () => (
    <View style={localStyles.assistantCard}>
      <View style={localStyles.assistantHeader}>
        <Text style={localStyles.assistantTitle}>{t('client_360_title', { defaultValue: 'Clients 360' })}</Text>
        <Text style={localStyles.assistantMeta}>{clients.length}</Text>
      </View>
      <View style={localStyles.metricsRow}>
        <View style={localStyles.metricTile}>
          <TrendingUp size={15} color="#16A34A" />
          <Text style={localStyles.metricValue}>{totalRevenue.toLocaleString('fr-FR')}</Text>
          <Text style={localStyles.metricLabel}>MAD</Text>
        </View>
        <View style={localStyles.metricTile}>
          <AlertTriangle size={15} color="#D97706" />
          <Text style={localStyles.metricValue}>{lateClients}</Text>
          <Text style={localStyles.metricLabel}>{t('badge_urgent', { defaultValue: 'urgent' })}</Text>
        </View>
        <View style={localStyles.metricTile}>
          <FileText size={15} color="#1E5BAC" />
          <Text style={localStyles.metricValue}>{missingIce}</Text>
          <Text style={localStyles.metricLabel}>ICE</Text>
        </View>
      </View>
      {!!topClient && (
        <Text style={localStyles.assistantHint} numberOfLines={1}>
          {t('client_360_top', { name: topClient.company_name, defaultValue: `Top client: ${topClient.company_name}` })}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ClientHeader
        title={t('title_clients')}
        onBack={() => nav.goBack()}
      />

      <ClientSearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={() => setSearchQuery('')}
        placeholder={t('placeholder_search_client')}
      />

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={clients}
          renderItem={({ item }) => (
            <ClientCard
              item={item}
              onPress={() => nav.navigate('Client Detail', { client: item })}
            />
          )}
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
          ListHeaderComponent={clients.length > 0 ? renderClientAssistant : undefined}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>{t('text_no_clients_found')}</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.85}
      >
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

export default Clients;

const localStyles = {
  assistantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8EEF8',
    marginBottom: 4,
  },
  assistantHeader: { flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  assistantTitle: { fontSize: 15, fontWeight: '800' as const, color: '#111827' },
  assistantMeta: { fontSize: 12, fontWeight: '800' as const, color: '#1E5BAC' },
  metricsRow: { flexDirection: 'row' as const, gap: 8 },
  metricTile: { flex: 1, borderRadius: 14, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#EDF2F7', padding: 10, gap: 4 },
  metricValue: { fontSize: 14, fontWeight: '900' as const, color: '#111827' },
  metricLabel: { fontSize: 10, fontWeight: '700' as const, color: '#64748B' },
  assistantHint: { fontSize: 12, fontWeight: '700' as const, color: '#334155' },
};
