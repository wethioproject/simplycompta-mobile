import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { downArrowIcon, fileIcon } from '../../assets/icons';
import { Dropdown } from 'react-native-element-dropdown';

const EditExpense: React.FC = ({ navigation, route }: any) => {
  const { expense } = route.params || {};

  const [reference, setReference] = useState(expense?.number || 'DEP-202601-0001');
  const [category, setCategory] = useState('Téléphone & Internet');
  const [operationDate, setOperationDate] = useState(new Date(2026, 0, 2));
  const [valueDate, setValueDate] = useState(new Date(2026, 0, 2));
  const [showOperationDatePicker, setShowOperationDatePicker] = useState(false);
  const [showValueDatePicker, setShowValueDatePicker] = useState(false);
  const [tempOperationDate, setTempOperationDate] = useState(new Date(2026, 0, 2));
  const [tempValueDate, setTempValueDate] = useState(new Date(2026, 0, 2));
  const [paymentMode, setPaymentMode] = useState('Chèque');
  const [paymentReference, setPaymentReference] = useState('h45');
  const [amount, setAmount] = useState('500');
  const [isPaid, setIsPaid] = useState(true);
  const [isTaxDeductible, setIsTaxDeductible] = useState(true);
  const [taxRate, setTaxRate] = useState('20%');
  const [notes, setNotes] = useState('');

  const categoryData = [
    { label: 'Téléphone & Internet', value: 'Téléphone & Internet' },
    { label: 'Fournitures de bureau', value: 'Fournitures de bureau' },
    { label: 'Loyer', value: 'Loyer' },
    { label: 'Transport', value: 'Transport' },
  ];

  const paymentModeData = [
    { label: 'Chèque', value: 'Chèque' },
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Carte bancaire', value: 'Carte bancaire' },
    { label: 'Virement bancaire', value: 'Virement bancaire' },
  ];

  const taxRateData = [
    { label: '20%', value: '20%' },
    { label: '10%', value: '10%' },
    { label: '5.5%', value: '5.5%' },
    { label: '0%', value: '0%' },
  ];

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = () => {
    console.log('Save expense');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Modifier dépense</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Référence */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Référence <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.hashIcon}>#</Text>
            <TextInput
              style={styles.textInputWithIcon}
              value={reference}
              onChangeText={setReference}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Catégorie */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Catégorie <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={categoryData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={category}
            onChange={item => setCategory(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
        </View>

        {/* Date d'opération */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date d'opération <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => {
              setTempOperationDate(operationDate);
              setShowOperationDatePicker(true);
            }}
          >
            <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
            <Text style={styles.dateText}>{formatDate(operationDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Date de valeur */}
        <View style={styles.section}>
          <Text style={styles.label}>Date de valeur</Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => {
              setTempValueDate(valueDate);
              setShowValueDatePicker(true);
            }}
          >
            <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
            <Text style={styles.dateText}>{formatDate(valueDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Mode de paiement */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Mode de paiement <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={paymentModeData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={paymentMode}
            onChange={item => setPaymentMode(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
        </View>

        {/* Référence du paiement */}
        <View style={styles.section}>
          <Text style={styles.label}>Référence du paiement</Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.hashIcon}>#</Text>
            <TextInput
              style={styles.textInputWithIcon}
              value={paymentReference}
              onChangeText={setPaymentReference}
              placeholderTextColor="#999999"
            />
          </View>
        </View>

        {/* Montant */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Montant <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Dépense réglé */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>Dépense réglé</Text>
          <Switch
            value={isPaid}
            onValueChange={setIsPaid}
            trackColor={{ false: '#E5E5E5', true: '#0B5FA5' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* TVA déductible */}
        <View style={styles.toggleSection}>
          <Text style={styles.toggleLabel}>TVA déductible</Text>
          <Switch
            value={isTaxDeductible}
            onValueChange={setIsTaxDeductible}
            trackColor={{ false: '#E5E5E5', true: '#0B5FA5' }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Taux de TVA */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Taux de TVA <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={taxRateData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={taxRate}
            onChange={item => setTaxRate(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={styles.textArea}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999999"
          />
        </View>

        {/* Les reçus */}
        <View style={styles.section}>
          <Text style={styles.label}>Les reçus</Text>
          <TouchableOpacity style={styles.uploadBox}>
            <Image source={fileIcon} style={styles.uploadIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {Platform.OS === 'ios' ? (
        <>
          {/* Operation Date Picker Modal - iOS */}
          <Modal
            visible={showOperationDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowOperationDatePicker(false)}>
                    <Text style={styles.modalCancelButton}>Annuler</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Date d'opération</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setOperationDate(tempOperationDate);
                      setShowOperationDatePicker(false);
                    }}
                  >
                    <Text style={styles.modalConfirmButton}>OK</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempOperationDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempOperationDate(selectedDate);
                    }
                  }}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>

          {/* Value Date Picker Modal - iOS */}
          <Modal
            visible={showValueDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowValueDatePicker(false)}>
                    <Text style={styles.modalCancelButton}>Annuler</Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>Date de valeur</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setValueDate(tempValueDate);
                      setShowValueDatePicker(false);
                    }}
                  >
                    <Text style={styles.modalConfirmButton}>OK</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempValueDate}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setTempValueDate(selectedDate);
                    }
                  }}
                  style={styles.datePicker}
                />
              </View>
            </View>
          </Modal>
        </>
      ) : (
        <>
          {/* Android Date Pickers */}
          {showOperationDatePicker && (
            <DateTimePicker
              value={operationDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowOperationDatePicker(false);
                if (selectedDate) {
                  setOperationDate(selectedDate);
                }
              }}
            />
          )}

          {showValueDatePicker && (
            <DateTimePicker
              value={valueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowValueDatePicker(false);
                if (selectedDate) {
                  setValueDate(selectedDate);
                }
              }}
            />
          )}
        </>
      )}
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
    fontWeight: '400',
  },
  required: {
    color: '#E74C3C',
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
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  hashIcon: {
    fontSize: 18,
    color: '#999999',
    marginRight: 8,
  },
  calendarIcon: {
    width: 20,
    height: 20,
    tintColor: '#999999',
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    padding: 0,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333333',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
  },
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '400',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    minHeight: 100,
  },
  uploadBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingVertical: 20, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 48,
    height: 48,
    tintColor: '#CCCCCC',
  },
  bottomSpacer: {
    height: 100,
  },
  fixedButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButton: {
    backgroundColor: '#0B5FA5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#999999',
    width: 70,
  },
  modalConfirmButton: {
    fontSize: 16,
    color: '#0B5FA5',
    fontWeight: '600',
    width: 70,
    textAlign: 'right',
  },
  datePicker: {
    alignSelf: 'center',
    width: '100%',
  },
});

export default EditExpense;
