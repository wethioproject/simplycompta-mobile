import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
// import DocumentPicker from '@react-native-documents/picker';
import * as DocumentPicker from '@react-native-documents/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { fileIcon, downArrowIcon } from '../../assets/icons';
import { useTransaction } from '../../hooks/useTransaction';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Account, Category } from '../../services/transactionService';


const TRANSACTION_TYPES = [
  { label: 'Dépense', value: 'expense' },
  { label: 'Revenu', value: 'income' },
];

const AddTransaction: React.FC = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { getResources, createTransaction } = useTransaction();
  const customer = useSelector((state: RootState) => state.user.customer);

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [paymentReceipt, setPaymentReceipt] = useState<any>(null);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const result = await getResources();
      if (result.success) {
        setAccounts(result.accounts);
        setCategories(result.categories);
        
        // Set default selections if available
        if (result.accounts.length > 0) {
          setAccountId(result.accounts[0].id.toString());
        }
        if (result.categories.length > 0) {
          setCategoryId(result.categories[0].id.toString());
        }
      } else {
        Alert.alert('Erreur', result.error || 'Échec du chargement des ressources');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les ressources');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateForAPI = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSelectedTypeName = (): string => {
    const selected = TRANSACTION_TYPES.find(t => t.value === type);
    return selected ? selected.label : '';
  };

  const getSelectedAccountName = (): string => {
    const account = accounts.find(a => a.id.toString() === accountId);
    return account ? account.name : 'Sélectionner un compte';
  };

  const getSelectedCategoryName = (): string => {
    const category = categories.find(c => c.id.toString() === categoryId);
    return category ? category.name : 'Sélectionner une catégorie';
  };

  const handleTypeSelect = (value: 'expense' | 'income') => {
    setType(value);
    setShowTypeModal(false);
  };

  const handleAccountSelect = (account: Account) => {
    setAccountId(account.id.toString());
    setShowAccountModal(false);
  };

  const handleCategorySelect = (category: Category) => {
    setCategoryId(category.id.toString());
    setShowCategoryModal(false);
  };

  const handleDateConfirm = () => {
    setTransactionDate(tempDate);
    setShowDatePicker(false);
  };

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
        copyTo: 'cachesDirectory',
      });
      
      if (result && result.length > 0) {
        const file = result[0];
        setPaymentReceipt({
          uri: file.uri,
          type: file.type || 'image/jpeg',
          name: file.name || 'receipt.jpg',
          size: file.size,
          // fileCopyUri: file.fileCopyUri,
        });
      }
    } catch (error: any) {
  if (error?.code === 'DOCUMENT_PICKER_CANCELED') {
    console.log('User cancelled file picker');
  } else {
        console.error('File picker error:', error);
        Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
      }
    }
  };

  const validateForm = (): boolean => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez saisir un montant valide');
      return false;
    }
    if (!accountId) {
      Alert.alert('Erreur', 'Veuillez sélectionner un compte');
      return false;
    }
    if (!categoryId) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir une description');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    console.log('handlesave101')
    if (!validateForm()) return;
    if (!customer?.id) {
      Alert.alert('Erreur', 'Utilisateur non authentifié');
      return;
    }
    setSubmitting(true);

    const payload = {
      type,
      transaction_date: formatDateForAPI(transactionDate),
      amount,
      customer_id: customer.id.toString(),
      account_id: accountId,
      category_id: categoryId,
      description,
      reference,
      ...(paymentReceipt && { payment_receipt: paymentReceipt }),
    };

    try {
      const result = await createTransaction(payload);
      
      if (result.success) {
        Alert.alert(
          'Succès',
          result.message || 'Transaction créée avec succès',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Erreur', result.error || 'Échec de la création de la transaction');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création');
    } finally {
      setSubmitting(false);
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ajouter transaction</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0B5FA5" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </View>
    );
  }


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ajouter transaction</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Type <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={styles.dateText}>{getSelectedTypeName()}</Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Transaction Date */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Date de transaction <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => {
              setTempDate(transactionDate);
              setShowDatePicker(true);
            }}
          >
            <Image source={fileIcon} style={styles.calendarIcon} resizeMode="contain" />
            <Text style={styles.dateText}>{formatDate(transactionDate)}</Text>
          </TouchableOpacity>
        </View>

        {/* Amount */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Montant <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#AAAAAA"
            keyboardType="decimal-pad"
          />
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Compte <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => setShowAccountModal(true)}
          >
            <Text style={[styles.dateText, !accountId && styles.placeholderText]}>
              {getSelectedAccountName()}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Catégorie <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.inputWithIcon}
            onPress={() => setShowCategoryModal(true)}
          >
            <Text style={[styles.dateText, !categoryId && styles.placeholderText]}>
              {getSelectedCategoryName()}
            </Text>
            <Image source={downArrowIcon} style={styles.dropdownIcon} resizeMode="contain" />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Entrez la description"
            placeholderTextColor="#AAAAAA"
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Reference */}
        <View style={styles.section}>
          <Text style={styles.label}>Référence <Text style={styles.required}>*</Text></Text>
          <TextInput
            style={styles.input}
            value={reference}
            onChangeText={setReference}
            placeholder="Numéro de référence"
            placeholderTextColor="#AAAAAA"
          />
        </View>

        {/* Payment Receipt */}
        <View style={styles.section}>
          <Text style={styles.label}>Reçu de paiement <Text style={styles.required}>*</Text></Text>
          
          {paymentReceipt ? (
            <View style={styles.fileContainer}>
              <View style={styles.fileInfo}>
                <Image source={fileIcon} style={styles.fileIconSmall} resizeMode="contain" />
                <Text style={styles.fileName} numberOfLines={1}>{paymentReceipt.name || 'Fichier sélectionné'}</Text>
              </View>
              <TouchableOpacity onPress={() => setPaymentReceipt(null)} style={styles.removeButton}>
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleFilePick}
            >
              <Image source={fileIcon} style={styles.uploadIcon} resizeMode="contain" />
              <Text style={styles.uploadText}>Joindre un reçu</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Save Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, submitting && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Type Selection Modal */}
      <Modal
        visible={showTypeModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => setShowTypeModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Sélectionner le type</Text>
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {TRANSACTION_TYPES.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.optionItem}
                  onPress={() => handleTypeSelect(item.value as 'expense' | 'income')}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Account Selection Modal */}
      <Modal
        visible={showAccountModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowAccountModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => setShowAccountModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Sélectionner un compte</Text>
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {accounts.map((account) => (
                <TouchableOpacity
                  key={account.id}
                  style={styles.optionItem}
                  onPress={() => handleAccountSelect(account)}
                >
                  <Text style={styles.optionText}>{account.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryModal}
        transparent={false}
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={[styles.modalOverlayFullscreen, { paddingTop: insets.top }]}>
          <View style={styles.modalContentFullscreen}>
            <View style={styles.modalHeaderFullscreen}>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(false)}
                style={styles.modalBackButton}
              >
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitleFullscreen}>Sélectionner une catégorie</Text>
            </View>

            <ScrollView style={styles.optionsList} showsVerticalScrollIndicator={false}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.optionItem}
                  onPress={() => handleCategorySelect(category)}
                >
                  <Text style={styles.optionText}>{category.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date Picker */}
      {Platform.OS === 'ios' ? (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Date de transaction</Text>
                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={styles.modalConfirmText}>OK</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setTempDate(selectedDate);
                  }
                }}
                style={styles.datePicker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showDatePicker && (
          <DateTimePicker
            value={transactionDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setTransactionDate(selectedDate);
              }
            }}
          />
        )
      )}
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#0B5FA5',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  placeholderText: {
    color: '#AAAAAA',
  },
  dropdownIcon: {
    width: 16,
    height: 16,
    tintColor: '#666666',
  },
  bottomSpacer: {
    height: 100,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  uploadIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
    tintColor: '#0B5FA5',
  },
  uploadText: {
    fontSize: 16,
    color: '#0B5FA5',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F2FF',
    borderRadius: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#0B5FA5',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileIconSmall: {
    width: 18,
    height: 18,
    marginRight: 10,
    tintColor: '#0B5FA5',
  },
  fileName: {
    fontSize: 15,
    color: '#333333',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E74C3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fixedButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  saveButton: {
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
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlayFullscreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalContentFullscreen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  modalHeaderFullscreen: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalBackButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  modalBackArrow: {
    fontSize: 28,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  modalTitleFullscreen: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
  optionsList: {
    flex: 1,
  },
  optionItem: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
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
  modalCancelText: {
    fontSize: 16,
    color: '#E74C3C',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  modalConfirmText: {
    fontSize: 16,
    color: '#0B5FA5',
    fontWeight: '600',
  },
  datePicker: {
    height: 200,
  },
});

export default AddTransaction;