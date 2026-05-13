import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

type TabType = 'Categories' | 'Brands' | 'Units';

const Catalogue: React.FC = ({ navigation }: any) => {
  const [activeTab, setActiveTab] = useState<TabType>('Categories');

  const categories = ['Famille par défaut'];
  
  const brands: any[] = [];

  const units = [
    'Gramme',
    'Jour',
    'Kilogramme',
    'Kilomètre',
    'Litre',
    'Lot',
    'Mètre',
    'Mètre carré',
    'Mètre cube',
    'Mètre linéaire',
    'Personne',
    'Tonne',
    'Unité',
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Categories':
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {categories.map((item, index) => (
              <TouchableOpacity key={index} style={styles.listItem} onPress={() => navigation.navigate('Edit Categories', { name: item })}>
                <Text style={styles.listItemText}>{item}</Text>
              </TouchableOpacity>
            ))}
            {/* Extra spacing for FAB */}
            <View style={styles.fabSpacing} />
          </ScrollView>
        );

      case 'Brands':
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {brands.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Aucune marque</Text>
              </View>
            ) : (
              brands.map((item, index) => (
                <TouchableOpacity key={index} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        );

      case 'Units':
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {units.map((item, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.listItemText}>{item}</Text>
              </View>
            ))}
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Catalogue</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'Categories' && styles.activeTab]}
          onPress={() => setActiveTab('Categories')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Categories' && styles.activeTabText,
            ]}
          >
            Familles
          </Text>
          {activeTab === 'Categories' && (
            <View style={styles.tabIndicator} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Brands' && styles.activeTab]}
          onPress={() => setActiveTab('Brands')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Brands' && styles.activeTabText,
            ]}
          >
            Marques
          </Text>
          {activeTab === 'Brands' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'Units' && styles.activeTab]}
          onPress={() => setActiveTab('Units')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'Units' && styles.activeTabText,
            ]}
          >
            Unités
          </Text>
          {activeTab === 'Units' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {renderTabContent()}

        <TouchableOpacity style={styles.fab}>
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
  headerPlaceholder: {
    width: 28,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 1,
    borderBottomColor: '#0B5FA5',
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
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0B5FA5',
  },
  tabContent: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  listItem: {
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  listItemText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '400',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
  },
  fabSpacing: {
    height: 80,
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

export default Catalogue;
