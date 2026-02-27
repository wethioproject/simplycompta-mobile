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
import { Save, Camera, Trash2 } from 'lucide-react-native';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { appLogoIcon } from '../../assets/icons';
import api from '../../api';
import { Api_Endpoints } from '../../services/endpoints';

interface AvatarFile {
  uri: string;
  name: string;
  type: string;
}

const PersonalProfile: React.FC = ({ navigation }: any) => {
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

  const fetchProfile = async () => {
    try {
      const res = await api.get(Api_Endpoints.customerProfile);
      const d = res.data?.data ?? {};
      const fullName: string = d.name ?? '';
      const spaceIdx = fullName.indexOf(' ');
      console.log('Profile data:', d);
      setFirstName(spaceIdx >= 0 ? fullName.substring(0, spaceIdx) : fullName);
      setLastName(spaceIdx >= 0 ? fullName.substring(spaceIdx + 1) : '');
      setEmail(d.email ?? '');
      setPhone(d.contact ?? '');   // GET response key is `contact`
      setBio(d.bio ?? '');
      setAvatarUrl(d.avatar_url ?? '');
    } catch (e: any) {
      Alert.alert('Erreur', e?.response?.data?.message ?? 'Impossible de charger le profil.');
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
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image.');
    }
  };

  // Remove locally-selected avatar (does not call API — saved on submit)
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarUrl('');
  };

  const handleSave = async () => {
    if (!firstName.trim()) {
      Alert.alert('Requis', 'Veuillez saisir votre prénom.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('_method', 'PUT');
      formData.append('name', `${firstName.trim()} ${lastName.trim()}`.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());   // PUT validation key is `phone`
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
      // Refresh avatar URL from response
      const updated = res.data?.data;
      if (updated?.avatar) setAvatarUrl(updated.avatar);
      setAvatarFile(null);
      Alert.alert('Succès', 'Profil mis à jour avec succès.');
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Erreur lors de la mise à jour.';
      Alert.alert('Erreur', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le compte',
      'Voulez-vous vraiment supprimer votre compte ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer', style: 'destructive', onPress: async () => {
            setDeleting(true);
            try {
              await api.delete(Api_Endpoints.customerProfile);
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            } catch (e: any) {
              const msg = e?.response?.data?.message ?? 'Erreur lors de la suppression.';
              Alert.alert('Erreur', msg);
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
          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Informations personnelles</Text>

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
                  <Text style={styles.changePhotoBtnText}>Changer la photo</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleRemoveAvatar} activeOpacity={0.7}>
                  <Text style={styles.removePhotoText}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Prénom + Nom side by side */}
            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Prénom</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Prénom"
                  placeholderTextColor="#AAAAAA"
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Nom</Text>
                <TextInput
                  style={styles.fieldInput}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Nom"
                  placeholderTextColor="#AAAAAA"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={styles.fieldInput}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemple.com"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Téléphone */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Téléphone</Text>
              <TextInput
                style={styles.fieldInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+212 6 00 00 00 00"
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
              />
            </View>

            {/* Bio */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Bio (optionnel)</Text>
              <TextInput
                style={styles.bioInput}
                value={bio}
                onChangeText={setBio}
                placeholder="Parlez-nous de vous..."
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
            <Text style={styles.deleteAccountText}>Supprimer mon compte</Text>
          </TouchableOpacity>
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
