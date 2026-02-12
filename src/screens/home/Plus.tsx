import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';

const Plus: React.FC = ({ navigation }: any) => {
  const menuItems = [
    { id: 1, label: 'Bons de livraison', icon: fileIcon },
    { id: 2, label: 'Avoirs', icon: fileIcon },
    { id: 3, label: 'Produits', icon: fileIcon },
    { id: 4, label: 'Règlements', icon: fileIcon },
    { id: 5, label: 'Dépenses', icon: fileIcon },
  ];

  const handleMenuPress = (label: string) => {
    console.log('Navigate to:', label);
    if (label === 'Bons de livraison') {
      navigation.navigate('Delivery Notes');
    } else if (label === 'Avoirs') {
      navigation.navigate('Credits');
    } else if (label === 'Produits') {
      navigation.navigate('Products');
    } else if (label === 'Règlements') {
      navigation.navigate('Payments');
    } else if (label === 'Dépenses') {
      navigation.navigate('Expenses');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plus</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.label)}
          >
            <View style={styles.menuItemLeft}>
              <Image source={item.icon} style={styles.menuItemIcon} resizeMode="contain" />
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 32,
    height: 32,
    marginRight: 16,
    tintColor: '#0B5FA5',
  },
  menuItemLabel: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '400',
  },
  chevron: {
    fontSize: 28,
    color: '#CCCCCC',
    marginLeft: 12,
  },
});

export default Plus;