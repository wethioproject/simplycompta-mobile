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
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Save, Camera, Trash2, ArrowLeft } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';
import authService from '../../services/authService';
import { updateCustomer } from '../../store/slices/userSlice';

interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

const PersonalProfile: React.FC = ({ navigation }: any) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');      // URL from server
  const [avatarFile, setAvatarFile] = useState<AvatarFile | null>(null); // locally picked file
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const withCacheBuster = (url?: string | null) => {
    if (!url) return '';
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${Date.now()}`;
  };

  const applyProfileToState = async (profile: any, bustAvatarCache = false) => {
    const fullName: string = profile.name ?? '';
    const spaceIdx = fullName.indexOf(' ');
    const nextAvatarUrl = profile.avatar_url ?? profile.avatar ?? '';
    const displayAvatarUrl = bustAvatarCache ? withCacheBuster(nextAvatarUrl) : nextAvatarUrl;

    setFirstName(spaceIdx >= 0 ? fullName.substring(0, spaceIdx) : fullName);
    setLastName(spaceIdx >= 0 ? fullName.substring(spaceIdx + 1) : '');
    setEmail(profile.email ?? '');
    setPhone(profile.contact ?? '');
    setBio(profile.bio ?? '');
    setAvatarUrl(displayAvatarUrl);

    const customerPatch = {
      ...profile,
      name: fullName,
      avatar: displayAvatarUrl,
      avatar_url: displayAvatarUrl,
    };
    dispatch(updateCustomer(customerPatch));
    await authService.updateStoredCustomer(customerPatch);
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get(Api_Endpoints.customerProfile);
      const d = res.data?.data ?? {};
      console.log('Profile data:', d);
      await applyProfileToState(d);
    } catch (e: any) {
      Alert.alert(t('error_title'), e?.response?.data?.message ?? t('error_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const getInitials = () => {
    const f = firstName.trim().charAt(0).toUpperCase();
    const l = lastName.trim().charAt(0).toUpperCase();
    return `${f}${l}` || '?';
  };

  // Pick an image from the device
  const handlePickAvatar = async () => {
    try {
      const [file] = await pick({ type: [types.images] });
      setAvatarFile({
        uri: file.uri,
        name: file.name ?? 'avatar.jpg',
        type: file.type ?? 'image/jpeg',
      });
    } catch (e) {
      if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
      Alert.alert(t('error_title'), t('error_select_image'));
    }
  };

  // Remove locally-selected avatar (does not call API — saved on submit)
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl('');
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert(t('field_required'), t('error_first_name_required'));
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', `${firstName.trim()} ${lastName.trim()}`.trim());
      formData.append('email', email.trim());
      formData.append('contact', phone.trim());   // PUT validation key is `phone`
      formData.append('bio', bio.trim());

      if (avatarFile) {
        formData.append('avatar', {
          uri: avatarFile.uri,
          name: avatarFile.name,
          type: avatarFile.type,
        } as any);
      }

      const res = await api.post(Api_Endpoints.customerProfile, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const refreshed = await api.get(Api_Endpoints.customerProfile).catch(() => null);
      const updated = refreshed?.data?.data ?? res.data?.data ?? {};
      await applyProfileToState(updated, !!avatarFile);
      setAvatarFile(null);
      Alert.alert(t('success_title'), t('success_profile_updated'));
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? t('error_profile_update');
      Alert.alert(t('error_title'), msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('delete_account_title'),
      t('delete_account_confirmation'),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'), style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(Api_Endpoints.customerProfile);
              navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? t('error_delete_account');
              Alert.alert(t('error_title'), msg);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  const handleCancel = () => navigation.goBack();

  const showAvatar = avatarFile?.uri || (avatarUrl && avatarUrl.length > 0);

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
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        <View style={{ width: 40 }} />
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
          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('personal_info_title')}</Text>

            {/* Avatar row */}
            <View style={styles.avatarRow}>
              {showAvatar ? (
                <Image
                  source={{ uri: avatarFile?.uri || avatarUrl }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>{getInitials()}</Text>
                </View>
              )}
              <View style={styles.avatarActions}>
                <TouchableOpacity style={styles.changePhotoBtn} onPress={handlePickAvatar} activeOpacity={0.8}>
                  <Camera size={15} color="#1A1A2E" />
                  <Text style={styles.changePhotoBtnText}>{t('button_change_photo')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRemoveAvatar} activeOpacity={0.7}>
                  <Text style={styles.removePhotoText}>{t('button_remove')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Prénom + Nom side by side */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_first_name')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder={t('placeholder_first_name')}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>{t('label_last_name')}</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder={t('placeholder_last_name')}
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_email')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                placeholder={t('placeholder_email')}
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Téléphone */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_phone')}</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder={t('placeholder_phone')}
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
              />
            </View>

            {/* Bio */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>{t('label_bio')}</Text>
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder={t('placeholder_bio')}
                placeholderTextColor="#AAAAAA"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.divider} />

            {/* Save / Cancel buttons */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancel}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>{t('button_cancel')}</Text>
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
                    <Text style={styles.saveBtnText}>{t('button_save')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete account */}
          <TouchableOpacity
            style={[styles.deleteAccountBtn, deleting && { opacity: 0.6 }]}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#E53535" />
              : <Trash2 size={16} color="#E53535" />}
            <Text style={styles.deleteAccountText}>{t('button_delete_account')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F2F8' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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

  // Avatar
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B6FD4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  avatarActions: {
    gap: 10,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#D0D5E8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  changePhotoBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1A2E',
  },
  removePhotoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#E53535',
    paddingHorizontal: 2,
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
  bioInput: {
    borderWidth: 1.5,
    borderColor: '#E2E6F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#1A1A2E',
    backgroundColor: '#FAFBFF',
    height: 110,
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

  // Delete account
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    paddingVertical: 14,
  },
  deleteAccountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E53535',
  },
});

export default PersonalProfile;
