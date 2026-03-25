import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Lock, PhoneCall } from 'lucide-react-native';
import { navigationRef } from '../navigation/navigationRef';

const ALLOWED_ROUTES = ['Contact'];

const RestrictedAccessModal: React.FC = () => {
  const { t } = useTranslation();
  const isEnableLogin = useSelector((state: any) => state.app.isEnableLogin);
  const [currentRoute, setCurrentRoute] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = navigationRef.addListener('state', () => {
      setCurrentRoute(navigationRef.getCurrentRoute()?.name);
    });
    return unsubscribe;
  }, []);

  if (isEnableLogin === 1 || ALLOWED_ROUTES.includes(currentRoute ?? '')) return null;

  const handleContact = () => {
    if (navigationRef.isReady()) {
      navigationRef.navigate('Contact' as never);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {}} 
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconBox}>
            <Lock size={36} color="#DC2626" />
          </View>

          <Text style={styles.title}>{t('restricted_title')}</Text>

          <Text style={styles.message}>{t('restricted_message')}</Text>

          <View style={styles.safeBox}>
            <Text style={styles.safeText}>{t('restricted_data_safe')}</Text>
          </View>

          <TouchableOpacity
            style={styles.cta}
            onPress={handleContact}
            activeOpacity={0.85}
          >
            <PhoneCall size={18} color="#FFFFFF" />
            <Text style={styles.ctaText}>{t('restricted_cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 16,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  safeBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 24,
    width: '100%',
  },
  safeText: {
    fontSize: 13,
    color: '#16A34A',
    textAlign: 'center',
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E5BAC',
    borderRadius: 14,
    paddingVertical: 15,
    width: '100%',
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RestrictedAccessModal;
