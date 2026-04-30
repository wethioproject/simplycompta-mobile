import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Upload, X } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { launchImageLibrary } from 'react-native-image-picker';

export interface Step3Data {
  address?: string;
  postalCode?: string;
  website?: string;
  ice?: string;
  patente?: string;
  rc?: string;
  cnss?: string;
  ifNum?: string;
  rib?: string;
  vat?: string;
  logo?: any;
  signature?: any;
}

interface SignupStep3Props {
  onComplete: (data: Step3Data) => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FileAsset {
  uri: string;
  name: string;
  type: string;
}

const SignupStep3: React.FC<SignupStep3Props> = ({ onComplete, onBack, onSkip }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [website, setWebsite] = useState('');
  const [ice, setIce] = useState('');
  const [patente, setPatente] = useState('');
  const [rc, setRc] = useState('');
  const [cnss, setCnss] = useState('');
  const [ifNum, setIfNum] = useState('');
  const [rib, setRib] = useState('');
  const [vat, setVat] = useState('');
  const [logo, setLogo] = useState<FileAsset | null>(null);
  const [signature, setSignature] = useState<FileAsset | null>(null);

  const pickImage = async (onPicked: (file: FileAsset) => void) => {
    try {
      launchImageLibrary(
        { mediaType: 'photo', quality: 1 },
        response => {
          if (response.didCancel || response.errorCode) return;
          const asset = response.assets?.[0];
          if (!asset?.uri) return;
          onPicked({
            uri: asset.uri,
            name: asset.fileName ?? `image_${Date.now()}.jpg`,
            type: asset.type ?? 'image/jpeg',
          });
        },
      );
    } catch {
      Alert.alert('Erreur', t('signup_pick_image_error'));
    }
  };

  const handleSubmit = () => {
    onComplete({
      address: address || undefined,
      postalCode: postalCode || undefined,
      website: website || undefined,
      ice: ice || undefined,
      patente: patente || undefined,
      rc: rc || undefined,
      cnss: cnss || undefined,
      ifNum: ifNum || undefined,
      rib: rib || undefined,
      vat: vat || undefined,
      logo: logo ?? undefined,
      signature: signature ?? undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Progress */}
        <View style={styles.progressBlock}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressStep}>{'Étape 3 sur 3'}</Text>
            <Text style={styles.progressPercent}>100%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.headerBlock}>
          <Text style={styles.title}>{t('signup_step3_title')}</Text>
          <Text style={styles.subtitle}>
            {t('signup_step3_subtitle')}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <OptionalField label={t('signup_address_label')} value={address} onChangeText={setAddress} placeholder={t('signup_address_placeholder')} />
          <OptionalField label={t('signup_postal_code_label')} value={postalCode} onChangeText={setPostalCode} placeholder={t('signup_postal_code_placeholder')} keyboardType="number-pad" />
          <OptionalField label={t('signup_website_label')} value={website} onChangeText={setWebsite} placeholder={t('signup_website_placeholder')} keyboardType="url" autoCapitalize="none" />
          <OptionalField label={t('signup_ice_label')} value={ice} onChangeText={setIce} placeholder={t('signup_ice_placeholder')} />
          <OptionalField label={t('signup_patente_label')} value={patente} onChangeText={setPatente} placeholder={t('signup_patente_placeholder')} />
          <OptionalField label={t('signup_rc_label')} value={rc} onChangeText={setRc} placeholder={t('signup_rc_placeholder')} />
          <OptionalField label={t('signup_cnss_label')} value={cnss} onChangeText={setCnss} placeholder={t('signup_cnss_placeholder')} />
          <OptionalField label={t('signup_if_label')} value={ifNum} onChangeText={setIfNum} placeholder={t('signup_if_placeholder')} />
          <OptionalField label={t('signup_rib_label')} value={rib} onChangeText={setRib} placeholder={t('signup_rib_placeholder')} keyboardType="number-pad" />
          <OptionalField label={t('signup_vat_label')} value={vat} onChangeText={setVat} placeholder={t('signup_vat_placeholder')} />

          {/* Logo Upload */}
          <FileUploadField
            label={t('signup_logo_label')}
            file={logo}
            onPick={() => pickImage(setLogo)}
            onRemove={() => setLogo(null)}
            hint={t('signup_logo_hint')}
            pickLabel={t('signup_logo_pick_label')}
          />

          {/* Signature Upload */}
          <FileUploadField
            label={t('signup_signature_label')}
            file={signature}
            onPick={() => pickImage(setSignature)}
            onRemove={() => setSignature(null)}
            hint={t('signup_signature_hint')}
            pickLabel={t('signup_signature_pick_label')}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit} activeOpacity={0.85}>
          <Text style={styles.primaryBtnText}>{t('signup_finish_button')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={onSkip} activeOpacity={0.85}>
          <Text style={styles.outlineBtnText}>{t('signup_skip_button')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={onBack} activeOpacity={0.85}>
          <Text style={styles.ghostBtnText}>{t('signup_back_button')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

/* ── Reusable sub-components ── */

interface OptionalFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}

const OptionalField: React.FC<OptionalFieldProps> = ({
  label, value, onChangeText, placeholder, keyboardType = 'default', autoCapitalize = 'sentences',
}) => {
  const { t } = useTranslation();
  return (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>
      {label} <Text style={styles.optional}>{t('signup_optional')}</Text>
    </Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#AAAAAA"
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
  </View>
  );
};

interface FileUploadFieldProps {
  label: string;
  file: FileAsset | null;
  onPick: () => void;
  onRemove: () => void;
  hint: string;
  pickLabel: string;
}

const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label, file, onPick, onRemove, hint, pickLabel,
}) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>
      {label} <Text style={styles.optional}>(optionnel)</Text>
    </Text>
    <TouchableOpacity
      style={styles.uploadArea}
      onPress={file ? undefined : onPick}
      activeOpacity={file ? 1 : 0.7}
    >
      {file ? (
        <View style={styles.fileRow}>
          <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
            {file.name}
          </Text>
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <X size={16} color="#DC2626" />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Upload size={28} color="#777777" />
          <Text style={styles.uploadLabel}>{pickLabel}</Text>
          <Text style={styles.uploadHint}>{hint}</Text>
        </>
      )}
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  progressBlock: { marginBottom: 28 },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressStep: {
    fontSize: 12,
    fontWeight: '500',
    color: '#777777',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#1E5BAC',
    borderRadius: 4,
  },
  headerBlock: { marginBottom: 28 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
  },
  form: { gap: 16 },
  fieldBlock: {},
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111111',
    marginBottom: 8,
  },
  optional: {
    color: '#777777',
    fontWeight: '400',
  },
  input: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#111111',
  },
  uploadArea: {
    height: 112,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#E5E5E5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
    gap: 6,
    paddingHorizontal: 16,
  },
  uploadLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333333',
  },
  uploadHint: {
    fontSize: 11,
    color: '#777777',
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingHorizontal: 8,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: '#111111',
    fontWeight: '500',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 20,
    gap: 10,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    height: 48,
    backgroundColor: '#1E5BAC',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineBtn: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineBtnText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '600',
  },
  ghostBtn: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    color: '#777777',
    fontSize: 15,
    fontWeight: '500',
  },
});

export default SignupStep3;
