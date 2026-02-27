import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  ArrowLeft,
  Bell,
  Search,
  Plus,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  X,
  CloudUpload,
  Calendar,
  Upload,
  Receipt,
  CirclePlus
} from 'lucide-react-native';
import LinearGradient from 'react-native-linear-gradient';
import { appLogoIcon } from '../../assets/icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvoice } from '../../hooks/useInvoice';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';

type StackNavigation = StackNavigationProp<any>;

interface Account { id: number; name: string; }
interface Category { id: number; name: string; }
interface Client { id: number; name: string; }

const STATUT_OPTIONS = ['Quote', 'Issued', 'Paid', 'Cancelled'];

type InvoiceTabType = 'Tous' | 'Quote' | 'Issued' | 'Paid' | 'Cancelled';
const INVOICE_TABS: InvoiceTabType[] = ['Tous', 'Quote', 'Issued', 'Paid', 'Cancelled'];

interface InvoiceArticle {
  id: number;
  invoice_id: number;
  designation: string;
  unit_price_ht: string;
  quantity: number;
  total_price_ht: string;
  tva_percentage: string;
}

interface InvoiceItem {
  id: number;
  customer_id: number;
  client_id: number;
  date: string;
  invoice_number: string;
  payment_method: string;
  status: string;
  document_path: string | null;
  invoice_url: string | null;
  client: { id: number; client_name: string } | null;
  articles: InvoiceArticle[];
}

interface Article {
  designation: string;
  unitPriceHT: number;
  quantity: number;
  totalHT: number;
  tva: number;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const isCompleted = status === 'Payé';
  const isCancelled = status === 'Annulé';
  const badgeStyle = isCompleted ? styles.badgeGreen : isCancelled ? styles.badgeRed : styles.badgeOrange;
  const textStyle = isCompleted ? styles.badgeTextGreen : isCancelled ? styles.badgeTextRed : styles.badgeTextOrange;
  return (
    <View style={[styles.badge, badgeStyle]}>
      <Text style={[styles.badgeText, textStyle]}>{status}</Text>
    </View>
  );
};

