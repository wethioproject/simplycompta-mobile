import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fileIcon } from '../../assets/icons';

const Settings: React.FC = ({ navigation }: any) => {
  const menuItems = [
    { id: 1, label: 'Préférences', icon: fileIcon },
    { id: 2, label: 'Comptes bancaires', icon: fileIcon },
    { id: 3, label: 'Modes de paiement', icon: fileIcon },
    { id: 4, label: 'Devises', icon: fileIcon },
    { id: 5, label: 'Taxes', icon: fileIcon },
    { id: 6, label: 'Modèles', icon: fileIcon },
    { id: 7, label: 'Catalogue', icon: fileIcon },
    { id: 8, label: 'Catégories des dépenses', icon: fileIcon },
    { id: 9, label: 'Numérotations', icon: fileIcon },
    { id: 10, label: 'Configuration SMTP', icon: fileIcon },
  ];

  const handleMenuPress = (label: string) => {
    console.log('Navigate to:', label);
    // Add navigation logic here
    if(label === 'Préférences') {
        navigation.navigate('Preferences');
    } else if(label === 'Comptes bancaires') {
        navigation.navigate('Bank Accounts');
    } else if(label === 'Modes de paiement') {
        navigation.navigate('Payment Methods');
    } else if(label === 'Devises') {
        navigation.navigate('Currencies');
    } else if(label === 'Taxes') {
        navigation.navigate('Taxes');
    } else if(label === 'Modèles') {
        navigation.navigate('Templates');
    } else if(label === 'Catalogue') {
        navigation.navigate('Catalogue');
    } else if(label === 'Catégories des dépenses') {
        navigation.navigate('Expenditure Categories')
    }
      else if(label === 'Numérotations') {
        navigation.navigate('Numbering')
      }    
      else if(label === 'Configuration SMTP'){
        navigation.navigate('Configuration Smtp')
      }
    // navigation.navigate(label);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.placeholder} />
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
    // backgroundColor: '#F5F5F5',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E5E5',
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 24,
    height: 24,
    marginRight: 16,
    tintColor: '#0B5FA5',
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 24,
    color: '#B0B0B0',
    marginLeft: 12,
  },
});

export default Settings;
