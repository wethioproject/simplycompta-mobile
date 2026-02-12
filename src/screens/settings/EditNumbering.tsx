import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon } from '../../assets/icons';

const EditNumbering: React.FC = ({ navigation }: any) => {
  const [prefix, setPrefix] = useState('');
  const [dateFormat, setDateFormat] = useState('none');
  const [counterValue, setCounterValue] = useState('');
  const [counterLength, setCounterLength] = useState('');
  const [separator, setSeparator] = useState('minus');
  const [separatorPosition, setSeparatorPosition] = useState('middle');
  const [format, setFormat] = useState('');

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
        <Text style={styles.headerTitle}>Modifier numérotation</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Préfix */}
        <View style={styles.section}>
          <Text style={styles.label}>Préfix</Text>
          <TextInput
            style={styles.input}
            value={prefix}
            onChangeText={setPrefix}
            placeholder="Ex: FAC"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Format de la date */}
        <View style={styles.section}>
          <Text style={styles.label}>Format de la date</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{dateFormat}</Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Valeur du compteur */}
        <View style={styles.section}>
          <Text style={styles.label}>Valeur du compteur</Text>
          <TextInput
            style={styles.input}
            value={counterValue}
            onChangeText={setCounterValue}
            placeholder="0"
            placeholderTextColor="#999999"
            keyboardType="numeric"
          />
        </View>

        {/* Longueur du compteur */}
        <View style={styles.section}>
          <Text style={styles.label}>Longueur du compteur</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={[styles.dropdownText, !counterLength && styles.placeholderText]}>
              {counterLength || '4'}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Séparateur */}
        <View style={styles.section}>
          <Text style={styles.label}>Séparateur</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={[styles.dropdownText, !separator && styles.placeholderText]}>
              {separator || '-'}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Emplacement Séparateur */}
        <View style={styles.section}>
          <Text style={styles.label}>Emplacement Séparateur</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={styles.dropdownText}>{separatorPosition}</Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Format */}
        <View style={styles.section}>
          <Text style={styles.label}>Format</Text>
          <TouchableOpacity style={styles.dropdown}>
            <Text style={[styles.dropdownText, !format && styles.placeholderText]}>
              {format || 'Aperçu: FAC-2024-0001'}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>


        {/* Extra spacing for fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <TouchableOpacity style={styles.fixedSaveButton} onPress={handleSave}>
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
  bottomSpacer: {
    height: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditNumbering;