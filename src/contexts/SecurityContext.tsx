import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';
import {
  SecurityEvent,
  SecurityPreferences,
  addSecurityEvent,
  getSecurityPreferences,
  saveSecurityPreferences,
} from '../services/securityPreferences';

type SecurityContextValue = SecurityPreferences & {
  ready: boolean;
  biometricLabel: string;
  setBiometricEnabled: (value: boolean) => Promise<boolean>;
  setPrivateModeEnabled: (value: boolean) => Promise<void>;
  setAutoLockEnabled: (value: boolean) => Promise<void>;
  setAutoLockMinutes: (value: number) => Promise<void>;
  togglePrivateMode: () => Promise<void>;
  maskAmount: (value: string | number | null | undefined, suffix?: string) => string;
  recordSecurityEvent: (label: string) => Promise<void>;
  requestSensitiveAuth: (reason: string) => Promise<boolean>;
};

const SecurityContext = createContext<SecurityContextValue | null>(null);

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: true });

const formatAmount = (value: string | number | null | undefined, suffix = 'MAD') => {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) return `0 ${suffix}`;
  return `${numeric.toLocaleString('fr-FR', { maximumFractionDigits: 2 })} ${suffix}`;
};

export const SecurityProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [prefs, setPrefs] = useState<SecurityPreferences>({
    biometricEnabled: false,
    privateModeEnabled: false,
    autoLockEnabled: true,
    autoLockMinutes: 3,
    securityEvents: [],
  });
  const [ready, setReady] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState(Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biométrie');

  useEffect(() => {
    let mounted = true;
    const hydrate = async () => {
      const stored = await getSecurityPreferences();
      const availability = await rnBiometrics.isSensorAvailable().catch(() => null);
      if (!mounted) return;
      if (availability?.biometryType === BiometryTypes.FaceID) setBiometricLabel('Face ID');
      else if (availability?.biometryType === BiometryTypes.TouchID) setBiometricLabel('Touch ID');
      else if (availability?.biometryType === BiometryTypes.Biometrics) setBiometricLabel('Biométrie');
      setPrefs(stored);
      setReady(true);
    };
    hydrate();
    return () => { mounted = false; };
  }, []);

  const persist = useCallback(async (next: SecurityPreferences) => {
    setPrefs(next);
    await saveSecurityPreferences(next);
  }, []);

  const recordSecurityEvent = useCallback(async (label: string) => {
    const events = await addSecurityEvent(label);
    setPrefs(current => ({ ...current, securityEvents: events }));
  }, []);

  const requestSensitiveAuth = useCallback(async (reason: string) => {
    if (!prefs.biometricEnabled) return true;

    const availability = await rnBiometrics.isSensorAvailable().catch(() => null);
    if (!availability?.available) {
      Alert.alert('Sécurité', 'La biométrie n’est pas disponible sur cet appareil.');
      return false;
    }

    const result = await rnBiometrics.simplePrompt({
      promptMessage: reason,
      cancelButtonText: 'Annuler',
    }).catch(() => ({ success: false }));

    if (result.success) {
      await recordSecurityEvent(reason);
    }
    return !!result.success;
  }, [prefs.biometricEnabled, recordSecurityEvent]);

  const setBiometricEnabled = useCallback(async (value: boolean) => {
    if (value) {
      const availability = await rnBiometrics.isSensorAvailable().catch(() => null);
      if (!availability?.available) {
        Alert.alert('Sécurité', 'La biométrie n’est pas disponible sur cet appareil.');
        return false;
      }

      const result = await rnBiometrics.simplePrompt({
        promptMessage: 'Activer la protection biométrique',
        cancelButtonText: 'Annuler',
      }).catch(() => ({ success: false }));
      if (!result.success) return false;
    }
    await persist({ ...prefs, biometricEnabled: value });
    await recordSecurityEvent(value ? `${biometricLabel} activé` : `${biometricLabel} désactivé`);
    return true;
  }, [biometricLabel, persist, prefs, recordSecurityEvent]);

  const setPrivateModeEnabled = useCallback(async (value: boolean) => {
    await persist({ ...prefs, privateModeEnabled: value });
    await recordSecurityEvent(value ? 'Mode privé activé' : 'Mode privé désactivé');
  }, [persist, prefs, recordSecurityEvent]);

  const setAutoLockEnabled = useCallback(async (value: boolean) => {
    await persist({ ...prefs, autoLockEnabled: value });
  }, [persist, prefs]);

  const setAutoLockMinutes = useCallback(async (value: number) => {
    await persist({ ...prefs, autoLockMinutes: value });
  }, [persist, prefs]);

  const togglePrivateMode = useCallback(async () => {
    await setPrivateModeEnabled(!prefs.privateModeEnabled);
  }, [prefs.privateModeEnabled, setPrivateModeEnabled]);

  const maskAmount = useCallback((value: string | number | null | undefined, suffix = 'MAD') => (
    prefs.privateModeEnabled ? `•••• ${suffix}` : formatAmount(value, suffix)
  ), [prefs.privateModeEnabled]);

  const value = useMemo<SecurityContextValue>(() => ({
    ...prefs,
    ready,
    biometricLabel,
    setBiometricEnabled,
    setPrivateModeEnabled,
    setAutoLockEnabled,
    setAutoLockMinutes,
    togglePrivateMode,
    maskAmount,
    recordSecurityEvent,
    requestSensitiveAuth,
  }), [
    prefs,
    ready,
    biometricLabel,
    setBiometricEnabled,
    setPrivateModeEnabled,
    setAutoLockEnabled,
    setAutoLockMinutes,
    togglePrivateMode,
    maskAmount,
    recordSecurityEvent,
    requestSensitiveAuth,
  ]);

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
};

export const useSecurity = () => {
  const value = useContext(SecurityContext);
  if (!value) throw new Error('useSecurity must be used inside SecurityProvider');
  return value;
};
