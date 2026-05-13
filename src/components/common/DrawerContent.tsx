import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { User, Building2, ShieldCheck, LogOut, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { RootState } from '../../store';

interface DrawerContentProps {
  navigation: DrawerNavigationProp<any>;
}

type MenuItem = {
  id: number;
  labelKey: string;
  route: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
};

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const { t } = useTranslation();
  const customer = useSelector((state: RootState) => state.user.customer);

  const menuItems: MenuItem[] = [
    { id: 1, labelKey: 'drawer_personal_profile', route: 'Personal Profile', Icon: User },
    { id: 2, labelKey: 'drawer_company_profile', route: 'Company Profile', Icon: Building2 },
    { id: 3, labelKey: 'drawer_account_security', route: 'Account Security', Icon: ShieldCheck },
  ];

  const handleLogout = async () => {
    await logout();
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Splash' }],
    });
  };

  const handleMenuPress = (route: string) => {
    navigation.closeDrawer();
    navigation.getParent()?.navigate(route);
  };

  const initials = customer?.name
    ? customer.name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>{customer?.name ?? ''}</Text>
        {customer?.email ? (
          <Text style={styles.headerEmail} numberOfLines={1}>{customer.email}</Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map(({ id, labelKey, route, Icon }) => (
          <TouchableOpacity
            key={id}
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => handleMenuPress(route)}
          >
            <View style={styles.menuIconWrap}>
              <Icon size={20} color="#0B5FA5" strokeWidth={1.8} />
            </View>
            <Text style={styles.menuItemLabel}>{t(labelKey)}</Text>
            <ChevronRight size={16} color="#CCCCCC" strokeWidth={2} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <View style={styles.divider} />
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <View style={[styles.menuIconWrap, styles.logoutIconWrap]}>
            <LogOut size={20} color="#E74C3C" strokeWidth={1.8} />
          </View>
          <Text style={styles.logoutText}>{t('menu_logout')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: '#F8FBFF',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B5FA5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerEmail: {
    fontSize: 13,
    color: '#777777',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 0,
  },
  menuContainer: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    color: '#222222',
    fontWeight: '500',
  },
  logoutSection: {
    marginTop: 'auto',
    paddingBottom: 36,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 8,
  },
  logoutIconWrap: {
    backgroundColor: '#FEF0EF',
  },
  logoutText: {
    fontSize: 15,
    color: '#E74C3C',
    fontWeight: '600',
  },
});

export default DrawerContent;
