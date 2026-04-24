import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  Download,
  Trash2,
  X,
  CloudUpload,
  Share2,
  ChevronDown,
  FileText,
  User,
  CreditCard,
  CheckCircle2,
  Layers,
  ArrowRight,
  Edit,
  Copy,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNShare from 'react-native-share';
import { useQuote } from '../../hooks/useQuote';
import { invoiceStyles as styles } from '../../styles/quote.styles';
import type { InvoiceItem } from '../../types/quote.types';
import { STATUT_OPTIONS, resolvePaymentMethod, resolveStatus } from '../../types/quote.types';

interface DetailModalProps {
  item: InvoiceItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
  onUpdate: (id: number, payload: any) => Promise<{ success: boolean; error?: string }>;
}

const DetailModal: React.FC<DetailModalProps> = ({
  item,
  onClose,
  onDelete,
  onEdit,
  onUpdate,
}) => {
  console.log('Rendering DetailModal for quote:', item);
  const { t, i18n } = useTranslation();
  const token = useSelector((state: any) => state.user.token);
  const { getPdfDownloadUrl, convertToInvoice, duplicateQuote, getQuote, updateQuoteStatus } = useQuote();

  // ── Fetched detail state ──────────────────────────────────────────
  const [detail, setDetail] = useState<any>(null);
  const [totals, setTotals] = useState<{ total_ht: number; total_discount: number; total_tva: number; total_ttc: number } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      const result = await getQuote(item.id);
      if (!cancelled) {
        if (result.success && result.quote) {
          setDetail(result.quote);
          setTotals(result.totals ?? null);
        } else {
          setDetail(item);
        }
        setLoadingDetail(false);
      }
    })();
    return () => { cancelled = true; };
  }, [item.id]);

  // Derived display values (from fetched detail or list item as fallback)
  const src = detail ?? item;
  const formattedDate = new Date(src.date).toLocaleDateString('fr-FR');
  const rawFileName = src.document_path?.split('/').pop() || 'Document';
  const attachmentName = rawFileName.length > 24 ? `${rawFileName.slice(0, 24)}...` : rawFileName;

  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(item.status);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  // Keep currentStatus in sync if detail loads a different status
  useEffect(() => {
    if (detail?.status) setCurrentStatus(detail.status);
  }, [detail?.status]);

  const handleConvertToInvoice = async () => {
    Alert.alert(
      t('button_convert_invoice'),
      t('message_confirm_convert_invoice'),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_confirm'),
          onPress: async () => {
            setConverting(true);
            try {
              const result = await convertToInvoice(item.id);
              if (result?.success !== false) {
                Alert.alert(t('success_title'), t('success_quote_converted'));
                onClose();
              } else {
                Alert.alert(t('error_title'), (result as any)?.error ?? t('error_generic'));
              }
            } catch {
              Alert.alert(t('error_title'), t('error_generic'));
            } finally {
              setConverting(false);
            }
          },
        },
      ]
    );
  };

  /** Final states cannot be changed manually */
  const isFinalState = currentStatus === 'accepted' || currentStatus === 'rejected';

  /** Check if a sent quote has passed its due date → should be expired */
  const checkAndAutoExpire = React.useCallback(async () => {
    if (currentStatus !== 'sent') return;
    const dueDate = src.due_date ?? src.valid_until;
    if (!dueDate) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    if (due < today) {
      setUpdatingStatus(true);
      try {
        const result = await updateQuoteStatus(item.id, 'expired');
        if (result.success) {
          setCurrentStatus('expired');
        }
      } catch {
        // silently fail
      } finally {
        setUpdatingStatus(false);
      }
    }
  }, [src]);

  React.useEffect(() => {
    if (!loadingDetail) checkAndAutoExpire();
  }, [loadingDetail]);

  const handleStatusChange = async (newStatus: string) => {
    if (isFinalState) return; 
    if (newStatus === currentStatus) {
      setShowStatusPicker(false);
      return;
    }
    setShowStatusPicker(false);
    setUpdatingStatus(true);
    try {
      const datePart = (src.date ?? item.date).split('T')[0];
      const payload = {
        customer_id: src.customer_id ?? item.customer_id,
        client_id: src.client_id ?? item.client_id,
        date: datePart,
        ...(src.quote_number ? { quote_number: src.quote_number } : { invoice_number: src.invoice_number }),
        payment_method: src.payment_method ?? item.payment_method,
        status: newStatus,
        notes: (src.notes && src.notes !== 'null') ? src.notes : null,
        document: null,
        articles: (src.articles ?? item.articles).map((a: any) => ({
          designation: a.designation,
          unit_price_ht: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          total_price_ht: parseFloat(a.total_price_ht),
          tva_percentage: typeof a.tva_percentage === 'string' ? a.tva_percentage : String(a.tva_percentage),
          product_id: a.product_id,
          unit_id: (a as any).unit_id ?? null,
        })),
      };
      const result = await onUpdate(item.id, payload);
      if (result.success) {
        setCurrentStatus(newStatus);
      } else {
        Alert.alert(t('error_title'), result.error ?? t('error_update_status'));
      }
    } catch {
      Alert.alert(t('error_title'), t('error_update_status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_invoice'),
      t('message_confirm_delete').replace('{invoice_number}', src.quote_number ?? src.invoice_number ?? item.quote_number ?? item.invoice_number ?? ''),
      [
        { text: t('button_cancel'), style: 'cancel' },
        {
          text: t('button_delete'),
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

  const handleDownload = async () => {
    console.log('Initiating document download for quote:101', src);
    if (!src.invoice_url) return;

    setDownloading(true);
console.log('Initiating document download for quote:102', src);
    try {
      const { fs, config } = ReactNativeBlobUtil;
      const filePath = `${fs.dirs.CacheDir}/invoice_${item.id}`;
      console.log('Initiating document download for quote:103', filePath);

      console.log('Downloading document from URL:', src.invoice_url);
      const res = await config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', src.invoice_url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream',
      });
      console.log('Initiating document download for quote:104', res);

      const headers = res.respInfo.headers;
      const mime = (headers['Content-Type'] || headers['content-type'] || 'application/pdf').split(';')[0];

      const extensionMap: any = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/jpg': 'jpg',
      };
      const ext = extensionMap[mime] || 'pdf';

      const finalPath = `${res.path()}.${ext}`;

      if (await fs.exists(finalPath)) await fs.unlink(finalPath);
      await fs.mv(res.path(), finalPath);

      console.log('Document saved to:', finalPath);

      if (Platform.OS === 'ios') {
        await Share.share({
          url: `file://${finalPath}`,
        });
      } else {
        await ReactNativeBlobUtil.android.actionViewIntent(finalPath, mime);
      }
    } catch (e) {
      console.error('Download error:', e);
      Alert.alert(t('error_title'), t('error_document_not_found'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const url = getPdfDownloadUrl(item.id);
    setSharing(true);
    try {
      const { fs, config } = ReactNativeBlobUtil;
      const numberField = src.quote_number ?? src.invoice_number ?? item.quote_number ?? item.invoice_number ?? 'document';
      const safeNumber = numberField.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${fs.dirs.CacheDir}/invoice_pdf_${safeNumber}.pdf`;

      if (await fs.exists(filePath)) await fs.unlink(filePath);

      const res = await config({ fileCache: true, path: filePath }).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      });

      const headers = res.respInfo.headers;
      const contentType = (headers['Content-Type'] || headers['content-type'] || 'application/pdf')
        .split(';')[0]
        .trim();

      if (contentType.includes('text/html')) {
        await fs.unlink(filePath).catch(() => {});
        Alert.alert(t('error_title'), t('error_pdf_expired'));
        return;
      }
      const subject = t('subject_share_quote').replace('{quote_number}', numberField);
      const message = t('message_share_quote').replace('{quote_number}', numberField);

      // react-native-share uses a content:// URI on Android (FileProvider) which
      // triggers ACTION_SEND — showing Gmail, WhatsApp, Telegram, etc.
      await RNShare.open({
        url: `file://${filePath}`,
        type: 'application/pdf',
        filename: `${safeNumber}.pdf`,
        title: subject,
        subject,
        message,
        showAppsToView: true,
        failOnCancel: false,
      });
    } catch (e: any) {
      // failOnCancel: false means cancel won't throw, but guard anyway
      if (e?.message && !e.message.includes('cancel') && !e.message.includes('dismiss')) {
        console.error('Share error:', e);
        Alert.alert(t('error_title'), t('error_unable_to_share'));
      }
    } finally {
      setSharing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    let pdfPath: string | null = null;
    try {
      const url = getPdfDownloadUrl(item.id);
      console.log('Downloading PDF from URL:jjj', url);
      const { fs, config } = ReactNativeBlobUtil;
      const numberField = src.quote_number ?? src.invoice_number ?? item.quote_number ?? item.invoice_number ?? 'document';
      const safeNumber = numberField.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath =
        Platform.OS === 'ios'
          ? `${fs.dirs.DocumentDir}/invoice_pdf_${safeNumber}.pdf`
          : `${fs.dirs.DownloadDir}/invoice_pdf_${safeNumber}.pdf`;

      if (await fs.exists(filePath)) await fs.unlink(filePath);

      const res = await config({ fileCache: true, path: filePath }).fetch('GET', url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/pdf',
      });

      const headers = res.respInfo.headers;
      const contentType = (headers['Content-Type'] || headers['content-type'] || 'application/pdf')
        .split(';')[0]
        .trim();

      if (contentType.includes('text/html')) {
        await fs.unlink(filePath).catch(() => {});
        Alert.alert(t('error_title'), t('error_pdf_expired'));
        return;
      }

      pdfPath = res.path();
    } catch (e: any) {
      console.error('PDF download error:', e);
      Alert.alert(t('error_title'), t('error_unable_to_download_pdf'));
    } finally {
      setDownloadingPdf(false);
    }

    if (pdfPath) {
      onClose();
      const path = pdfPath;
      setTimeout(() => {
        if (Platform.OS === 'ios') {
          ReactNativeBlobUtil.ios.openDocument(path);
        } else {
          ReactNativeBlobUtil.android.actionViewIntent(path, 'application/pdf');
        }
      }, 400);
    }
  };

  const getStatusBadgeColors = (status: string): { bg: string; text: string } => {
    switch (status) {
      case 'accepted': return { bg: '#DCFCE7', text: '#16A34A' };
      case 'sent':     return { bg: '#FEF3C7', text: '#D97706' };
      case 'draft':    return { bg: '#F3F4F6', text: '#6B7280' };
      case 'rejected': return { bg: '#FEE2E2', text: '#DC2626' };
      case 'expired':  return { bg: '#FEE2E2', text: '#DC2626' };
      default:         return { bg: '#FEF3C7', text: '#D97706' };
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <Text style={styles.detailModalTitle}>{t('title_quote_details')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={async () => {
                setDuplicating(true);
                try {
                  const result = await duplicateQuote(item.id);
                  if (result.success) {
                    Alert.alert(t('success_title'), t('success_quote_duplicated') || t('success_invoice_duplicated'));
                  } else {
                    Alert.alert(t('error_title'), result.error ?? t('error_generic'));
                  }
                } finally {
                  setDuplicating(false);
                }
              }}
              disabled={duplicating}
              activeOpacity={0.7}
            >
              {duplicating
                ? <ActivityIndicator size="small" color="#6B7280" />
                : <Copy size={20} color="#6B7280" />}
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
              <X size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {loadingDetail ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#D97706" />
          </View>
        ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Amount hero */}
          <View style={styles.detailHero}>
            {/* Status dropdown — centered */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
                style={[
                  styles.statusDropdownBtn,
                  isFinalState && { opacity: 0.5 },
                ]}
                onPress={() => !isFinalState && setShowStatusPicker(true)}
                disabled={updatingStatus || isFinalState}
                activeOpacity={0.8}
              >
                {updatingStatus ? (
                  <ActivityIndicator size="small" color="#1E5BAC" />
                ) : (
                  <>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: '#374151' }}>{resolveStatus(currentStatus, i18n.language)}</Text>
                    <ChevronDown size={14} color="#9CA3AF" style={{ marginLeft: 4 }} />
                  </>
                )}
              </TouchableOpacity>
            </View>
            {/* Amount + date */}
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.detailAmount}>{(totals?.total_ttc ?? 0).toLocaleString('fr-FR')} MAD</Text>
              <Text style={[styles.detailDate, { marginTop: 4 }]}>{formattedDate}</Text>
            </View>
          </View>

          {/* Detail rows */}
          <View style={styles.detailCard}>
            {/* Quote number */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <FileText size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_quote_number')}</Text>
              </View>
              <Text style={styles.detailRowValue}>{src.quote_number ?? src.invoice_number}</Text>
            </View>
            {/* Client */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <User size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_client')}</Text>
              </View>
              <Text style={styles.detailRowValue}>{src.client?.client_name ?? '—'}</Text>
            </View>
            {/* Validity */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <CreditCard size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_validity')}</Text>
              </View>
              <Text style={styles.detailRowValue}>
                {(src.due_date ?? src.valid_until) ? new Date(src.due_date ?? src.valid_until ?? '').toLocaleDateString('fr-FR') : '—'}
              </Text>
            </View>
            {/* Status */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <CheckCircle2 size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_status')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusBadgeColors(currentStatus).bg }]}>
                <Text style={[styles.statusBadgeText, { color: getStatusBadgeColors(currentStatus).text }]}>
                  {resolveStatus(currentStatus, i18n.language)}
                </Text>
              </View>
            </View>
            {/* Total HT */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <FileText size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_total_ht')}</Text>
              </View>
              <Text style={styles.detailRowValue}>{(totals?.total_ht ?? 0).toLocaleString('fr-FR')} MAD</Text>
            </View>
            {/* Discount */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <Layers size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_discount')}</Text>
              </View>
              <Text style={styles.detailRowValue}>{(totals?.total_discount ?? 0).toLocaleString('fr-FR')} MAD</Text>
            </View>
            {/* TVA */}
            <View style={styles.detailRow}>
              <View style={styles.detailRowLeft}>
                <Layers size={18} color="#9CA3AF" />
                <Text style={styles.detailRowLabel}>{t('label_total_tva')}</Text>
              </View>
              <Text style={styles.detailRowValue}>{(totals?.total_tva ?? 0).toLocaleString('fr-FR')} MAD</Text>
            </View>
            {/* Total TTC — last row, bolder */}
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailRowLeft}>
                <FileText size={18} color="#9CA3AF" />
                <Text style={[styles.detailRowLabel, { fontWeight: '700', color: '#374151' }]}>{t('label_total_ttc')}</Text>
              </View>
              <Text style={[styles.detailRowValue, { fontSize: 16, fontWeight: '700' }]}>{(totals?.total_ttc ?? 0).toLocaleString('fr-FR')} MAD</Text>
            </View>
          </View>

          {/* Articles */}
          {(src.articles ?? []).length > 0 && (
            <View style={[styles.detailCard, { padding: 16 }]}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 12 }}>
                {t('label_articles')}
              </Text>
              <View style={{ gap: 12 }}>
                {(src.articles ?? []).map((a: any) => (
                  <View key={a.id} style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1, marginRight: 16 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
                        {a.designation}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#6B7280' }}>
                        {a.quantity} × {parseFloat(a.unit_price_ht).toLocaleString('fr-FR')} MAD HT  •  TVA {a.tax.rate}%
                        {parseFloat(a.discount ?? '0') > 0 ? `  •  ${t('label_discount')} ${parseFloat(a.discount).toLocaleString('fr-FR')} MAD` : ''}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                      {parseFloat(a.total_ttc).toLocaleString('fr-FR')} MAD
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Attachment */}
          {src.document_path ? (
            <TouchableOpacity
              style={styles.attachmentCard}
              onPress={handleDownload}
              activeOpacity={0.8}
              disabled={downloading}
            >
              <View style={styles.attachmentLeft}>
                <View style={styles.attachmentIconBox}>
                  <FileText size={20} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.attachmentName}>{attachmentName}</Text>
                  <Text style={styles.attachmentSub}>{t('label_document_attached')}</Text>
                </View>
              </View>
              <View style={styles.attachmentDownload}>
                {downloading ? <ActivityIndicator size="small" color="#D97706" /> : <Download size={18} color="#D97706" />}
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noAttachment}>
              <CloudUpload size={28} color="#D1D5DB" />
              <Text style={styles.noAttachmentText}>{t('text_no_documents')}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.noAttachmentLink}>{t('label_add_document')}</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Supprimer — inline below attachment */}
          <TouchableOpacity
            style={styles.inlineDeleteBtn}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.7}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Trash2 size={16} color="#DC2626" />
                <Text style={styles.inlineDeleteText}>{t('alert_delete_quote')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Convert to invoice */}
          <TouchableOpacity
            style={[styles.convertBtn, converting && { opacity: 0.6 }]}
            onPress={handleConvertToInvoice}
            disabled={converting}
            activeOpacity={0.85}
          >
            {converting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <FileText size={18} color="#FFFFFF" />
                <Text style={styles.convertBtnText}>{t('button_convert_invoice')}</Text>
                <ArrowRight size={18} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
        )}

        {/* Footer */}
        <View style={styles.detailFooter}>
          <TouchableOpacity
            style={[styles.detailDownloadPdfBtn, downloadingPdf && { opacity: 0.5 }]}
            onPress={handleDownloadPdf}
            disabled={downloadingPdf}
            activeOpacity={0.8}
          >
            {downloadingPdf ? (
              <ActivityIndicator size="small" color="#D97706" />
            ) : (
              <>
                <Download size={16} color="#D97706" />
                <Text style={styles.detailDownloadPdfText}>PDF</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.detailShareBtn, sharing && { opacity: 0.5 }]}
            onPress={handleShare}
            disabled={sharing}
            activeOpacity={0.8}
          >
            {sharing ? (
              <ActivityIndicator size="small" color="#1E5BAC" />
            ) : (
              <>
                <Share2 size={16} color="#1E5BAC" />
                <Text style={styles.detailShareText}>{t('button_share')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailEditBtn} onPress={onEdit} activeOpacity={0.8}>
            <Edit size={16} color="#FFFFFF" />
            <Text style={styles.detailEditText}>{t('button_edit')}</Text>
          </TouchableOpacity>
        </View>

        {/* Status Picker Modal */}
        <Modal
          visible={showStatusPicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowStatusPicker(false)}
        >
          <TouchableOpacity
            style={styles.pickerOverlay}
            activeOpacity={1}
            onPress={() => setShowStatusPicker(false)}
          >
            <View style={styles.pickerSheet}>
              <Text style={styles.pickerSheetTitle}>{t('modal_title_change_status')}</Text>
              {STATUT_OPTIONS.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={styles.pickerOption}
                  onPress={() => handleStatusChange(s.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, currentStatus === s.key && styles.pickerOptionSelected]}>
                    {i18n.language.startsWith('fr') ? s.fr : s.en}
                  </Text>
                  {currentStatus === s.key && <Text style={styles.pickerCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

export default DetailModal;
