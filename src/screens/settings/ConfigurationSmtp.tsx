import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon, eyeIcon } from '../../assets/icons';

const ConfigurationSmtp: React.FC = ({ navigation }: any) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [username, setUsername] = useState('');
  const [security, setSecurity] = useState('');
  const [emailName, setEmailName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSave = () => {
    console.log('Form saved');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Configuration SMTP</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hôte and Port Row */}
        <View style={styles.rowContainer}>
          <View style={styles.halfSection}>
            <Text style={styles.label}>
              Hôte <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={host}
              onChangeText={setHost}
              placeholderTextColor="#999999"
            />
          </View>
          <View style={styles.halfSection}>
            <Text style={styles.label}>
              Port <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={port}
              onChangeText={setPort}
              placeholderTextColor="#999999"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Adresse e-mail d'envoi */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Adresse e-mail d'envoi <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.emailInput}>
            <Text style={styles.emailIcon}>@</Text>
            <TextInput
              style={styles.emailTextInput}
              value={senderEmail}
              onChangeText={setSenderEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Nom d'utilisateur */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nom d'utilisateur <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Sécurité Dropdown */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Sécurité <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={[styles.dropdownText, !security && styles.placeholderText]}>
              {security || 'Sélectionner la sécurité'}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Nom de l'e-mail d'envoi */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Nom de l'e-mail d'envoi <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={emailName}
            onChangeText={setEmailName}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Mot de passe */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Mot de passe <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.passwordInput}>
            <TextInput
              style={styles.passwordTextInput}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#999999"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {/* <Text style={styles.eyeIcon}>{showPassword ? '👁' : '🔒'}</Text> */}
              <Image source={eyeIcon} style={{ width: 24, height: 24 }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <View style={styles.fixedButtons}>
        <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fixedTestButton} onPress={handleSave}>
          <Text style={styles.testButtonText}>Tester</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  label: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#E74C3C',
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D0D0D0',
    borderRadius: 4,
    paddingVertical: 25,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: {
    fontSize: 18,
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 14,
    color: '#999999',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  rowContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  halfSection: {
    flex: 1,
  },
  emailInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  emailIcon: {
    fontSize: 20,
    color: '#999999',
    marginRight: 8,
  },
  emailTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  passwordInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  eyeIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  addressText: {
    flex: 1,
    fontSize: 16,
    color: '#4A90E2',
  },
  chevronIcon: {
    fontSize: 24,
    color: '#999999',
  },
  saveButton: {
    backgroundColor: '#0B5FA5',
    marginHorizontal: 20,
    marginVertical: 30,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  fixedButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  fixedSaveButton: {
    flex: 1,
    backgroundColor: '#0B5FA5',
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
  fixedTestButton: {
    flex: 1,
    backgroundColor: '#3cebba',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bottomSpacer: {
    height: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default ConfigurationSmtp;