import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';

const Taxes: React.FC = ({ navigation }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  const taxes = [
    { id: 1, label: '0%', value: 0 },
    { id: 2, label: '20%', value: 20 },
  ];

  const handleTaxPress = (label: string, value: number) => {
    console.log('Navigate to:', label);
    // Navigate to edit tax screen
    navigation.navigate('Edit Tax', { label, value });
  };

  const handleAddTax = () => {
    console.log('Add new tax');
    // Add navigation logic here
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Les taxes</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: '#0B5FA5' }} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {taxes.map((tax) => (
          <TouchableOpacity
            key={tax.id}
            style={styles.taxItem}
            onPress={() => handleTaxPress(tax.label, tax.value)}
          >
            <Text style={styles.taxLabel}>{tax.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handleAddTax}>
        <Text style={styles.fabIcon}>+</Text>
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
  taxItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  taxLabel: {
    fontSize: 16,
    color: '#333333',
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

export default Taxes;
