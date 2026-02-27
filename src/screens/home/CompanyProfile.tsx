import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, Building2 } from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

const CompanyProfile: React.FC = ({ navigation }: any) => {
  const [billingName, setBillingName] = useState('');
  const [siret, setSiret] = useState('');         // billing_phone
  const [vatNumber, setVatNumber] = useState('');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await api.get(Api_Endpoints.customerProfile);
      const d = res.data?.data ?? {};
      setBillingName(d.billing_name ?? '');
      setSiret(d.billing_phone ?? '');
      setVatNumber(d.vat_number ?? '');
      setAddress(d.billing_address ?? '');
      // GET returns billing_zip, PUT validates billing_zip_code
      setZipCode(d.billing_zip ?? d.billing_zip_code ?? '');
      setCity(d.billing_city ?? '');
      setWebsite(d.website ?? '');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible de charger les données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const getInitials = () => {
    const w = billingName.trim().split(/\s+/).filter(Boolean);
    if (w.length >= 2) return `${w[0][0]}${w[1][0]}`.toUpperCase();
    if (w.length === 1) return w[0].substring(0, 2).toUpperCase();
    return 'E';
  };

  const handleSave = async () => {
    if (!billingName.trim()) {
      Alert.alert('Requis', "Veuillez saisir le nom de l'entreprise.");
      return;
    }
    setSaving(true);
    try {
      await api.post(Api_Endpoints.customerProfile, {
        _method: 'PUT',
        billing_name: billingName.trim(),
        billing_phone: siret.trim(),
        vat_number: vatNumber.trim(),
        billing_address: address.trim(),
        billing_zip: zipCode.trim(),
        billing_city: city.trim(),
        website: website.trim(),
      });
      Alert.alert('Succès', 'Informations mises à jour avec succès.');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la mise à jour.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3B6FD4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations de l'entreprise</Text>

            {/* Company avatar */}
            <View style={styles.avatarRow}>
              <View style={styles.avatarCircle}>
                <Building2 size={32} color="#FFFFFF" />
              </View>
              <View style={styles.avatarMeta}>
                <Text style={styles.avatarName} numberOfLines={1}>
                  {billingName.trim() || 'Votre entreprise'}
                </Text>
                <Text style={styles.avatarSub} numberOfLines={1}>
                  {city.trim() || 'Ville non renseignée'}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Nom de l'entreprise */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Nom de l'entreprise</Text>
              <TextInput
                style={styles.fieldInput}
                value={billingName}
                onChangeText={setBillingName}
                placeholder="Acme Corp"
                placeholderTextColor="#AAAAAA"
              />
            </View>

            {/* SIRET + N° TVA side by side */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>SIRET</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={siret}
                  onChangeText={setSiret}
                  placeholder="000 000 000 00000"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="default"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>N° TVA</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={vatNumber}
                  onChangeText={setVatNumber}
                  placeholder="FR00000000000"
                  placeholderTextColor="#AAAAAA"
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Adresse */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Adresse</Text>
              <TextInput
                style={styles.fieldInput}
                value={address}
                onChangeText={setAddress}
                placeholder="12 rue de la Paix"
                placeholderTextColor="#AAAAAA"
              />
            </View>

            {/* Code postal + Ville side by side */}
            <View style={styles.rowFields}>
              <View style={[styles.halfField, { flex: 0.9 }]}>
                <Text style={styles.fieldLabel}>Code postal</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={zipCode}
                  onChangeText={setZipCode}
                  placeholder="75001"
                  placeholderTextColor="#AAAAAA"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.halfField, { flex: 1.1 }]}>
                <Text style={styles.fieldLabel}>Ville</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Paris"
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </View>

            {/* Site web */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Site web (optionnel)</Text>
              <TextInput
                style={styles.fieldInput}
                value={website}
                onChangeText={setWebsite}
                placeholder="https://www.monentreprise.com"
                placeholderTextColor="#AAAAAA"
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.divider} />

            {/* Action buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Save size={17} color="#FFFFFF" />
                    <Text style={styles.saveBtnText}>Enregistrer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },

  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  logo: { height: 44, width: 150 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 24,
  },

  // Avatar / hero row
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#3B6FD4',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarMeta: { flex: 1 },
  avatarName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 4,
  },
  avatarSub: {
    fontSize: 13,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F5',
    marginVertical: 20,
  },

  // Fields
  rowFields: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  halfField: {
    flex: 1,
    gap: 6,
  },
  fieldBlock: {
    gap: 6,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555577',
  },
  fieldInput: {
    borderWidth: 1.5,
    borderColor: '#E2E6F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 13 : 11,
    fontSize: 14,
    color: '#1A1A2E',
    backgroundColor: '#FAFBFF',
  },

  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D0D5E8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444466',
  },
  saveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3B6FD4',
    borderRadius: 12,
    paddingVertical: 14,
    shadowColor: '#3B6FD4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default CompanyProfile;
