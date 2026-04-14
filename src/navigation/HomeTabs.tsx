import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import HomeStack from './HomeStack';
import Invoice from '../screens/home/Invoice';
import Activity from '../screens/home/Activity';
import PlusScreen from '../screens/home/Plus';
import Expenses from '../screens/home/Expenses';
import Contacts from '../screens/home/Contacts';
import BankStatements from '../screens/home/BankStatements';
import {
  House,
  BarChart3,
  Users,
  MoreHorizontal,
  Plus,
  X,
  FileText,
  TrendingDown,
  Building2,
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  const TAB_BAR_HEIGHT = 64 + insets.bottom;
  const MENU_BOTTOM    = TAB_BAR_HEIGHT + 14;
  const currentRoute   = state.routes[state.index].name;

  const tabItems = [
    { name: 'Dashboard', label: t('tab_dashboard'), Icon: House        },
    { name: 'Activity',  label: t('tab_activity'),  Icon: BarChart3    },
    { name: 'Contacts',  label: t('tab_contacts'),  Icon: Users        },
    { name: 'Plus',      label: t('tab_more'),      Icon: MoreHorizontal },
  ];

  const fabMenuItems = [
    {
      key: 'facture',
      label: t('tab_invoice'),
      Icon: FileText,
      iconBg: '#EFF6FF',
      iconColor: '#1E5BAC',
      onPress: () => { setShowMenu(false); navigation.navigate('Invoice' as never); },
    },
    {
      key: 'depense',
      label: t('tab_expenses'),
      Icon: TrendingDown,
      iconBg: '#FFF7ED',
      iconColor: '#EA580C',
      onPress: () => { setShowMenu(false); navigation.navigate('Expenses' as never); },
    },
    {
      key: 'documents',
      label: t('tab_my_documents'),
      Icon: Building2,
      iconBg: '#EFF6FF',
      iconColor: '#1E5BAC',
      onPress: () => { setShowMenu(false); navigation.navigate('Documents List' as never); },
    },
  ];

  return (
    <>
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={[StyleSheet.absoluteFill, styles.menuBackdrop]}
            onPress={() => setShowMenu(false)}
          />
          <View style={[styles.menuPositioner, { bottom: MENU_BOTTOM }]}>
            <View style={styles.menuCard}>
              {fabMenuItems.map((item, index) => (
                <React.Fragment key={item.key}>
                  {index > 0 && <View style={styles.menuDivider} />}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={item.onPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.menuIconBox, { backgroundColor: item.iconBg }]}>
                      <item.Icon size={20} color={item.iconColor} />
                    </View>
                    <Text style={styles.menuItemLabel}>{item.label}</Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
            {/* ↓ Arrow pointing down toward FAB */}
            <View style={styles.menuArrow} />
          </View>
        </View>
      </Modal>

      <View style={[styles.tabBar, { paddingBottom: insets.bottom, height: TAB_BAR_HEIGHT }]}>
        {/* Left 2 tabs */}
        {tabItems.slice(0, 2).map(({ name, label, Icon }) => {
          const isActive = currentRoute === name;
          return (
            <TouchableOpacity
              key={name}
              style={styles.tabItem}
              onPress={() => navigation.navigate(name as never)}
              activeOpacity={0.75}
            >
              <Icon size={22} color={isActive ? '#0B5FA5' : '#9CA3AF'} strokeWidth={2} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Center FAB */}
        <View style={styles.fabSlot}>
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setShowMenu(v => !v)}
            activeOpacity={0.85}
          >
            {showMenu
              ? <X    size={24} color="#FFFFFF" strokeWidth={2.5} />
              : <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />}
          </TouchableOpacity>
          <Text style={styles.tabLabel}>{t('tab_add')}</Text>
        </View>

        {/* Right 2 tabs */}
        {tabItems.slice(2, 4).map(({ name, label, Icon }) => {
          const isActive = currentRoute === name;
          return (
            <TouchableOpacity
              key={name}
              style={styles.tabItem}
              onPress={() => navigation.navigate(name as never)}
              activeOpacity={0.75}
            >
              <Icon size={22} color={isActive ? '#0B5FA5' : '#9CA3AF'} strokeWidth={2} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 3,
    textAlign: 'center',
  },
  tabLabelActive: { color: '#0B5FA5' },

  fabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    // paddingBottom: 6,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -32,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 10,
  },

  menuBackdrop: { backgroundColor: 'rgba(0,0,0,0.3)' },
  menuPositioner: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  menuCard: {
    width: 240,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: { fontSize: 15, fontWeight: '600', color: '#111827' },
  menuDivider:   { height: 1, backgroundColor: '#F3F4F6' },
  menuArrow: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: '#F3F4F6',
    transform: [{ rotate: '45deg' }],
    marginTop: -9,
  },
});

const HomeTabs: React.FC = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Dashboard"  component={HomeStack}  />
    <Tab.Screen name="Activity"   component={Activity}   />
    <Tab.Screen name="Invoice"    component={Invoice}    />
    <Tab.Screen name="Expenses"   component={Expenses}   />
    <Tab.Screen name="Bank statements"   component={BankStatements}   />
    <Tab.Screen name="Contacts"   component={Contacts}   />
    <Tab.Screen name="Plus"       component={PlusScreen} />
  </Tab.Navigator>
);

export default HomeTabs;
