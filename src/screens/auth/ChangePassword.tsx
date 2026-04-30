import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { eyeIcon } from '../../assets/icons';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const ChangePassword: React.FC = ({ navigation }: any) => {
  const { resetPassword } = useAuth();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = async () => {
    if (newPassword !== confirmPassword) {
      console.log('Passwords do not match');
        Toast.show({
        type: 'error',
        text1: t('change_password_mismatch_title'),
        text2: t('change_password_mismatch_message'),
        position: 'top'
      });
      return;
    }

    const result = await resetPassword(currentPassword, newPassword, confirmPassword);
    if (result.success) {
      console.log('Password changed successfully');
        Toast.show({
        type: 'success',
        text1: t('change_password_success_title'),
        text2: t('change_password_success_message'),
        position: 'top'
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      console.log('Error changing password:', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('change_password_title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Current Password */}
        <View style={styles.section}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('change_password_current_placeholder')}
              placeholderTextColor="#B0B0B0"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry={!showCurrentPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              <Image source={eyeIcon} style={styles.eyeIconImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* New Password */}
        <View style={styles.section}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('change_password_new_placeholder')}
              placeholderTextColor="#B0B0B0"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showNewPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowNewPassword(!showNewPassword)}
            >
              <Image source={eyeIcon} style={styles.eyeIconImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.section}>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder={t('change_password_confirm_placeholder')}
              placeholderTextColor="#B0B0B0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Image source={eyeIcon} style={styles.eyeIconImage} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>{t('change_password_save')}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  passwordContainer: {

  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  eyeIconImage: {
    height: 20,
    width: 20,
  },
  bottomSpacer: {
    height: 20,
  },
  fixedSaveButton: {
    backgroundColor: '#0B5FA5',
    marginHorizontal: 16,
    marginVertical: 40,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ChangePassword;
