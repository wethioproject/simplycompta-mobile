import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';

const Numbering: React.FC = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const numberingList = [
    { id: 1, label: 'Clients', code: 'CLT-0002' },
    { id: 2, label: 'Produits', code: 'ART-2026' },
    { id: 3, label: 'Clients', code: 'CLT-0002' },
    { id: 4, label: 'Produits', code: 'ART-2026' },
    { id: 5, label: 'Clients', code: 'CLT-0002' },
    { id: 6, label: 'Produits', code: 'ART-2026' },
    { id: 7, label: 'Clients', code: 'CLT-0002' },
    { id: 8, label: 'Produits', code: 'ART-2026' },
    { id: 9, label: 'Clients', code: 'CLT-0002' },
    { id: 10, label: 'Produits', code: 'ART-2026' },
    { id: 11, label: 'Clients', code: 'CLT-0002' },
    { id: 12, label: 'Produits', code: 'ART-2026' },
  ]

  const handleAddCurrency = () => {
    console.log('Add new currency');
    // Add navigation logic here
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Numérotations</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: '#0B5FA5' }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Currency Item - Non-clickable */}
        {
        numberingList.map((item) => (
        <TouchableOpacity style={styles.currencyItem} key={item.id} onPress={() => navigation.navigate('Edit Numbering')}>
          <Text style={styles.currencyLabel}>{item.label}</Text>
          <Text style={styles.currencyCode}>{item.code}</Text>
        </TouchableOpacity>
        ))
        }
      </ScrollView>

      {/* Floating Action Button */}
      {/* <TouchableOpacity style={styles.fab} onPress={handleAddCurrency}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity> */}
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
  searchButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  currencyItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  currencyLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
    marginBottom: 4,
  },
  currencyCode: {
    fontSize: 14,
    color: '#B0B0B0',
    fontWeight: '400',
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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default Numbering;