// Article Form Modal
const ArticleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: (article: Article) => void;
}> = ({ visible, onClose, onConfirm }) => {
  const [form, setForm] = useState<Article>({
    designation: '',
    unitPriceHT: 0,
    quantity: 1,
    totalHT: 0,
    tva: 20,
  });

  useEffect(() => {
    setForm(prev => ({ ...prev, totalHT: prev.unitPriceHT * prev.quantity }));
  }, [form.unitPriceHT, form.quantity]);

  const handleConfirm = () => {
    if (!form.designation.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir la désignation.');
      return;
    }
    onConfirm(form);
    setForm({ designation: '', unitPriceHT: 0, quantity: 1, totalHT: 0, tva: 20 });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Désignation de l'article</Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.modalConfirmText}>Confirmer</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* Désignation */}
            <View style={styles.formCard}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Désignation <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="Ajouter désignation"
                  placeholderTextColor="#9CA3AF"
                  value={form.designation}
                  onChangeText={v => setForm({ ...form, designation: v })}
                />
              </View>

              {/* Prix H.T. unitaire */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Prix H.T. unitaire <Text style={styles.required}>*</Text></Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="0"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={form.unitPriceHT > 0 ? String(form.unitPriceHT) : ''}
                    onChangeText={v => setForm({ ...form, unitPriceHT: parseFloat(v) || 0 })}
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
              </View>

              {/* Quantité */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Quantité <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder="1"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={form.quantity > 0 ? String(form.quantity) : ''}
                  onChangeText={v => setForm({ ...form, quantity: parseFloat(v) || 0 })}
                />
              </View>

              {/* Prix H.T. total (read-only) */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Prix H.T. total</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, styles.fieldInputReadOnly, { flex: 1 }]}
                    value={form.totalHT.toLocaleString('fr-FR')}
                    editable={false}
                  />
                  <Text style={styles.fieldUnit}>MAD</Text>
                </View>
              </View>

              {/* TVA */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>TVA %</Text>
                <View style={styles.fieldInputRow}>
                  <TextInput
                    style={[styles.fieldInput, { flex: 1 }]}
                    placeholder="20"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={String(form.tva)}
                    onChangeText={v => setForm({ ...form, tva: parseFloat(v) || 0 })}
                  />
                  <Text style={styles.fieldUnit}>%</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.addArticleBtn} onPress={handleConfirm} activeOpacity={0.85}>
                <Text style={styles.addArticleBtnText}>Ajouter</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

// Create Invoice Modal
const CreateInvoiceModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  accounts: Account[];
  clients: Client[];
  customerId: number;
  onCreated: () => void;
  onSave: (payload: any) => Promise<{ success: boolean; error?: string }>;
  editItem?: InvoiceItem;
  onUpdate?: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
}> = ({ visible, onClose, accounts, clients, customerId, onCreated, onSave, editItem, onUpdate }) => {
  const insets = useSafeAreaInsets();
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('F2026-001');
  const [date, setDate] = useState('2026-04-24');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showClientPicker, setShowClientPicker] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setShowArticleModal(false);
    setShowDatePicker(false);
    setSaving(false);
    if (editItem) {
      setInvoiceNumber(editItem.invoice_number);
      const datePart = editItem.date.split('T')[0];
      setDate(datePart);
      const [ey, em, ed] = datePart.split('-').map(Number);
      setTempDate(new Date(ey, em - 1, ed));
      const client = clients.find(c => c.id === editItem.client_id) ?? null;
      setSelectedClient(client);
      const account = accounts.find(a => a.name === editItem.payment_method) ?? null;
      setSelectedAccount(account);
      setSelectedStatus(editItem.status);
      setArticles(
        editItem.articles.map(a => ({
          designation: a.designation,
          unitPriceHT: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          totalHT: parseFloat(a.total_price_ht),
          tva: parseFloat(a.tva_percentage),
        }))
      );
      if (editItem.document_path) {
        const fileName = editItem.document_path.split('/').pop() ?? 'document';
        setDocument({ name: fileName, isExisting: true });
      } else {
        setDocument(null);
      }
    } else {
      setArticles([]);
      const today = new Date();
      const y = today.getFullYear();
      const mo = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setInvoiceNumber('');
      setDate(`${y}-${mo}-${d}`);
      setSelectedClient(null);
      setSelectedAccount(null);
      setSelectedStatus('');
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

  const totalHT = articles.reduce((s, a) => s + a.totalHT, 0);
  const totalTVA = articles.reduce((s, a) => s + (a.totalHT * a.tva) / 100, 0);
  const totalTTC = totalHT + totalTVA;

  const handleSave = async () => {
    if (!selectedClient) { Alert.alert('Requis', 'Veuillez sélectionner un client.'); return; }
    if (!selectedAccount) { Alert.alert('Requis', 'Veuillez choisir un mode de paiement.'); return; }
    if (!selectedStatus) { Alert.alert('Requis', 'Veuillez sélectionner un statut.'); return; }
    if (articles.length === 0) { Alert.alert('Requis', 'Ajoutez au moins un article.'); return; }

    setSaving(true);
    try {
      const payload = {
        customer_id: customerId,
        client_id: selectedClient.id,
        date,
        invoice_number: invoiceNumber,
        payment_method: selectedAccount!.name,
        status: selectedStatus,
        document: document?.isExisting ? null : document,
        articles: articles.map(a => ({
          designation: a.designation,
          unit_price_ht: a.unitPriceHT,
          quantity: a.quantity,
          total_price_ht: a.totalHT,
          tva_percentage: a.tva,
        })),
      };
      if (editItem && onUpdate) {
        const result = await onUpdate(editItem.id, payload);
        if (result.success) {
          Alert.alert('Succès', 'Facture modifiée avec succès.');
          onCreated();
          onClose();
        } else {
          Alert.alert('Erreur', result.error ?? 'Une erreur est survenue.');
        }
      } else {
        const result = await onSave(payload);
        if (result.success) {
          Alert.alert('Succès', 'Facture créée avec succès.');
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
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.modalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editItem ? 'Modification de facture' : 'Création de facture'}</Text>
            <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleSave} disabled={saving} activeOpacity={0.8}>
              {saving
                ? <ActivityIndicator size="small" color="#FFFFFF" />
                : <Text style={styles.modalConfirmText}>Confirmer</Text>
              }
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.formCard}>
              {/* Upload Doc */}
              <TouchableOpacity style={[styles.uploadRow, document && styles.uploadRowDone]} onPress={handlePickDocument} activeOpacity={0.7}>
                <CloudUpload size={22} color={document ? '#16A34A' : '#1E5BAC'} />
                <Text style={[styles.uploadText, document && styles.uploadTextDone]} numberOfLines={1}>
                  {document ? document.name : 'Télécharger un document'}
                </Text>
                {document && (
                  <TouchableOpacity onPress={() => setDocument(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <X size={16} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>

              {/* Invoice Number */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Numéro de facture <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.fieldInput}
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                  placeholder="F2026-001"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              {/* Date */}
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

              {/* Client */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Client <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.pickerRow} onPress={() => setShowClientPicker(true)} activeOpacity={0.7}>
                  <Text style={selectedClient ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedClient ? selectedClient.name : 'Sélectionner un client'}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
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

              {/* Statut */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Statut <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity style={styles.pickerRow} onPress={() => setShowStatusPicker(true)} activeOpacity={0.7}>
                  <Text style={selectedStatus ? styles.pickerValueText : styles.pickerPlaceholderText}>
                    {selectedStatus || 'Sélectionner le statut'}
                  </Text>
                  <ChevronDown size={18} color="#1E5BAC" />
                </TouchableOpacity>
              </View>

              {/* Articles */}
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>Articles</Text>
                {articles.map((a, i) => (
                  <View key={i} style={styles.articleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.articleDesignation}>{a.designation}</Text>
                      <Text style={styles.articleMeta}>
                        {a.quantity} × {a.unitPriceHT.toLocaleString('fr-FR')} MAD HT
                      </Text>
                    </View>
                    <Text style={styles.articleTotal}>{a.totalHT.toLocaleString('fr-FR')} MAD</Text>
                    <TouchableOpacity onPress={() => setArticles(articles.filter((_, j) => j !== i))} style={{ marginLeft: 8 }}>
                      <X size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addArticleRowBtn} onPress={() => setShowArticleModal(true)} activeOpacity={0.8}>
                  <Plus size={18} color="#1E5BAC" />
                  <Text style={styles.addArticleRowText}>Ajouter un article</Text>
                </TouchableOpacity>
                {articles.length === 0 && (
                  <Text style={styles.articleHint}>Ajoutez un ou plusieurs articles</Text>
                )}
              </View>

              {/* Totals */}
              {articles.length > 0 && (
                <View style={styles.totalsBlock}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total H.T.</Text>
                    <Text style={styles.totalValue}>{totalHT.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total TVA</Text>
                    <Text style={styles.totalValue}>{totalTVA.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                  <View style={[styles.totalRow, styles.totalRowLast]}>
                    <Text style={styles.totalLabelBold}>Total TTC</Text>
                    <Text style={styles.totalValueBold}>{totalTTC.toLocaleString('fr-FR')} MAD</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.addArticleBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving
                  ? <ActivityIndicator size="small" color="#FFFFFF" />
                  : <Text style={styles.addArticleBtnText}>Confirmer</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Client Picker Modal */}
        <Modal visible={showClientPicker} transparent animationType="fade" onRequestClose={() => setShowClientPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowClientPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>Client</Text>
              {clients.map(c => (
                <TouchableOpacity key={c.id} style={styles.pickerOption} onPress={() => { setSelectedClient(c); setShowClientPicker(false); }}>
                  <Text style={[styles.pickerOptionText, selectedClient?.id === c.id && styles.pickerOptionSelected]}>{c.name}</Text>
                  {selectedClient?.id === c.id && <Text style={styles.pickerCheck}>✓</Text>}
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
              {accounts.map(a => (
                <TouchableOpacity key={a.id} style={styles.pickerOption} onPress={() => { setSelectedAccount(a); setShowAccountPicker(false); }}>
                  <Text style={[styles.pickerOptionText, selectedAccount?.id === a.id && styles.pickerOptionSelected]}>{a.name}</Text>
                  {selectedAccount?.id === a.id && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Statut Picker Modal */}
        <Modal visible={showStatusPicker} transparent animationType="fade" onRequestClose={() => setShowStatusPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>Statut</Text>
              {STATUT_OPTIONS.map(s => (
                <TouchableOpacity key={s} style={styles.pickerOption} onPress={() => { setSelectedStatus(s); setShowStatusPicker(false); }}>
                  <Text style={[styles.pickerOptionText, selectedStatus === s && styles.pickerOptionSelected]}>{s}</Text>
                  {selectedStatus === s && <Text style={styles.pickerCheck}>✓</Text>}
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

        <ArticleModal visible={showArticleModal} onClose={() => setShowArticleModal(false)} onConfirm={a => { setArticles([...articles, a]); setShowArticleModal(false); }} />
      </View>
    </Modal>
  );
};

// Detail Modal
const DetailModal: React.FC<{
  item: InvoiceItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
  onUpdate: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
}> = ({ item, onClose, onDelete, onEdit, onUpdate }) => {
  const totalHT = item.articles.reduce((s, a) => s + parseFloat(a.total_price_ht), 0);
  const totalTVA = item.articles.reduce((s, a) => s + (parseFloat(a.total_price_ht) * parseFloat(a.tva_percentage)) / 100, 0);
  const totalTTC = totalHT + totalTVA;
  const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    const rawFileName = item.document_path?.split('/').pop() || 'Document';
  const attachmentName = rawFileName.length > 24 ? `${rawFileName.slice(0, 24)}...` : rawFileName;
  const [deleting, setDeleting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) { setShowStatusPicker(false); return; }
    setShowStatusPicker(false);
    setUpdatingStatus(true);
    try {
      const datePart = item.date.split('T')[0];
      const payload = {
        customer_id: item.customer_id,
        client_id: item.client_id,
        date: datePart,
        invoice_number: item.invoice_number,
        payment_method: item.payment_method,
        status: newStatus,
        document: null,
        articles: item.articles.map(a => ({
          designation: a.designation,
          unit_price_ht: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          total_price_ht: parseFloat(a.total_price_ht),
          tva_percentage: parseFloat(a.tva_percentage),
        })),
      };
      const result = await onUpdate(item.id, payload);
      if (result.success) {
        setCurrentStatus(newStatus);
      } else {
        Alert.alert('Erreur', result.error ?? 'Impossible de mettre à jour le statut.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut.');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

    const handleDownload = () => {
    if (!item.invoice_url) return;
    Linking.openURL(item.invoice_url).catch(() => Alert.alert('Erreur', "Impossible d'ouvrir le document."));
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <Text style={styles.detailModalTitle}>Détails de la facture</Text>
          <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Amount hero */}
          <View style={styles.detailHero}>
            {/* Status dropdown */}
            <TouchableOpacity
              style={styles.statusDropdownBtn}
              onPress={() => setShowStatusPicker(true)}
              disabled={updatingStatus}
              activeOpacity={0.8}
            >
              {updatingStatus ? (
                <ActivityIndicator size="small" color="#1E5BAC" />
              ) : (
                <>
                  {/* <StatusBadge status={currentStatus} /> */}
                  <Text>{currentStatus}</Text>
                  
                  <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.detailAmount}>{totalTTC.toLocaleString('fr-FR')} MAD</Text>
            <Text style={styles.detailDate}>{formattedDate}</Text>
          </View>

          {/* Detail rows */}
          <View style={styles.detailCard}>
            {[
              { label: 'Numéro de facture', value: item.invoice_number },
              { label: 'Client', value: item.client?.client_name ?? '—' },
              { label: 'Mode de paiement', value: item.payment_method },
              { label: 'Statut', value: currentStatus },
              { label: 'Total H.T.', value: `${totalHT.toLocaleString('fr-FR')} MAD` },
              { label: 'Total TVA', value: `${totalTVA.toLocaleString('fr-FR')} MAD` },
              { label: 'Total TTC', value: `${totalTTC.toLocaleString('fr-FR')} MAD` },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{row.label}</Text>
                <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
              </View>
            ))}
          </View>

          {/* Articles */}
          {item.articles.length > 0 && (
            <View style={styles.detailCard}>
              <View style={[styles.detailRow, { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
                <Text style={[styles.detailRowLabel, { fontWeight: '700', color: '#1F2937' }]}>Articles</Text>
              </View>
              {item.articles.map(a => (
                <View key={a.id} style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailRowLabel, { fontWeight: '600', color: '#1F2937' }]}>{a.designation}</Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {a.quantity} × {parseFloat(a.unit_price_ht).toLocaleString('fr-FR')} MAD HT  •  TVA {a.tva_percentage}%
                    </Text>
                  </View>
                  <Text style={styles.detailRowValue}>{parseFloat(a.total_price_ht).toLocaleString('fr-FR')} MAD</Text>
                </View>
              ))}
            </View>
          )}

          {/* Attachment */}
          {item.document_path ? (
            <TouchableOpacity style={styles.attachmentCard} onPress={handleDownload} activeOpacity={0.8}>
              <View style={styles.attachmentLeft}>
                <View style={styles.attachmentIconBox}>
                  <FileText size={20} color="#1E5BAC" />
                </View>
                <View>
                  {/* <Text style={styles.attachmentName}>{item.document_path.split('/').pop()}</Text> */}
                  <Text style={styles.attachmentName}>{attachmentName}</Text>
                  <Text style={styles.attachmentSub}>Document joint</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.attachmentDownload} activeOpacity={0.7}>
                <Download size={18} color="#1E5BAC" />
              </TouchableOpacity>
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

        {/* Footer */}
        <View style={styles.detailFooter}>
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

        {/* Status Picker Modal */}
        <Modal visible={showStatusPicker} transparent animationType="slide" onRequestClose={() => setShowStatusPicker(false)}>
          <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowStatusPicker(false)}>
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>Changer le statut</Text>
              {STATUT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s}
                  style={styles.pickerOption}
                  onPress={() => handleStatusChange(s)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, currentStatus === s && styles.pickerOptionSelected]}>{s}</Text>
                  {currentStatus === s && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

// Main Invoice Screen
const Invoice: React.FC = ({ navigation: navProp }: any) => {
  const navigation = useNavigation<StackNavigation>();
  const nav = navProp ?? navigation;
  const route = useRoute<any>();
  const { getInvoices, getInvoiceResources, createInvoice, updateInvoice, exportInvoices, deleteInvoice } = useInvoice();
  const user = useSelector((state: any) => state.user.customer);

  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('Mois');
  const [selectedYear, setSelectedYear] = useState('Année');
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InvoiceItem | null>(null);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<InvoiceTabType>('Tous');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

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
      const [invoicesResult, resourcesResult] = await Promise.all([
        getInvoices(params),
        getInvoiceResources(),
      ]);
      if (invoicesResult.success) setInvoices(invoicesResult.invoices ?? []);
      if (resourcesResult.success) {
        setAccounts(resourcesResult.resources?.accounts ?? []);
        setCategories(resourcesResult.resources?.categories ?? []);
        setClients(
          (resourcesResult.resources?.clients ?? []).map((c: any) => ({
            id: c.id,
            name: c.client_name,
          }))
        );
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de charger les factures.');
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

  const handleEditInvoice = (item: InvoiceItem) => {
    setSelectedItem(null);
    setEditingItem(item);
  };

  const handleDeleteInvoice = async (id: number) => {
    const result = await deleteInvoice(id);
    if (result.success) {
      setSelectedItem(null);
      fetchData();
      Alert.alert('Succès', 'Facture supprimée avec succès.');
    } else {
      Alert.alert('Erreur', result.error ?? 'Impossible de supprimer la facture.');
    }
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const result = await exportInvoices();
      if (result.success && result.fileUrl) {
        Linking.openURL(result.fileUrl).catch(() =>
          Alert.alert('Erreur', 'Impossible d\'ouvrir le fichier CSV.')
        );
      } else {
        Alert.alert('Erreur', result.error ?? 'Impossible d\'exporter les factures.');
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

  const filtered = invoices.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || t.invoice_number.toLowerCase().includes(q) || (t.client?.client_name ?? '').toLowerCase().includes(q);
    const matchesTab = activeTab === 'Tous' || t.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderItem = ({ item }: { item: InvoiceItem }) => {
    const totalHT = item.articles.reduce((s, a) => s + parseFloat(a.total_price_ht), 0);
    const totalTVA = item.articles.reduce((s, a) => s + (parseFloat(a.total_price_ht) * parseFloat(a.tva_percentage)) / 100, 0);
    const totalTTC = totalHT + totalTVA;
    console.log('totaltttc:11', totalTTC);
    console.log('totaltttc:22', totalTTC.toLocaleString('fr-FR'));
    const formattedDate = new Date(item.date).toLocaleDateString('fr-FR');
    return (
      <TouchableOpacity style={styles.invoiceCard} onPress={() => setSelectedItem(item)} activeOpacity={0.8}>
        <View style={styles.invoiceCardLeft}>
          <View style={styles.invoiceIconBox}>
            <Plus size={20} color="#16A34A" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.invoiceDesc} numberOfLines={1}>{item.invoice_number}</Text>
            <Text style={styles.invoiceMeta}>
              {formattedDate} • {item.status}
            </Text>
            {item.client && <Text style={styles.invoiceRef}>{item.client.client_name}</Text>}
          </View>
        </View>
        <View style={styles.invoiceCardRight}>
          <Text style={styles.invoiceAmount}>+{totalTTC.toLocaleString('fr-FR')} MAD</Text>
          {/* <StatusBadge status={item.status} /> */}
        </View>
      </TouchableOpacity>
    );
  };

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
                <Text style={styles.titleText}>Factures</Text>
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
        {/* Month */}
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

        {/* Year */}
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

      {/* Status Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsWrapper}
        contentContainerStyle={styles.tabsContainer}
      >
        {INVOICE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

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
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(getFilterParams()); }} tintColor="#1E5BAC" />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Receipt size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>Aucune facture trouvée</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreateModal(true)} activeOpacity={0.85}>
        <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Modal */}
      <CreateInvoiceModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        accounts={accounts}
        clients={clients}
        customerId={user?.id ?? 0}
        onCreated={fetchData}
        onSave={createInvoice}
      />

      {/* Detail Modal */}
      {selectedItem && (
        <DetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDeleteInvoice}
          onEdit={() => handleEditInvoice(selectedItem)}
          onUpdate={updateInvoice}
        />
      )}

      {/* Edit Modal */}
      {editingItem && (
        <CreateInvoiceModal
          visible={!!editingItem}
          onClose={() => setEditingItem(null)}
          accounts={accounts}
          clients={clients}
          customerId={user?.id ?? 0}
          onCreated={fetchData}
          onSave={createInvoice}
          editItem={editingItem}
          onUpdate={updateInvoice}
        />
      )}
    </SafeAreaView>
  );
};


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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  logo: { height: 48, width: 160 },
  headerSpacer: { width: 40 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  searchContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, color: '#1F2937', padding: 0 },
  bellButton: { position: 'relative', padding: 12, backgroundColor: '#F9FAFB', borderRadius: 12 },
  bellBadge: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: '#EF4444', borderRadius: 10,
    width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  bellBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold' },

  // Banner
  bannerWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingTop: 12, gap: 8,
  },
  titleBanner: { flex: 1, borderRadius: 12, overflow: 'hidden' },
  titleBannerInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  titleIconBox: {
    width: 40, height: 40, borderRadius: 8,
    backgroundColor: '#1E5BAC',
    justifyContent: 'center', alignItems: 'center',
  },
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

  // Tabs
  tabsWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexGrow: 0,
  },
  tabsContainer: {
    flexDirection: 'row',
  },
  tab: {
    paddingTop: 12,
    paddingBottom: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#CCCCCC',
  },
  activeTabText: {
    color: '#0B5FA5',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0B5FA5',
  },

  // Filters
  filtersRow: {
    flexDirection: 'row', gap: 10,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 9,
    borderWidth: 1, borderColor: 'transparent',
  },
  filterBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#BFDBFE',
  },
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
  emptyBox: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 15, color: '#9CA3AF' },

  // Invoice Card
  invoiceCard: {
    backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  invoiceCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  invoiceIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#c5efd5',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  invoiceDesc: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 2 },
  invoiceMeta: { fontSize: 12, color: '#6B7280' },
  invoiceRef: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  invoiceCardRight: { alignItems: 'flex-end', gap: 4 },
  invoiceAmount: { fontSize: 14, fontWeight: '700', color: '#16A34A' },
  attachmentDot: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Status Badge
  badge: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  badgeGreen: { backgroundColor: '#DCFCE7' },
  badgeOrange: { backgroundColor: '#FFEDD5' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextGreen: { color: '#16A34A' },
  badgeTextOrange: { color: '#EA580C' },
  badgeRed: { backgroundColor: '#FEE2E2' },
  badgeTextRed: { color: '#DC2626' },

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
  modalTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
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
  fieldBlock: { gap: 6 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  required: { color: '#1E5BAC' },
  fieldInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#1F2937',
  },
  fieldInputReadOnly: { color: '#6B7280' },
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

  // Upload
  uploadRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#F9FAFB',
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 14,
  },
  uploadRowDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    paddingHorizontal: 12,
    justifyContent: 'flex-start',
  },
  uploadText: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  uploadTextDone: { color: '#16A34A', flex: 1 },

  // Articles inside form
  addArticleRowBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EEF2FF',
    borderWidth: 1, borderColor: '#C7D2FE',
    borderRadius: 10, paddingVertical: 12,
  },
  addArticleRowText: { fontSize: 14, fontWeight: '600', color: '#1E5BAC' },
  articleHint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
  articleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F9FAFB', borderRadius: 8,
    padding: 10, gap: 4,
  },
  articleDesignation: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  articleMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  articleTotal: { fontSize: 13, fontWeight: '600', color: '#16A34A' },

  // Totals
  totalsBlock: {
    borderTopWidth: 1, borderTopColor: '#F3F4F6',
    paddingTop: 12, gap: 8,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowLast: { paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  totalLabel: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  totalValue: { fontSize: 14, color: '#374151', fontWeight: '500' },
  totalLabelBold: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  totalValueBold: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },

  // Add article button
  addArticleBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
    shadowColor: '#1E5BAC', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  addArticleBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },

  // Picker overlay
  pickerOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

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
  pickerSheet: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingVertical: 12, paddingHorizontal: 8,
    maxHeight: 400,
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
  statusDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minWidth: 80,
    justifyContent: 'center',
    minHeight: 32,
  },
  badgeGreenLg: { backgroundColor: '#DCFCE7', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  badgeGreenLgText: { fontSize: 12, fontWeight: '600', color: '#16A34A' },
  detailAmount: { fontSize: 28, fontWeight: '700', color: '#16A34A' },
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
  attachmentDownload: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center',
  },
  noAttachment: {
    borderWidth: 2, borderStyle: 'dashed', borderColor: '#E5E7EB',
    borderRadius: 12, padding: 24,
    alignItems: 'center', gap: 6,
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
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  detailDeleteText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
  detailEditBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 13, borderRadius: 12,
    backgroundColor: '#1E5BAC',
  },
  detailEditText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
});

export default Invoice;
