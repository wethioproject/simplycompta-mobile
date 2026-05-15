import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Image, StyleSheet, Text, View } from 'react-native';
import { appLogoIcon } from '../../assets/icons';
import { useSecurity } from '../../contexts/SecurityContext';

const SecurityGate: React.FC = () => {
  const {
    ready,
    biometricEnabled,
    autoLockEnabled,
    autoLockMinutes,
    requestSensitiveAuth,
  } = useSecurity();
  const appState = useRef<AppStateStatus>(AppState.currentState);
  const backgroundAt = useRef<number | null>(null);
  const [shieldVisible, setShieldVisible] = useState(false);
  const unlockedOnce = useRef(false);

  useEffect(() => {
    if (!ready || !biometricEnabled || unlockedOnce.current) return;
    unlockedOnce.current = true;
    requestSensitiveAuth('Déverrouiller SimplyCompta');
  }, [biometricEnabled, ready, requestSensitiveAuth]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async nextState => {
      const previous = appState.current;
      appState.current = nextState;

      if (nextState === 'inactive' || nextState === 'background') {
        backgroundAt.current = Date.now();
        setShieldVisible(true);
        return;
      }

      if (previous.match(/inactive|background/) && nextState === 'active') {
        setShieldVisible(false);
        const elapsed = Date.now() - (backgroundAt.current ?? Date.now());
        const shouldLock = ready && biometricEnabled && autoLockEnabled && elapsed >= autoLockMinutes * 60 * 1000;
        if (shouldLock) {
          await requestSensitiveAuth('Déverrouiller SimplyCompta');
        }
      }
    });

    return () => subscription.remove();
  }, [autoLockEnabled, autoLockMinutes, biometricEnabled, ready, requestSensitiveAuth]);

  if (!shieldVisible) return null;

  return (
    <View pointerEvents="none" style={styles.overlay}>
      <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
      <Text style={styles.label}>SimplyCompta</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: { width: 170, height: 64 },
  label: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E5BAC',
  },
});

export default SecurityGate;
