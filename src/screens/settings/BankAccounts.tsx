import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';
import { fileIcon } from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const BankAccounts: React.FC = ({ navigation }: any) => {
  const [bankAccounts] = useState([
    { id: 1, name: 'Compte courant', currency: 'MAD' },
  ]);

  const handleBankAccountPress = (account: any) => {
    navigation.navigate('Edit Bank Account', { account });
  };

  const handleAddBankAccount = () => {
    console.log('Add new bank account');
    navigation.navigate('Edit Bank Account', { account: null });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comptes bancaires</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Image
            source={fileIcon}
            style={{ width: 24, height: 24, tintColor: '#0B5FA5' }}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Bank Accounts List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bankAccounts.map((account) => (
          <TouchableOpacity
            key={account.id}
            style={styles.accountItem}
            onPress={() => handleBankAccountPress(account)}
          >
            <Text style={styles.accountName}>{account.name}</Text>
            <Text style={styles.accountCurrency}>{account.currency}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* FAB Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddBankAccount}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  accountItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E5E5',
  },
  accountName: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  accountCurrency: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0B5FA5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default BankAccounts;
