import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Linking,
} from 'react-native';
import { useExpense } from '../../hooks/useExpense';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Plus,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  X,
  CloudUpload,
  Calendar,
  Upload,
  Camera,
} from 'lucide-react-native';
import { appLogoIcon } from '../../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

type StackNavigation = StackNavigationProp<any>;

interface Account { id: number; name: string; }
interface Category { id: number; name: string; }

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExpenseItem {
  id: number;
  customer_id: number;
  category_id: number;
  date: string;
  payment_method: string;
  file: string | null;
  file_url: string | null;
  ttc: string;
  tva: string;
  total_ttc: string;
  total_tva: string;
  category: { id: number; name: string };
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
// const DetailModal: React.FC<{ item: ExpenseItem; onClose: () => void }> = ({ item, onClose }) => (
const DetailModal: React.FC<{ item: any; onClose: () => void, onDelete: (id: number) => Promise<void>, onEdit: () => void }> = ({ item, onClose, onEdit, onDelete }) =>
  
{
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    const [deleting, setDeleting] = useState(false);
  
    const handleDelete = () => {
      Alert.alert(
        'Supprimer la facture',
        `Voulez-vous vraiment supprimer la facture ${item.invoice_number} ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                await onDelete(item.id);
              } finally {
                setDeleting(false);
              }
            },
          },
        ],
        { cancelable: true }
      );
    };
  return (
  <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
    <SafeAreaView style={styles.modalContainer} edges={['top']}>
      <View style={styles.detailModalHeader}>
        <Text style={styles.detailModalTitle}>Détails de la transaction</Text>
        <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View style={styles.detailHero}>
          <View style={styles.badgeRedLg}>
            <Text style={styles.badgeRedLgText}>Dépense</Text>
          </View>
          <Text style={styles.detailAmount}>{parseFloat(item?.total_ttc || '0').toLocaleString('fr-FR')} MAD</Text>
          <Text style={styles.detailDate}>{formattedDate}</Text>
        </View>

        <View style={styles.detailCard}>
          {[
            // { label: 'Description', value: item.description },
            { label: 'Catégorie', value: item.category.name },
            { label: 'Mode de paiement', value: item.payment_method },
            // { label: 'Statut', value: item.status === 'completed' ? 'Payé' : 'En attente', isStatus: true, completed: item.status === 'completed' },
          ].map(row => (
            <View key={row.label} style={styles.detailRow}>
              <Text style={styles.detailRowLabel}>{row.label}</Text>
              <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
            </View>
          ))}
        </View>

        {item.file ? (
          <TouchableOpacity
            style={styles.attachmentCard}
            onPress={() => {
              if (!item.file_url) return;
              Linking.openURL(item.file_url).catch(() => Alert.alert('Erreur', "Impossible d'ouvrir le document."));
            }}
            activeOpacity={0.8}
          >
            <View style={styles.attachmentLeft}>
              <View style={styles.attachmentIconBox}>
                <FileText size={20} color="#1E5BAC" />
              </View>
              <View>
                {(() => {
                  const rawName = item.file.split('/').pop() || 'Document';
                  const displayName = rawName.length > 24 ? `${rawName.slice(0, 24)}...` : rawName;
                  return (
                    <>
                      <Text style={styles.attachmentName}>{displayName}</Text>
                      <Text style={styles.attachmentSub}>Appuyer pour télécharger</Text>
                    </>
                  );
                })()}
              </View>
            </View>
            <View style={styles.attachmentDownload}>
              <Download size={18} color="#1E5BAC" />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.noAttachment}>
            <CloudUpload size={28} color="#D1D5DB" />
            <Text style={styles.noAttachmentText}>Aucun document joint</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.noAttachmentLink}>Ajouter un document</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <View style={styles.detailFooter}>
        {/* <TouchableOpacity style={styles.detailDeleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.detailDeleteText}>Supprimer</Text>
        </TouchableOpacity> */}
                  <TouchableOpacity style={styles.detailDeleteBtn} onPress={handleDelete} disabled={deleting} activeOpacity={0.8}>
                    {deleting
                      ? <ActivityIndicator size="small" color="#DC2626" />
                      : <>
                          <Trash2 size={16} color="#DC2626" />
                          <Text style={styles.detailDeleteText}>Supprimer</Text>
                        </>
                    }
                  </TouchableOpacity>
        <TouchableOpacity style={styles.detailEditBtn} onPress={onEdit} activeOpacity={0.8}>
          <Upload size={16} color="#FFFFFF" />
          <Text style={styles.detailEditText}>Modifier</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  </Modal>
  )
}


// ─── Create Expense Modal ─────────────────────────────────────────────────────
const CreateExpenseModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  categories: Category[];
  customerId: number;
  onCreated: () => void;
  onSave: (payload: any) => Promise<{ success: boolean; error?: string }>;
  editItem?: ExpenseItem;
  onUpdate?: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
}> = ({ visible, onClose, accounts, categories, customerId, onCreated, onSave, editItem, onUpdate }) => {
  const insets = useSafeAreaInsets();
  const [date, setDate] = useState('2026-04-24');
  const [amountTTC, setAmountTTC] = useState('');
  const [amountTVA, setAmountTVA] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const ttc = parseFloat(amountTTC) || 0;
  const tva = parseFloat(amountTVA) || 0;

  useEffect(() => {
    if (!visible) return;
    setShowDatePicker(false);
    setSaving(false);
    if (editItem) {
      const datePart = editItem.date.split('T')[0];
      setDate(datePart);
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      setAmountTTC(editItem.ttc);
      setAmountTVA(editItem.tva);
      const account = accounts.find(a => a.name === editItem.payment_method) ?? null;
      setSelectedAccount(account);
      const cat = categories.find(c => c.id === editItem.category_id) ?? null;
      setSelectedCategory(cat);
      if (editItem.file) {
        const fileName = editItem.file.split('/').pop() ?? 'document';
        setDocument({ name: fileName, isExisting: true });
      } else {
        setDocument(null);
      }
    } else {
      const today = new Date();
      const y = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setDate(`${y}-${mo}-${d}`);
      setAmountTTC('');
      setAmountTVA('');
      setSelectedAccount(null);
      setSelectedCategory(null);
      setDocument(null);
      setTempDate(today);
    }
  }, [visible]);


      const handlePickDocument = async () => {
        try {
          const [file] = await pick({ type: [types.pdf, types.docx, types.doc, types.images] });
          setDocument(file);
        } catch (e: any) {
          if (isErrorWithCode(e) && e.code === errorCodes.OPERATION_CANCELED) return;
          Alert.alert('Erreur', 'Impossible de sélectionner le fichier.');
        }
      };
    
      const handleDateChange = (_: DateTimePickerEvent, selected?: Date) => {
        if (selected) setTempDate(selected);
      };
    
      const confirmDate = () => {
        const y = tempDate.getFullYear();
        const m = String(tempDate.getMonth() + 1).padStart(2, '0');
        const d = String(tempDate.getDate()).padStart(2, '0');
        setDate(`${y}-${m}-${d}`);
        setShowDatePicker(false);
      };

        const handleSave = async () => {
              if (!amountTTC) { Alert.alert('Requis', 'Veuillez saisir le montant TTC.'); return; }
    // if (!paymentMethod) { Alert.alert('Requis', 'Veuillez choisir un mode de paiement.'); return; }
    // if (!category) { Alert.alert('Requis', 'Veuillez choisir une catégorie.'); return; }
          if (!selectedCategory) { Alert.alert('Requis', 'Veuillez sélectionner une catégorie.'); return; }
          if (!selectedAccount) { Alert.alert('Requis', 'Veuillez choisir un mode de paiement.'); return; }
      
          setSaving(true);
          try {
            const payload = {
              customer_id: customerId,
              date,
              ttc,
              tva,
              payment_method: selectedAccount!.name,
              category_id: selectedCategory!.id,
              total_ttc: ttc,
              total_tva: tva,
              document: document?.isExisting ? null : document,
            };
            if (editItem && onUpdate) {
              const result = await onUpdate(editItem.id, payload);
              if (result.success) {
                Alert.alert('Succès', 'Dépense modifiée avec succès.');
                onCreated();
                onClose();
              } else {
                Alert.alert('Erreur', result.error ?? 'Une erreur est survenue.');
              }
            } else {
              const result = await onSave(payload);
              if (result.success) {
                Alert.alert('Succès', 'Dépense créée avec succès.');
                onCreated();
                onClose();
              } else {
                Alert.alert('Erreur', result.error ?? 'Une erreur est survenue.');
              }
            }
          } finally {
            setSaving(false);
          }
        };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editItem ? 'Modifier la dépense' : 'Enregistrer une dépense'}</Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.modalConfirmText}>Confirmer</Text>}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {/* Upload area */}
              <View style={styles.uploadArea}>
                <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
                  <Camera size={20} color="#1E5BAC" />
                  <Text style={styles.uploadBtnText}>Prendre une photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8} onPress={handlePickDocument}>
                  <FileText size={20} color="#16A34A" />
                  <Text style={styles.uploadBtnText}>
                    {document ? document.name : 'Sélectionner un fichier'}</Text>
                                                  {document && (
                                  <TouchableOpacity onPress={() => setDocument(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                    <X size={16} color="#6B7280" />
                                  </TouchableOpacity>
                                )}
                </TouchableOpacity>
              </View>

              {/* Date */}
              {/* <View style={styles.fieldBlock}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Date <Text style={styles.required}>*</Text></Text>
                  <Calendar size={16} color="#1E5BAC" />
                </View>
                <TextInput
                  style={styles.fieldInput}
                  value={date}
                  onChangeText={setDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numbers-and-punctuation"
                />
              </View> */}

                            <View style={styles.fieldBlock}>
                              <Text style={styles.fieldLabel}>Date <Text style={styles.required}>*</Text></Text>
                              <TouchableOpacity
                                style={[styles.fieldInput, styles.fieldInputRow, { paddingVertical: 13 }]}
                                onPress={() => { setTempDate(date ? new Date(date) : new Date()); setShowDatePicker(true); }}
                                activeOpacity={0.7}
                              >
                                <Text style={[{ flex: 1, fontSize: 14 }, date ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                                  {date || 'YYYY-MM-DD'}
                                </Text>
                                <Calendar size={18} color="#1E5BAC" />
                              </TouchableOpacity>
              
                            </View>

              {/* Montant TTC */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Montant TTC <Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={amountTTC}
                    onChangeText={setAmountTTC}
                    placeholder="1000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
              </View>

              {/* Montant TVA */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Montant TVA<Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    value={amountTVA}
                    onChangeText={setAmountTVA}
                    placeholder="1000"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
              </View>

              {/* Mode de paiement */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Mode de paiement <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.pickerRow} onPress={() => setShowAccountPicker(true)} activeOpacity={0.7}>
                  <Text style={selectedAccount ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedAccount ? selectedAccount.name : 'Sélectionner le mode de paiement'}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Catégorie */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Catégorie <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.pickerRow} onPress={() => setShowCategoryPicker(true)} activeOpacity={0.7}>
                  <Text style={selectedCategory ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedCategory?.name || 'Choisir ou créer une catégorie'}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Totals */}
              <View style={styles.totalsBlock}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total TVA</Text>
                  <Text style={styles.totalValue}>{tva.toLocaleString('fr-FR')} MAD</Text>
                </View>
                <View style={[styles.totalRow, styles.totalRowLast]}>
                  <Text style={styles.totalLabelBold}>Total TTC</Text>
                  <Text style={styles.totalValueBold}>{ttc.toLocaleString('fr-FR')} MAD</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.confirmBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Text style={styles.confirmBtnText}>Confirmer</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal visible={showCategoryPicker} transparent animationType="fade" onRequestClose={() => setShowCategoryPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowCategoryPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>Catégorie</Text>
              {categories?.map(c => (
                <TouchableOpacity key={c.id} style={styles.pickerOption} onPress={() => { setSelectedCategory(c); setShowCategoryPicker(false); }}>
                  <Text style={[styles.pickerOptionText, selectedCategory?.id === c.id && styles.pickerOptionSelected]}>{c.name}</Text>
                  {selectedCategory?.id === c.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>


                {/* Account Picker Modal */}
                <Modal visible={showAccountPicker} transparent animationType="fade" onRequestClose={() => setShowAccountPicker(false)}>
                  <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowAccountPicker(false)}>
                    <View style={styles.pickerSheet}>
                      <Text style={styles.pickerSheetTitle}>Mode de paiement</Text>
                      {accounts?.map(a => (
                        <TouchableOpacity key={a.id} style={styles.pickerOption} onPress={() => { setSelectedAccount(a); setShowAccountPicker(false); }}>
                          <Text style={[styles.pickerOptionText, selectedAccount?.id === a.id && styles.pickerOptionSelected]}>{a.name}</Text>
                          {selectedAccount?.id === a.id && <Text style={styles.pickerCheck}>✓</Text>}
                        </TouchableOpacity>
                      ))}
                    </View>
                  </TouchableOpacity>
                </Modal>

        {/* Date Picker Modal */}
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerSheet}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)} activeOpacity={0.7}>
                  <Text style={styles.datePickerCancel}>Annuler</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Date</Text>
                <TouchableOpacity onPress={confirmDate} activeOpacity={0.7}>
                  <Text style={styles.datePickerOk}>OK</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
            </View>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const Expenses: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const user = useSelector((state: any) => state.user.customer);
  const { getExpenses, getExpense, getExpenseResources, createExpense, updateExpense, exportExpenses, deleteExpense } = useExpense();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Mois');
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState([]);
  const [selectedYear, setSelectedYear] = useState('Année');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpenseItem | null>(null);

  const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const YEARS = ['2026', '2025', '2024'];
  const isFilterMount = useRef(false);

  const getFilterParams = () => {
    const monthNum = selectedMonth !== 'Mois' ? MONTHS.indexOf(selectedMonth) + 1 : undefined;
    const yearNum = selectedYear !== 'Année' ? parseInt(selectedYear) : undefined;
    return (monthNum || yearNum) ? { month: monthNum, year: yearNum } : undefined;
  };

    const fetchData = async (params?: { month?: number; year?: number }) => {
      try {
        const [expensesResult, resourcesResult] = await Promise.all([
          getExpenses(params),
          getExpenseResources(),
        ]);
        console.log('Expenses Result:', expensesResult);
        if (expensesResult.success) setExpenses(expensesResult.expenses ?? []);
        if (resourcesResult.success) {
          console.log('Resources Result:', resourcesResult.resources);
          setAccounts(resourcesResult.resources?.accounts ?? []);
          setCategories(resourcesResult.resources?.categories ?? []);
        }
      } catch {
        Alert.alert('Erreur', 'Impossible de charger les dépenses.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    useEffect(() => { fetchData(); }, []);
    useEffect(() => {
    if (!isFilterMount.current) { isFilterMount.current = true; return; }
    setLoading(true);
    fetchData(getFilterParams());
    }, [selectedMonth, selectedYear]);

      const handleEditExpense = (item: any) => {
        setSelectedItem(null);
        setEditingItem(item);
      };

    
      const handleDeleteExpense = async (id: number) => {
        const result = await deleteExpense(id);
        if (result.success) {
          setSelectedItem(null);
          fetchData();
          Alert.alert('Succès', 'Dépense supprimée avec succès.');
        } else {
          Alert.alert('Erreur', result.error ?? 'Impossible de supprimer la dépense.');
        }
      };

        const handleExport = async () => {
          if (exporting) return;
          setExporting(true);
          try {
            const result = await exportExpenses();
            if (result.success && result.fileUrl) {
              Linking.openURL(result.fileUrl).catch(() =>
                Alert.alert('Erreur', 'Impossible d\'ouvrir le fichier CSV.')
              );
            } else {
              Alert.alert('Erreur', result.error ?? 'Impossible d\'exporter les dépenses.');
            }
          } finally {
            setExporting(false);
          }
        };
      
        useEffect(() => {
          if (!loading && route.params?.openCreateModal) {
            setShowCreateModal(true);
          }
        }, [loading, route.params?.openCreateModal]);

  const filtered = expenses.filter(t => {
    const q = searchQuery.toLowerCase();
    return !q || t.payment_method.toLowerCase().includes(q) || (t.category?.name ?? '').toLowerCase().includes(q);
    // const matchSearch = !q || t.payment_method.toLowerCase().includes(q) || (t.category?.name ?? '').toLowerCase().includes(q);
    // const matchMonth = selectedMonth === 'Mois' || new Date(t.date).toLocaleDateString('fr-FR', { month: 'long' }).toLowerCase() === selectedMonth.toLowerCase();
    // const matchYear = selectedYear === 'Année' || new Date(t.date).getFullYear().toString() === selectedYear;
    // return matchSearch && matchMonth && matchYear;
  });

  // const renderItem = ({ item }: { item: ExpenseItem }) => (
  const renderItem = ({ item }: { item: any }) => {
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
      return (
    <TouchableOpacity style={styles.expenseCard} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
      <View style={styles.expenseCardLeft}>
        <View style={styles.expenseIconBox}>
          <Text style={styles.expenseIconText}>−</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.expenseDesc} numberOfLines={1}>{item.payment_method}</Text>
          <Text style={styles.expenseMeta}>{formattedDate} • {item.category.name}</Text>
        </View>
      </View>
      <Text style={styles.expenseAmount}>-{parseFloat(item.total_ttc).toLocaleString('fr-FR')} MAD</Text>
    </TouchableOpacity>
      )
  }



  

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Image source={appLogoIcon} style={styles.logo} resizeMode="contain" />
        </View>
        <View style={styles.titleRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => nav.goBack()} activeOpacity={0.7}>
            <ArrowLeft size={20} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleText}>Dépenses</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport} disabled={exporting} activeOpacity={0.8}>
            {exporting
              ? <ActivityIndicator size="small" color="#4B5563" />
              : <Upload size={15} color="#4B5563" />
            }
            <Text style={styles.exportBtnText}>Exporter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedMonth !== 'Mois' && styles.filterBtnActive]}
            onPress={() => { setShowMonthPicker(!showMonthPicker); setShowYearPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedMonth !== 'Mois' && styles.filterBtnTextActive]}>{selectedMonth}</Text>
            <ChevronDown size={14} color={selectedMonth !== 'Mois' ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showMonthPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedMonth('Mois'); setShowMonthPicker(false); }}>
                <Text style={styles.dropdownItemText}>Tous les mois</Text>
              </TouchableOpacity>
              {MONTHS.map(m => (
                <TouchableOpacity key={m} style={styles.dropdownItem} onPress={() => { setSelectedMonth(m); setShowMonthPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedMonth === m && styles.dropdownItemSelected]}>{m}</Text>
                  {selectedMonth === m && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={{ position: 'relative' }}>
          <TouchableOpacity
            style={[styles.filterBtn, selectedYear !== 'Année' && styles.filterBtnActive]}
            onPress={() => { setShowYearPicker(!showYearPicker); setShowMonthPicker(false); }}
            activeOpacity={0.8}
          >
            <Text style={[styles.filterBtnText, selectedYear !== 'Année' && styles.filterBtnTextActive]}>{selectedYear}</Text>
            <ChevronDown size={14} color={selectedYear !== 'Année' ? '#1E5BAC' : '#6B7280'} />
          </TouchableOpacity>
          {showYearPicker && (
            <View style={styles.dropdown}>
              <TouchableOpacity style={styles.dropdownItem} onPress={() => { setSelectedYear('Année'); setShowYearPicker(false); }}>
                <Text style={styles.dropdownItemText}>Toutes</Text>
              </TouchableOpacity>
              {YEARS.map(y => (
                <TouchableOpacity key={y} style={styles.dropdownItem} onPress={() => { setSelectedYear(y); setShowYearPicker(false); }}>
                  <Text style={[styles.dropdownItemText, selectedYear === y && styles.dropdownItemSelected]}>{y}</Text>
                  {selectedYear === y && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1E5BAC" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#1E5BAC" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>Aucune dépense trouvée</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      <CreateExpenseModal
        visible={showCreateModal}
        accounts={accounts}
        customerId={user?.id ?? 0}
        categories={categories}
        onSave={createExpense}
        onClose={() => setShowCreateModal(false)}
        onCreated={fetchData}
      />

      {editingItem && (
        <CreateExpenseModal
          visible={!!editingItem}
          accounts={accounts}
          customerId={user?.id ?? 0}
          categories={categories}
          onSave={createExpense}
          onClose={() => setEditingItem(null)}
          onCreated={fetchData}
          editItem={editingItem}
          onUpdate={updateExpense}
        />
      )}

      {selectedItem && <DetailModal 
      item={selectedItem}
      onClose={() => setSelectedItem(null)}           
      onDelete={handleDeleteExpense}
      onEdit={() => handleEditExpense(selectedItem)} 
      />}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: { alignItems: 'center', marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  logo: { height: 48, width: 160 },
  titleText: { fontSize: 20, fontWeight: '700', color: '#1F2937' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  exportBtnText: { fontSize: 13, fontWeight: '500', color: '#4B5563' },

  // Filters
  filtersRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 12, paddingVertical: 10 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'transparent',
  },
  filterBtnActive: { backgroundColor: '#FFFFFF', borderColor: '#BFDBFE' },
  filterBtnText: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  filterBtnTextActive: { color: '#1E5BAC' },
  dropdown: {
    position: 'absolute', top: 44, left: 0, zIndex: 50,
    backgroundColor: '#FFFFFF', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
    minWidth: 160, borderWidth: 1, borderColor: '#F3F4F6',
    paddingVertical: 4,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 10,
  },
  dropdownItemText: { fontSize: 13, color: '#374151' },
  dropdownItemSelected: { color: '#1E5BAC', fontWeight: '600' },
  dropdownCheck: { color: '#1E5BAC', fontWeight: '700', fontSize: 14 },

  // List
  listContent: { padding: 12, paddingBottom: 100, gap: 10 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Expense Card
  expenseCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  expenseCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  expenseIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  expenseIconText: { fontSize: 24, color: '#DC2626', fontWeight: '300', lineHeight: 28 },
  expenseDesc: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  expenseMeta: { fontSize: 12, color: '#6B7280' },
  expenseAmount: { fontSize: 14, fontWeight: '700', color: '#DC2626' },

  // FAB
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 8,
  },

  // Modal shared
  modalContainer: { flex: 1, backgroundColor: '#F5F7FF' },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: '#F5F7FF',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  modalCancelText: { fontSize: 15, fontWeight: '500', color: '#1E5BAC' },
  modalTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', flex: 1, textAlign: 'center', marginHorizontal: 8 },
  modalConfirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 8,
    minWidth: 80, alignItems: 'center',
  },
  modalConfirmText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  modalContent: { padding: 16, paddingBottom: 40 },

  // Form card
  formCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16,
    padding: 18, gap: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  uploadArea: { flexDirection: 'row', gap: 12 },
  uploadBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E0E7FF', borderRadius: 12,
    paddingVertical: 14,
  },
  uploadBtnText: { fontSize: 12, fontWeight: '500', color: '#374151' },
  fieldBlock: { gap: 6 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#1E5BAC' },
  optional: { fontSize: 12, fontWeight: '400', color: '#9CA3AF' },
  fieldInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1F2937',
  },
  fieldInputRow: { flexDirection: 'row', alignItems: 'center' },
  fieldUnit: { fontSize: 13, fontWeight: '500', color: '#6B7280', marginLeft: 8 },
  pickerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 13,
  },
  pickerPlaceholderText: { fontSize: 14, color: '#9CA3AF', flex: 1 },
  pickerValueText: { fontSize: 14, color: '#1F2937', flex: 1, fontWeight: '500' },
  totalsBlock: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowLast: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  totalLabelBold: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  totalValueBold: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },
  confirmBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Pickers
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingVertical: 12, paddingHorizontal: 8, maxHeight: 400,
  },
  pickerSheetTitle: {
    fontSize: 14, fontWeight: '700', color: '#374151',
    paddingHorizontal: 12, paddingBottom: 8, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  pickerOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  pickerOptionText: { fontSize: 14, color: '#374151' },
  pickerOptionSelected: { color: '#1E5BAC', fontWeight: '600' },
  pickerCheck: { fontSize: 15, color: '#1E5BAC', fontWeight: '700' },

  // Detail Modal
  detailModalHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  detailModalTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  detailCloseBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
  },
  detailHero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  badgeRedLg: { backgroundColor: '#FEE2E2', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeRedLgText: { fontSize: 12, fontWeight: '600', color: '#DC2626' },
  detailAmount: { fontSize: 28, fontWeight: '700', color: '#DC2626' },
  detailDate: { fontSize: 13, color: '#9CA3AF' },
  detailCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F9FAFB',
  },
  detailRowLabel: { fontSize: 14, color: '#6B7280' },
  detailRowValue: { fontSize: 14, fontWeight: '600', color: '#1F2937', maxWidth: '55%', textAlign: 'right' },
  statusCompleted: { color: '#16A34A' },
  statusPending: { color: '#EA580C' },
  attachmentCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  attachmentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  attachmentIconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center', alignItems: 'center',
  },
  attachmentName: { fontSize: 13, fontWeight: '600', color: '#1E3A5F' },
  attachmentSub: { fontSize: 11, color: '#3B82F6', marginTop: 2 },
  attachmentDownload: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  noAttachment: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E7EB',
    borderRadius: 12, padding: 24, alignItems: 'center', gap: 6,
  },
  noAttachmentText: { fontSize: 13, color: '#9CA3AF' },
  noAttachmentLink: { fontSize: 13, fontWeight: '600', color: '#1E5BAC' },
  detailFooter: {
    flexDirection: 'row', gap: 12,
    padding: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6',
    backgroundColor: '#F9FAFB',
  },
  detailDeleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: '#FEF2F2',
  },
  detailDeleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12, backgroundColor: '#1E5BAC',
  },
  detailEditText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

    // Date Picker bottom sheet
  datePickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  datePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 24,
  },
  datePickerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  datePickerCancel: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
  datePickerOk: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },
});

export default Expenses;
