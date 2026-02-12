import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon, downArrowIcon } from '../../assets/icons';

const AccountStatement: React.FC = ({ navigation }: any) => {
  const [dateRange, setDateRange] = useState('01/01/2026 - 31/03/2026');

  const transactions = [
    {
      id: 1,
      date: '02/01/2026',
      type: 'debit',
      amount: '24,00 MAD',
      balance: '24,00 MAD',
      description: 'Facture - FA-202601-0001',
    },
    {
      id: 2,
      date: '02/01/2026',
      type: 'credit',
      amount: '24,00 MAD',
      balance: '0,00 MAD',
      description: 'Règlement - PAY-202601-0001 (Carte bancaire)',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relevé de comptes</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Image source={fileIcon} style={[styles.downloadIcon, { tintColor: '#0B5FA5' }]} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Range Dropdown */}
        <TouchableOpacity style={styles.dateRangeDropdown}>
          <Text style={styles.dateRangeText}>{dateRange}</Text>
          <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
        </TouchableOpacity>

        {/* Balance Header */}
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceAmount}>0,00 MAD</Text>
        </View>

        {/* Solde avant période */}
        <View style={styles.soldeAvantContainer}>
          <Text style={styles.soldeAvantText}>Solde avant période</Text>
        </View>

        {/* Transactions List */}
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <Text style={styles.transactionDate}>{transaction.date}</Text>
              <Text style={styles.transactionType}>
                {transaction.type === 'debit' ? 'Débit' : 'Crédit'} : {transaction.amount}
              </Text>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
            </View>
            <Text style={styles.transactionBalance}>{transaction.balance}</Text>
          </View>
        ))}

        {/* Bottom Spacing for Totaux Card */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Totaux Card - Fixed at Bottom */}
      <View style={styles.totauxCard}>
        <Text style={styles.totauxTitle}>Totaux</Text>
        <View style={styles.totauxRow}>
          <Text style={styles.totauxLabel}>Débit</Text>
          <Text style={styles.totauxValue}>24,00 MAD</Text>
        </View>
        <View style={styles.totauxRow}>
          <Text style={styles.totauxLabel}>Crédit</Text>
          <Text style={styles.totauxValue}>24,00 MAD</Text>
        </View>
        <View style={styles.totauxRow}>
          <Text style={styles.totauxLabel}>Solde</Text>
          <Text style={styles.totauxValue}>0,00 MAD</Text>
        </View>
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
  downloadButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadIcon: {
    width: 24,
    height: 24,
  },
  scrollView: {
    flex: 1,
  },
  dateRangeDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateRangeText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  balanceHeader: {
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
  },
  soldeAvantContainer: {
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  soldeAvantText: {
    fontSize: 16,
    color: '#999999',
  },
  transactionItem: {
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDate: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 8,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#999999',
  },
  transactionBalance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    alignSelf: 'flex-start',
  },
  bottomSpacer: {
    height: 180,
  },
  totauxCard: {
    backgroundColor: '#0B5FA5',
    paddingHorizontal: 20,
    paddingVertical: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totauxTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  totauxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totauxLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  totauxValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AccountStatement;
