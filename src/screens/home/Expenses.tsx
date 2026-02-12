import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon, userIcon } from '../../assets/icons';

type TabType = 'Tous' | 'Brouillon' | 'Validé' | 'Partiel' | 'Soldé';

const Expenses: React.FC = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('Tous');

  const invoices = [
    {
      id: 1,
      client: 'Téléphone & Internet',
      number: 'FA-202601-0002',
      amount: '0,00',
      currency: 'MAD',
      date: '21/01/2026',
      status: 'Brouillon',
      statusColor: '#333333',
    },
    {
      id: 2,
      client: 'Téléphone & Internet',
      number: 'FA-202601-0001',
      amount: '24,00',
      currency: 'MAD',
      date: '02/01/2026',
      status: 'Payée',
      statusColor: '#3cebba',
    },
  ];

  const handleAddInvoice = () => {
    console.log('Add new invoice');
  };

  const handleInvoicePress = (invoice: any) => {
    navigation.navigate('Edit Expense', { expense: invoice });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        {/* <TouchableOpacity 
        style={styles.avatarButton}
        >
          <Image source={userIcon} 
          style={styles.avatar} 
          resizeMode="contain" />
        </TouchableOpacity> */}
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                  <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
        <Text style={styles.headerTitle}>Dépenses</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={fileIcon}
              style={[styles.icon, { tintColor: '#0B5FA5' }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={fileIcon}
              style={[styles.icon, { tintColor: '#0B5FA5' }]}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabsContainer}
      >
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('Tous')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Tous' && styles.activeTabText,
            ]}
          >
            Tous
          </Text>
          {activeTab === 'Tous' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('Brouillon')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Brouillon' && styles.activeTabText,
            ]}
          >
            Brouillon
          </Text>
          {activeTab === 'Brouillon' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('Validé')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Validé' && styles.activeTabText,
            ]}
          >
            Validé
          </Text>
          {activeTab === 'Validé' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('Partiel')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Partiel' && styles.activeTabText,
            ]}
          >
            Partiel
          </Text>
          {activeTab === 'Partiel' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('Soldé')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Soldé' && styles.activeTabText,
            ]}
          >
            Soldé
          </Text>
          {activeTab === 'Soldé' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </ScrollView> */}

      {/* Invoices List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* {activeTab === 'Tous' && invoices.map((invoice) => (
          <TouchableOpacity 
            key={invoice.id} 
            style={styles.invoiceCard}
            onPress={() => handleInvoicePress(invoice)}
          >
            <View style={styles.invoiceLeft}>
              <Text style={styles.clientName}>{invoice.client}</Text>
              <Text style={styles.invoiceNumber}>{invoice.number}</Text>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: invoice.statusColor },
                ]}
              >
                <Text style={styles.statusText}>{invoice.status}</Text>
              </View>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.amount}>
                {invoice.amount} {invoice.currency}
              </Text>
              <Text style={styles.date}>{invoice.date}</Text>
            </View>
          </TouchableOpacity>
        ))} */}

        {invoices.map((invoice) => (
          <TouchableOpacity 
            key={invoice.id} 
            style={styles.invoiceCard}
            onPress={() => handleInvoicePress(invoice)}
          >
            <View style={styles.invoiceLeft}>
              <Text style={styles.clientName}>{invoice.client}</Text>
              <Text style={styles.invoiceNumber}>{invoice.number}</Text>
            </View>
            <View style={styles.invoiceRight}>
              <Text style={styles.amount}>
                {invoice.amount} {invoice.currency}
              </Text>
              <Text style={styles.date}>{invoice.date}</Text>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* FAB Button */}
        <TouchableOpacity style={styles.fab}>
            <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  avatarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    tintColor: '#999999',
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
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
  },
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#0B5FA5',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0B5FA5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
  },
  invoiceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  invoiceLeft: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 4,
  },
  invoiceNumber: {
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
  invoiceRight: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#999999',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0B5FA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default Expenses;
