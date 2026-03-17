import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { fileIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';
import {
  User,
  Building2,
  Shield,
  Package,
  Languages,
} from 'lucide-react-native';

const Plus: React.FC = ({ navigation }: any) => {
  const nav = useNavigation<any>();
  const { logout } = useAuth();
  const { t } = useTranslation();
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { id: 1, label: t('menu_profile'), action: 'profile', icon: User },
    { id: 2, label: t('menu_company'), action: 'company', icon: Building2 },
    { id: 4, label: t('menu_security'), action: 'security', icon: Shield },
    { id: 6, label: t('menu_products'), action: 'products', icon: Package },
    { id: 10, label: t('menu_language'), action: 'language', icon: Languages },
    { id: 5, label: t('menu_logout'), action: 'logout', icon: null },
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
      Alert.alert(t('error_title'), t('error_logout_message'));
    } finally {
      setLoggingOut(false);
    }
  };

  const handleMenuPress = (action: string) => {
    console.log('Navigate to:', action);
    if (action === 'profile') {
      navigation.navigate('Personal Profile');
    } else if (action === 'company') {
      navigation.navigate('Company Profile');
    } else if (action === 'security') {
      navigation.navigate('Account Security');
    } else if (action === 'products') {
      navigation.navigate('Products');
    } else if (action === 'language') {
      navigation.navigate('Language Settings');
    } else if (action === 'logout') {
      handleLogout();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('header_plus')}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuItem, item.action === 'logout' && { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 8, paddingTop: 16 }]}
            onPress={() => handleMenuPress(item.action)}
            disabled={item.action === 'logout' && loggingOut}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              {item.icon && <item.icon
                size={32}
                style={{ marginRight: 16 }}
                color={"#0B5FA5"}
                strokeWidth={2}
              />}
              <Text style={[styles.menuItemLabel, item.action === 'logout' && { color: '#DC2626' }]}>{item.label}</Text>
            </View>
            {item.action === 'logout' && loggingOut ? (
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