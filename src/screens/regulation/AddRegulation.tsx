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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

const AddRegulation: React.FC = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { payment } = route.params || {};

  const [reference, setReference] = useState(payment?.number || 'PAY-202601-0001');
  const [client, setClient] = useState('a barb');
  const [operationDate, setOperationDate] = useState(new Date(2026, 0, 2));
  const [valueDate, setValueDate] = useState(new Date(2026, 0, 2));
  const [showOperationDatePicker, setShowOperationDatePicker] = useState(false);
  const [showValueDatePicker, setShowValueDatePicker] = useState(false);
  const [tempOperationDate, setTempOperationDate] = useState(new Date(2026, 0, 2));
  const [tempValueDate, setTempValueDate] = useState(new Date(2026, 0, 2));
  const [account, setAccount] = useState('Compte courant');
  const [paymentMode, setPaymentMode] = useState('Carte bancaire');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [showClientModal, setShowClientModal] = useState(false);

  const clientData = [
    { label: 'a barb', value: 'a barb' },
    { label: 'Client 2', value: 'Client 2' },
    { label: 'Client 3', value: 'Client 3' },
  ];

  const accountData = [
    { label: 'Compte courant', value: 'Compte courant' },
    { label: 'Caisse', value: 'Caisse' },
    { label: 'Banque', value: 'Banque' },
  ];

  const paymentModeData = [
    { label: 'Chèque', value: 'Chèque' },
    { label: 'Espèces', value: 'Espèces' },
    { label: 'Carte bancaire', value: 'Carte bancaire' },
    { label: 'Virement bancaire', value: 'Virement bancaire' },
  ];

  const invoices = [
    {
      id: '1',
      number: 'FA-202601-0001',
      date: '02/01/2026',
      totalAmount: '24,00 MAD',
      paidAmount: '24,00 MAD',
      remainingAmount: '0,00 MAD',
    },
  ];

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = () => {
    console.log('Save payment');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter règlement</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Client <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={clientData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={client}
            onChange={item => setClient(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
        </View>

        {/* Date Pickers - Two Columns */}
        <View style={styles.datePickerSection}>
          <View style={styles.dateLabelsRow}>
            <View style={styles.dateColumn}>
              <Text style={styles.label}>
                Date d'opération <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <View style={styles.dateColumn}>
              <Text style={styles.label}>Date de valeur</Text>
            </View>
          </View>
          <View style={styles.dateInputsRow}>
            <TouchableOpacity
              style={styles.inputWithDatepicker}
              onPress={() => {
                setTempOperationDate(operationDate);
                setShowOperationDatePicker(true);
              }}
            >
              <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
              <Text style={styles.dateText}>{formatDate(operationDate)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.inputWithDatepicker}
              onPress={() => {
                setTempValueDate(valueDate);
                setShowValueDatePicker(true);
              }}
            >
              <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
              <Text style={styles.dateText}>{formatDate(valueDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Compte à créditer */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Compte à créditer <Text style={styles.required}>*</Text>
          </Text>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.dropdownText}
            selectedTextStyle={styles.dropdownText}
            data={accountData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            value={account}
            onChange={item => setAccount(item.value)}
            renderRightIcon={() => (
              <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
            )}
          />
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

        {/* Factures soldées */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Factures soldées</Text>
          {invoices.map((invoice) => (
            <View key={invoice.id} style={styles.invoiceCard}>
              <View style={styles.invoiceHeader}>
                <Text style={styles.invoiceNumber}>{invoice.number}</Text>
                <Text style={styles.invoiceDate}>{invoice.date}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Montant TTC</Text>
                <Text style={styles.invoiceAmount}>{invoice.totalAmount}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Réglé par ce paiement</Text>
                <Text style={styles.invoiceAmount}>{invoice.paidAmount}</Text>
              </View>
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceLabel}>Reste à payer</Text>
                <Text style={styles.invoiceAmount}>{invoice.remainingAmount}</Text>
              </View>
            </View>
          ))}
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
  datePickerSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  dateLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateInputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  inputWithDatepicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 2,
    paddingHorizontal: 12,
    paddingVertical: 12,
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
  sectionTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 12,
  },
  invoiceCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#666666',
  },
  invoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  invoiceLabel: {
    fontSize: 14,
    color: '#666666',
  },
  invoiceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0B5FA5',
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

export default AddRegulation;
