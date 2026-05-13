import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeTabs from './HomeTabs';
import DrawerContent from '../components/common/DrawerContent';

const Drawer = createDrawerNavigator();

const HomeDrawer: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        // drawerPosition: 'left', // Opens from right side
        // drawerType: 'slide', // Can be 'front', 'back', or 'slide'
        drawerStyle: {
          width: 280, // Width of drawer
        },
        overlayColor: 'rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Your TabNavigator as a drawer screen */}
      <Drawer.Screen
        name="HomeTabs"
        component={HomeTabs}
        options={{
          drawerLabel: 'Dashboard',
        }}
      />
    </Drawer.Navigator>
  );
};

export default HomeDrawer;
