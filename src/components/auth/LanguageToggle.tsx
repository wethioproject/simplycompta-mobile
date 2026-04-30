import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const LANGUAGE_KEY = 'appLanguage';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('fr') ? 'fr' : 'en';

  const toggle = async (lang: 'en' | 'fr') => {
    if (lang === current) return;
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await i18n.changeLanguage(lang);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.pill, current === 'en' && styles.pillActive]}
        onPress={() => toggle('en')}
        activeOpacity={0.75}
      >
        <Text style={[styles.pillText, current === 'en' && styles.pillTextActive]}>EN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.pill, current === 'fr' && styles.pillActive]}
        onPress={() => toggle('fr')}
        activeOpacity={0.75}
      >
        <Text style={[styles.pillText, current === 'fr' && styles.pillTextActive]}>FR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 3,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },
  pillActive: {
    backgroundColor: '#1E5BAC',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888888',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
});

export default LanguageToggle;
