import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  Switch,
} from 'react-native';
import { downArrowIcon } from '../../assets/icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const EditBankAccount: React.FC = ({ navigation, route }: any) => {
  const account = route?.params?.account;

  const [isPrincipal, setIsPrincipal] = useState(true);
  const [designation, setDesignation] = useState('Compte courant');
  const [bankName, setBankName] = useState('');
  const [type, setType] = useState('Compte bancaire courant');
  const [currency, setCurrency] = useState('Dirham marocain');
  const [address, setAddress] = useState('');
  const [rib, setRib] = useState('');
  const [swift, setSwift] = useState('');
  const [iban, setIban] = useState('');

  const handleSave = () => {
    console.log('Bank account saved');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modiier compte bancaire</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compte Principal Toggle */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>Compte principal</Text>
          <Switch
            value={isPrincipal}
            onValueChange={setIsPrincipal}
            trackColor={{ false: '#E5E5E5', true: '#0B5FA5' }}
            thumbColor={isPrincipal ? '#FFFFFF' : '#F0F0F0'}
          />
        </View>

        {/* Désignation */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Désignation <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={designation}
            onChangeText={setDesignation}
            placeholder="Compte courant"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Nom de banque */}
        <View style={styles.section}>
          <Text style={styles.label}>Nom de banque</Text>
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="BMCE Bank"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Type <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{type}</Text>
            <Image
              source={downArrowIcon}
              style={styles.dropdownIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Devise */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Devise <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{currency}</Text>
            <Image
              source={downArrowIcon}
              style={styles.dropdownIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Adresse */}
        <View style={styles.section}>
          <Text style={styles.label}>Adresse</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholderTextColor="#999999"
            multiline
            numberOfLines={3}
          />
        </View>

        {/* R.I.B */}
        <View style={styles.section}>
          <Text style={styles.label}>R.I.B</Text>
          <TextInput
            style={styles.input}
            value={rib}
            onChangeText={setRib}
            placeholderTextColor="#999999"
          />
        </View>

        {/* SWIFT */}
        <View style={styles.section}>
          <Text style={styles.label}>SWIFT</Text>
          <TextInput
            style={styles.input}
            value={swift}
            onChangeText={setSwift}
            placeholderTextColor="#999999"
          />
        </View>

        {/* IBAN */}
        <View style={styles.section}>
          <Text style={styles.label}>IBAN</Text>
          <TextInput
            style={styles.input}
            value={iban}
            onChangeText={setIban}
            placeholderTextColor="#999999"
          />
        </View>

        {/* Extra spacing for button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Save Button */}
        <TouchableOpacity
          style={styles.fixedSaveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Enregistrer</Text>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
  headerPlaceholder: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  toggleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    // color: '#0B5FA5',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
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
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  bottomSpacer: {
    height: 20,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#0B5FA5',
    marginVertical: 40,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    shadowColor: '#0B5FA5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
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
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditBankAccount;
