import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Check, Languages } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';

const LANGUAGES = [
  { code: 'fr', label: 'Français', nativeLabel: 'French', flag: '🇫🇷' },
  { code: 'en', label: 'English', nativeLabel: 'Anglais', flag: '🇬🇧' },
];

const LanguageSettings: React.FC = ({ navigation }: any) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleSelect = (code: string) => {
    if (code !== currentLanguage) {
      i18n.changeLanguage(code);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleText}>{t('language_settings')}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Preview card */}
        {/* <View style={styles.previewCard}>
          <View style={styles.previewIconRow}>
            <Languages size={22} color="#1E5BAC" />
            <Text style={styles.previewLabel}>{t('language_preview_label')}</Text>
          </View>
          <Text style={styles.previewText}>{t('welcome')}</Text>
        </View> */}

        {/* Language list */}
        <Text style={styles.sectionLabel}>{t('select_language')}</Text>
        <View style={styles.listCard}>
          {LANGUAGES.map((lang, index) => {
            const isSelected = currentLanguage === lang.code || currentLanguage.startsWith(lang.code);
            return (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.langRow,
                  index < LANGUAGES.length - 1 && styles.langRowBorder,
                  isSelected && styles.langRowSelected,
                ]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <View style={styles.langTextGroup}>
                  <Text style={[styles.langLabel, isSelected && styles.langLabelSelected]}>
                    {lang.label}
                  </Text>
                  <Text style={styles.langNative}>{lang.nativeLabel}</Text>
                </View>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: { height: 48, width: 160 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  previewIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  previewText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E5BAC',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
    marginTop: 4,
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 14,
    backgroundColor: '#FFFFFF',
  },
  langRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  langRowSelected: {
    backgroundColor: '#EFF6FF',
  },
  langFlag: {
    fontSize: 28,
  },
  langTextGroup: {
    flex: 1,
    gap: 2,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  langLabelSelected: {
    color: '#1E5BAC',
    fontWeight: '700',
  },
  langNative: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LanguageSettings;
