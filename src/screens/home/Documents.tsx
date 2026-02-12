import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Documents: React.FC = ({ navigation, route }: any) => {
  const { type, client } = route.params;

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
});

export default Documents;
