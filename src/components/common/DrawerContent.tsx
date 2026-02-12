import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { fileIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';

interface DrawerContentProps {
  navigation: DrawerNavigationProp<any>;
}

const DrawerContent: React.FC<DrawerContentProps> = ({ navigation }) => {
  const { logout } = useAuth();
  const menuItems = [
    { id: 1, label: 'Mon entreprise', icon: '👤', action: 'mybusiness' },
    { id: 2, label: 'Mon compte', icon: '👤', action: 'myaccount' },
    { id: 3, label: 'Mot de passe', icon: '⚙️', action: 'changepassword' },
    { id: 4, label: 'Paramètres', icon: '❓', action: 'settings' },
  ];

  const handleLogout = async () => {
   await logout();
   navigation.reset({
     index: 0,
     routes: [{ name: 'Login' }],
   });
  // if (result.success) {
  //   navigation.navigate('Login');
  // }
  };

  const handleMenuPress = (action: string) => {
    // This closes the drawer automatically, then navigates
    navigation.closeDrawer();
    // TODO: Add navigation logic - example:
    // navigation.navigate('Profile');
    if(action === 'mybusiness') {
        navigation.navigate('My Business');
    } else if(action === 'myaccount') {
        navigation.navigate('My Account');
    } else if(action === 'changepassword') {
        navigation.navigate('Change Password');
    } else if(action === 'settings') {
        navigation.navigate('Settings');
    }
    console.log('Action:', action);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>John Doe</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.action)}
          >
            {/* <Text style={styles.menuItemIcon}>{item.icon}</Text> */}
            <Image source={fileIcon} style={{ width: 18, height: 18, marginRight: 12, }} resizeMode="contain" />
            <Text style={styles.menuItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={styles.logoutButton}
          // onPress={() => {
          //   // Add your logout logic here
          //   console.log('Logout pressed');
          //   navigation.navigate('Login');
          // }}
          onPress={handleLogout}
        >
          {/* <Text style={styles.logoutIcon}>🚪</Text> */}
          <Image source={fileIcon} style={{ width: 18, height: 18, marginRight: 12, }} resizeMode="contain" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    // borderBottomWidth: 1,
    // borderBottomColor: '#E5E5E5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
  },
  menuContainer: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',
  },
  menuItemIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuItemLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  logoutSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: '#FFE5E5',
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    // color: '#E74C3C',
    fontWeight: '600',
  },
});

export default DrawerContent;
