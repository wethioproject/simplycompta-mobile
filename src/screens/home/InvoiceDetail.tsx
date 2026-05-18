import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon } from '../../assets/icons';
import { useTransaction } from '../../hooks/useTransaction';
import { useSecurity } from '../../contexts/SecurityContext';

const InvoiceDetail: React.FC = ({ navigation, route }: any) => {
  const invoice = route?.params?.invoice;
  const { getTransaction } = useTransaction();
  const { maskAmount } = useSecurity();
  const [status, setStatus] = useState(invoice?.status || 'Brouillon');
  const [transaction, setTransaction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (invoice?.id) {
      console.log('Invoice ID received:', invoice.id);
      fetchTransactionDetail();
    } else {
      console.warn('No invoice ID provided');
    }
  }, [invoice?.id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      const result = await getTransaction(invoice.id);
      if (result.success && result.transaction) {
        setTransaction(result.transaction);
        console.log('Transaction detail:', result.transaction);
      }
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatAmount = (amount: string) => maskAmount(Number(amount || 0), 'MAD');

  const getTransactionType = (type: string) => {
    return type === 'expense' ? 'Dépense' : 'Revenu';
  };

  const getStatusColor = (type: string) => {
    return type === 'expense' ? '#333333' : '#3cebba';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{invoice?.number || 'FA-202601-0002'}</Text>
        <TouchableOpacity style={styles.menuButton}>
          <Text style={styles.menuDots}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0B5FA5" />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : transaction ? (
          <>
            {/* Type Badge */}
            <View style={[styles.statusDropdown, { backgroundColor: getStatusColor(transaction.type) }]}>
              <Text style={styles.statusText}>{getTransactionType(transaction.type)}</Text>
            </View>

            {/* Transaction Info Section */}
            <View style={styles.section}>
              <View style={styles.row}>
                <Text style={styles.label}>Référence</Text>
                <Text style={styles.value}>{transaction.reference}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Date de transaction</Text>
                <Text style={styles.value}>{formatDate(transaction.transaction_date)}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Catégorie</Text>
                <Text style={styles.value}>{transaction.category.name}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Compte</Text>
                <Text style={styles.value}>{transaction.account.holder_name}</Text>
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionCard}>
                <Text style={styles.descriptionText}>{transaction.description}</Text>
              </View>
            </View>

            {/* Attachment Section */}
            {transaction.attachment_path && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Reçu de paiement</Text>
                <TouchableOpacity style={styles.attachmentCard}>
                  <Image
                    source={fileIcon}
                    style={[styles.attachmentIcon, { tintColor: '#0B5FA5' }]}
                    resizeMode="contain"
                  />
                  <Text style={styles.attachmentText}>Voir le reçu</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Amount Section */}
            <View style={styles.totalSection}>
              <View style={styles.row}>
                <Text style={styles.totalLabel}>Montant</Text>
                <Text style={styles.totalValue}>{formatAmount(transaction.amount)}</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Impossible de charger la transaction</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#0B5FA5' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.blueButton]}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.greenButton]}>
          <Image
            source={fileIcon}
            style={[styles.actionIcon, { tintColor: '#FFFFFF' }]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  menuButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuDots: {
    fontSize: 24,
    color: '#0B5FA5',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statusDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginRight: 12,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: '#FFFFFF',
  },
  totalSection: {
        backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    // borderRadius: 8,  
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    paddingTop: 16,
    paddingBottom: 16,
    // borderRadius: 8,  
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  value: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  valueBlue: {
    fontSize: 14,
    color: '#0B5FA5',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  clientCard: {
    backgroundColor: '#E8F0F7',
    padding: 16,
    borderRadius: 2,
  },
  clientName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  clientInfo: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '400',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 20,
    color: '#0B5FA5',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  blueButton: {
    backgroundColor: '#0B5FA5',
    borderColor: '#0B5FA5',
  },
  greenButton: {
    backgroundColor: '#3CEBBA',
    borderColor: '#3CEBBA',
  },
  actionIcon: {
    width: 24,
    height: 24,
  },
  descriptionCard: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F2FF',
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#0B5FA5',
  },
  attachmentIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  attachmentText: {
    fontSize: 14,
    color: '#0B5FA5',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
  },
});

export default InvoiceDetail;
