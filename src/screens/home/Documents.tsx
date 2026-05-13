import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  FileText,
  Plus,
  TrendingDown,
  Users,
} from 'lucide-react-native';

const Documents: React.FC = ({ navigation, route }: any) => {
  const { type, client } = route.params;

  // ── FAB ────────────────────────────────────────────────────────────────────
  const [isFabOpen, setIsFabOpen] = useState(false);
  const fabRotation = useState(new Animated.Value(0))[0];
  const fabButton1Scale = useState(new Animated.Value(0))[0];
  const fabButton2Scale = useState(new Animated.Value(0))[0];
  const fabButton3Scale = useState(new Animated.Value(0))[0];
  const fabButton1Opacity = useState(new Animated.Value(0))[0];
  const fabButton2Opacity = useState(new Animated.Value(0))[0];
  const fabButton3Opacity = useState(new Animated.Value(0))[0];
  const rotation = fabRotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] });

  const toggleFab = () => {
    const toValue = isFabOpen ? 0 : 1;
    setIsFabOpen(!isFabOpen);
    Animated.parallel([
      Animated.timing(fabRotation, { toValue, duration: 300, useNativeDriver: true }),
      Animated.stagger(50, [
        Animated.parallel([
          Animated.spring(fabButton1Scale, { toValue, friction: 5, useNativeDriver: true }),
          Animated.timing(fabButton1Opacity, { toValue, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(fabButton2Scale, { toValue, friction: 5, useNativeDriver: true }),
          Animated.timing(fabButton2Opacity, { toValue, duration: 200, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.spring(fabButton3Scale, { toValue, friction: 5, useNativeDriver: true }),
          Animated.timing(fabButton3Opacity, { toValue, duration: 200, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  };

  const handleNavigateToInvoice = () => {
    toggleFab();
    setTimeout(() => { navigation.navigate('Invoice', { openCreateModal: true }); }, 300);
  };

  const handleNavigateToQuote = () => {
    toggleFab();
    setTimeout(() => { navigation.navigate('Expenses', { openCreateModal: true }); }, 300);
  };

  const handleOpenAddClient = () => {
    toggleFab();
    setTimeout(() => { navigation.navigate('Contacts') });
  };

  const invoices = [
    {
      id: 1,
      client: 'a barb',
      number: 'FA-202601-0002',
      amount: '0,00',
      currency: 'MAD',
      date: '21/01/2026',
      status: 'Brouillon',
      statusColor: '#333333',
    },
    {
      id: 2,
      client: 'a barb',
      number: 'FA-202601-0001',
      amount: '24,00',
      currency: 'MAD',
      date: '02/01/2026',
      status: 'Payée',
      statusColor: '#3cebba',
    },
  ];

  const handleInvoicePress = (invoice: any) => {
    navigation.navigate('Invoice Detail', { invoice });
  };

  const getTitle = () => {
    switch (type) {
      case 'devis':
        return 'Devis';
      case 'bon_livraison':
        return 'Bon de livraison';
      case 'factures':
        return 'Factures';
      default:
        return 'Documents';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Documents</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Documents List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {type === 'factures' && invoices.map((invoice) => (
          <TouchableOpacity
            key={invoice.id}
            style={styles.documentCard}
            onPress={() => handleInvoicePress(invoice)}
          >
            <View style={styles.documentLeft}>
              <Text style={styles.clientName}>{invoice.client}</Text>
              <Text style={styles.documentNumber}>{invoice.number}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: invoice.statusColor },
                ]}
              >
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
            <View style={styles.documentRight}>
              <Text style={styles.amount}>
                {invoice.amount} {invoice.currency}
              </Text>
              <Text style={styles.date}>{invoice.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {type !== 'factures' && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun {getTitle().toLowerCase()}</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton3Scale }], opacity: fabButton3Opacity, bottom: 176 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton3]} onPress={handleNavigateToInvoice} activeOpacity={0.8}>
            <FileText size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton2Scale }], opacity: fabButton2Opacity, bottom: 120 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton2]} onPress={handleNavigateToQuote} activeOpacity={0.8}>
            <TrendingDown size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <Animated.View style={[styles.subFab, { transform: [{ scale: fabButton1Scale }], opacity: fabButton1Opacity, bottom: 64 }]}>
          <TouchableOpacity style={[styles.subFabButton, styles.subFabButton1]} onPress={handleOpenAddClient} activeOpacity={0.8}>
            <Users size={24} color="#FFFFFF" strokeWidth={2} />
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.fab} onPress={toggleFab} activeOpacity={0.8}>
          <Animated.Text style={[styles.fabIcon, { transform: [{ rotate: rotation }] }]}>
            <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
          </Animated.Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    // paddingVertical: 16,
  },
  documentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 1,
  },
  documentLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  documentNumber: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 8,
  },
    statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 1,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
//   statusBadge: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 4,
//   },
//   statusText: {
//     fontSize: 12,
//     color: '#FFFFFF',
//     fontWeight: '500',
//   },
  documentRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  // ── FAB
  fabContainer: {
    position: 'absolute',
    right: 24,
    bottom: 20,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  subFab: {
    position: 'absolute',
    right: 0,
  },
  subFabButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subFabButton1: { backgroundColor: '#1E5BAC' },
  subFabButton2: { backgroundColor: '#1E5BAC' },
  subFabButton3: { backgroundColor: '#1E5BAC' },
});

export default Documents;
