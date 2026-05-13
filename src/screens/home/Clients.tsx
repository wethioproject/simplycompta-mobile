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
import { Plus } from 'lucide-react-native';
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
