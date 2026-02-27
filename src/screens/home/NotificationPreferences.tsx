import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Bell, User, CreditCard, ArrowLeft } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';

interface PreferenceItem {
  key: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PREFERENCES: PreferenceItem[] = [
  {
    key: 'email',
    icon: <Mail size={20} color="#9CA3AF" />,
    title: 'Notifications par email',
    description: 'Recevez des emails pour les transactions importantes',
  },
  {
    key: 'transactions',
    icon: <Bell size={20} color="#9CA3AF" />,
    title: 'Nouvelles transactions',
    description: 'Notification pour chaque nouvelle transaction',
  },
  {
    key: 'clients',
    icon: <User size={20} color="#9CA3AF" />,
    title: 'Nouveaux clients',
    description: "Notification lors de l'ajout d'un client",
  },
  {
    key: 'invoices',
    icon: <CreditCard size={20} color="#9CA3AF" />,
    title: 'Factures en attente',
    description: 'Rappel pour les factures non payées',
  },
];

const NotificationPreferences: React.FC = ({ navigation }: any) => {
  const [values, setValues] = useState<Record<string, boolean>>({
    email: true,
    transactions: true,
    clients: true,
    invoices: true,
  });

  const toggle = (key: string) =>
    setValues(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={{ flex: 1 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Préférences de notification</Text>

          {PREFERENCES.map((item, index) => (
            <View
              key={item.key}
              style={[
                styles.prefRow,
                index < PREFERENCES.length - 1 && styles.prefRowBorder,
              ]}
            >
              {/* Icon + text */}
              <View style={styles.prefLeft}>
                <View style={styles.prefTextBlock}>
                  <Text style={styles.prefTitle}>{item.title}</Text>
                  <View style={styles.prefDescRow}>
                    <View style={styles.prefIconBox}>{item.icon}</View>
                    <Text style={styles.prefDesc}>{item.description}</Text>
                  </View>
                </View>
              </View>

              {/* Toggle */}
              <Switch
                value={values[item.key]}
                onValueChange={() => toggle(item.key)}
                trackColor={{ false: '#E5E7EB', true: '#3B6FD4' }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },

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
  headerTop: { alignItems: 'center', marginBottom: 12 },
  logo: { height: 44, width: 150 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 20,
  },

  // Preference row
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    gap: 12,
  },
  prefRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  prefLeft: {
    flex: 1,
  },
  prefTextBlock: {
    gap: 6,
  },
  prefTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  prefDescRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  prefIconBox: {
    marginTop: Platform.OS === 'ios' ? 1 : 2,
    flexShrink: 0,
  },
  prefDesc: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
});

export default NotificationPreferences;
