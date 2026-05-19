import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { updateClient } from '../../services/client.service';

interface EditClientModalProps {
  visible: boolean;
  clientData: any;
  onClose: () => void;
  onUpdated: (updated: any) => void;
}

export const EditClientModal: React.FC<EditClientModalProps> = ({
  visible,
  clientData,
  onClose,
  onUpdated,
}) => {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();

  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [commercialRegister, setCommercialRegister] = useState('');
  const [ice, setIce] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible && clientData) {
      setCompanyName(clientData.company_name ?? '');
      setClientName(clientData.client_name ?? '');
      setEmail(clientData.email ?? '');
      setTelephone(clientData.telephone ?? '');
      setPostalCode(clientData.postal_code ?? '');
      setCity(clientData.city ?? '');
      setCommercialRegister(clientData.commercial_register ?? '');
      setIce(clientData.ice ?? '');
    }
  }, [visible, clientData]);

  const handleUpdate = async () => {
    if (!companyName.trim()) {
      Alert.alert(t('alert_field_required'), t('message_company_name_required'));
      return;
    }
    if (!clientName.trim()) {
      Alert.alert(t('alert_field_required'), t('message_client_name_required', { defaultValue: 'Veuillez saisir le nom du contact.' }));
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert(t('alert_field_required'), t('signup_error_email_invalid', { defaultValue: 'Email invalide' }));
      return;
    }
    setSaving(true);
    try {
      const res = await updateClient(clientData.id, {
        company_name: companyName.trim(),
        client_name: clientName.trim(),
        email: email.trim(),
        telephone: telephone.trim(),
        postal_code: postalCode.trim(),
        city: city.trim(),
        commercial_register: commercialRegister.trim(),
        ice: ice.trim(),
      });
      const updated =
        res.data?.data ?? {
          ...clientData,
          company_name: companyName.trim(),
          client_name: clientName.trim(),
          email: email.trim(),
          telephone: telephone.trim(),
          postal_code: postalCode.trim(),
          city: city.trim(),
          commercial_register: commercialRegister.trim(),
          ice: ice.trim(),
        };
      Alert.alert(t('success_title'), t('success_client_updated'));
      onUpdated(updated);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la mise à jour du client.';
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.modalBackBtn} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#1E5BAC" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{t('title_edit_client')}</Text>
          <TouchableOpacity
            style={[styles.modalConfirmBtn, saving && { opacity: 0.7 }]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={styles.modalConfirmText}>{t('modal_confirm_text')}</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_company_name')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  value={companyName}
                  onChangeText={setCompanyName}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_contact_name')} <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  value={clientName}
                  onChangeText={setClientName}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_email')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_phone')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={telephone}
                  onChangeText={setTelephone}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_postal_code')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={postalCode}
                  onChangeText={setPostalCode}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_city')}</Text>
                <TextInput style={styles.fieldInput} value={city} onChangeText={setCity} />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_commercial_register')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={commercialRegister}
                  onChangeText={setCommercialRegister}
                />
              </View>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>{t('label_ice')}</Text>
                <TextInput style={styles.fieldInput} value={ice} onChangeText={setIce} />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.confirmBtn, saving && { opacity: 0.7 }]}
              onPress={handleUpdate}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.confirmBtnText}>{t('button_save_changes')}</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F5F7FF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  modalConfirmBtn: {
    backgroundColor: '#1E5BAC',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },
  formCard: { borderRadius: 16, paddingVertical: 18, gap: 16, marginBottom: 16 },
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#DC2626' },
  fieldInput: {
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  confirmBtn: {
    backgroundColor: '#1E5BAC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
