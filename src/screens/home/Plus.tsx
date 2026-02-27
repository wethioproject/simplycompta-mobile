import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { fileIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';

const Plus: React.FC = ({ navigation }: any) => {
  const nav = useNavigation<any>();
  const { logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { id: 1, label: 'Profil', icon: fileIcon },
    { id: 2, label: 'Entreprise', icon: fileIcon },
    // { id: 3, label: 'Notifications', icon: fileIcon },
    { id: 4, label: 'Sécurité', icon: fileIcon },
    { id: 5, label: 'Déconnexion', icon: null },
    // { id: 5, label: 'Avoirs', icon: fileIcon },
    // { id: 6, label: 'Produits', icon: fileIcon },
    // { id: 7, label: 'Règlements', icon: fileIcon },
    // { id: 8, label: 'Dépenses', icon: fileIcon },
    // { id: 9, label: 'Bons de livraison', icon: fileIcon },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      nav.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (e: any) {
      Alert.alert('Erreur', 'Impossible de se déconnecter.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleMenuPress = (label: string) => {
    console.log('Navigate to:', label);
    if (label === 'Profil') {
      navigation.navigate('Personal Profile');
    } else if (label === 'Entreprise') {
      navigation.navigate('Company Profile');
    } else if (label === 'Notifications') {
      navigation.navigate('Notification Preferences');
    } else if (label === 'Sécurité') {
      navigation.navigate('Account Security');
    } else if (label === 'Déconnexion') {
      handleLogout();
    } else if (label === 'Avoirs') {
      navigation.navigate('Credits');
    } else if (label === 'Produits') {
      navigation.navigate('Products');
    } else if (label === 'Règlements') {
      navigation.navigate('Payments');
    } else if (label === 'Dépenses') {
      navigation.navigate('Expenses');
    } else if (label === 'Bons de livraison') {
      navigation.navigate('Delivery Notes');
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
            style={[styles.menuItem, item.label === 'Déconnexion' && { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 16 }]}
            onPress={() => handleMenuPress(item.label)}
            disabled={item.label === 'Déconnexion' && loggingOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              {item.icon && <Image source={item.icon} style={styles.menuItemIcon} resizeMode="contain" />}
              <Text style={[styles.menuItemLabel, item.label === 'Déconnexion' && { color: '#DC2626' }]}>{item.label}</Text>
            </View>
            {item.label === 'Déconnexion' && loggingOut ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text style={styles.chevron}>›</Text>
            )}
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