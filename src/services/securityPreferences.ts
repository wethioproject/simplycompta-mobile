import AsyncStorage from '@react-native-async-storage/async-storage';

export type SecurityEvent = {
  id: string;
  label: string;
  createdAt: string;
};

export type SecurityPreferences = {
  biometricEnabled: boolean;
  privateModeEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockMinutes: number;
  securityEvents: SecurityEvent[];
};

const STORAGE_KEY = '@simplycompta/security-preferences';

const defaults: SecurityPreferences = {
  biometricEnabled: false,
  privateModeEnabled: false,
  autoLockEnabled: true,
  autoLockMinutes: 3,
  securityEvents: [],
};

export const getSecurityPreferences = async (): Promise<SecurityPreferences> => {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return defaults;

  try {
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
};

export const saveSecurityPreferences = async (preferences: SecurityPreferences) => {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
};

export const addSecurityEvent = async (label: string): Promise<SecurityEvent[]> => {
  const current = await getSecurityPreferences();
  const nextEvents = [
    { id: `${Date.now()}`, label, createdAt: new Date().toISOString() },
    ...current.securityEvents,
  ].slice(0, 8);

  await saveSecurityPreferences({ ...current, securityEvents: nextEvents });
  return nextEvents;
};
