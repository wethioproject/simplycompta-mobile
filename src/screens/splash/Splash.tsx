import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { appLogoIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';
import { useOnboarding } from '../../hooks/useOnboarding';

const Splash = ({ navigation }: any) => {
  const { checkAuth } = useAuth();
  const { hasSeenOnboarding } = useOnboarding();

  useEffect(() => {
    // Wait until AsyncStorage resolves onboarding status
    if (hasSeenOnboarding === null) return;

    const initializeAuth = async () => {
      // 2 seconds wait for splash screen
      const [isAuthenticated] = await Promise.all([
        checkAuth(),
        new Promise<void>((resolve) =>
          setTimeout(() => resolve(), 2000)
        ),
      ]);

      // Navigate based on onboarding + auth status
      if (!hasSeenOnboarding) {
        navigation.replace('Onboarding');
      } else if (isAuthenticated) {
        navigation.replace('Home');
      } else {
        navigation.replace('Login');
      }
    };

    initializeAuth();
  }, [hasSeenOnboarding]);

  return (
    <View style={styles.container}>
      <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
    </View>
  );
};

export default Splash;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  logo: {
    width: 250,
    height: 150,
  },
});
