import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { fileIcon } from '../assets/icons';
import HomeStack from './HomeStack';
import Invoice from '../screens/home/Invoice'
import Transactions from '../screens/home/Transactions';
import BankStatement from '../screens/home/BankStatement';
import Clients from '../screens/home/Clients';
import Plus from '../screens/home/Plus';
import Expenses from '../screens/home/Expenses';
import Suppliers from '../screens/home/Suppliers';
import { 
  House,
  FileText,
  TrendingDown,
  Users,
  Truck,
  MoreHorizontal
} from 'lucide-react-native';

const Tab = createBottomTabNavigator();

const HomeTabs: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B5FA5',
        tabBarInactiveTintColor: '#999999',
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeStack}
        options={{
          tabBarLabel: t('tab_dashboard'),
          tabBarIcon: ({ color, size }) => (
        <House
          size={size ?? 24}
          color={color}
          strokeWidth={2}
        />
          ),
        }}
      />
      <Tab.Screen
        name="Facture"
        component={Invoice}
        options={{
          tabBarLabel: t('tab_invoice'),
          tabBarIcon: ({ color, size }) => (
          <FileText
          size={size ?? 24}
          color={color}
          strokeWidth={2}
        />
          ),
        }}
      />
      <Tab.Screen
        name="Dépenses"
        component={Expenses}
        options={{
          tabBarLabel: t('tab_expenses'),
          tabBarIcon: ({ color, size }) => (
          <TrendingDown
          size={size ?? 24}
          color={color}
          strokeWidth={2}
        />
          ),
        }}
      />
      {/* <Tab.Screen
        name="Transaction"
        component={Transactions}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      /> */}
      {/* <Tab.Screen
        name="Bank"
        component={BankStatement}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      /> */}
      <Tab.Screen
        name="Clients"
        component={Clients}
        options={{
          tabBarLabel: t('tab_clients'),
          tabBarIcon: ({ color, size }) => (
        <Users
          size={size ?? 24}
          color={color}
          strokeWidth={2}
        />
          ),
        }}
      />
      <Tab.Screen
        name="Fournisseurs"
        component={Suppliers}
        options={{
          tabBarLabel: t('tab_suppliers'),
          tabBarIcon: ({ color, size }) => (
            <Truck
              size={size ?? 24}
              color={color}
              strokeWidth={2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Plus"
        component={Plus}
        options={{
          tabBarLabel: t('tab_more'),
          tabBarIcon: ({ color, size }) => (
        <MoreHorizontal
          size={size ?? 24}
          color={color}
          strokeWidth={2}
        />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
