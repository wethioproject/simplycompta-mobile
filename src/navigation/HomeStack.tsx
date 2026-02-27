import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/home/Home';
import HomeProfile from '../screens/home/Profile';
import LegalDocuments from '../screens/home/Legal';
import AccountingDocuments from '../screens/home/Accounting';
import Activity from '../screens/home/Activity';
import BankStatements from '../screens/home/BankStatements';
import Contact from '../screens/home/Contact';
import Notifications from '../screens/notification/Notifications';
import NotificationDetail from '../screens/notification/NotificationDetail';

const Stack = createStackNavigator();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={Home} />
      <Stack.Screen name="Profile" component={HomeProfile} />
      <Stack.Screen name="Legal Documents" component={LegalDocuments} />
      <Stack.Screen name="Accounting Documents" component={AccountingDocuments} />
      <Stack.Screen name="Activity" component={Activity} />
      <Stack.Screen name="Bank Statements" component={BankStatements} />
      <Stack.Screen name="Contact" component={Contact} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="Notification Detail" component={NotificationDetail} />
    </Stack.Navigator>
  );
};

export default HomeStack;
