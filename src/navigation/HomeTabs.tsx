import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fileIcon } from '../assets/icons';
import HomeStack from './HomeStack';
import Invoice from '../screens/home/Invoice'
import Transactions from '../screens/home/Transactions';
import BankStatement from '../screens/home/BankStatement';
import Clients from '../screens/home/Clients';
import Plus from '../screens/home/Plus';
import Expenses from '../screens/home/Expenses';

const Tab = createBottomTabNavigator();

const HomeTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

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
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      />
      <Tab.Screen
        name="Facture"
        component={Invoice}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      />
      <Tab.Screen
        name="Dépenses"
        component={Expenses}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
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
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      />
      <Tab.Screen
        name="Plus"
        component={Plus}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Image source={fileIcon} style={{ width: 24, height: 24, tintColor: color }} resizeMode="contain" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeTabs;
