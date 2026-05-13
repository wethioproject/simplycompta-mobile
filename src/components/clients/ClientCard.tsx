import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { ClientItem } from '../../types/client.types';
import { getInitials } from '../../utils/client.helpers';

interface ClientCardProps {
  item: ClientItem;
  onPress: () => void;
}

export const ClientCard: React.FC<ClientCardProps> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.8}>
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

const styles = StyleSheet.create({
  clientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  clientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#C5D5E4',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  clientInitial: { fontSize: 20, color: '#FFFFFF', fontWeight: '600' },
  clientName: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 2 },
  clientMeta: { fontSize: 12, color: '#6B7280' },
});
