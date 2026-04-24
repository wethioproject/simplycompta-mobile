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
  Upload,
  Share2,
  ChevronDown,
  FileText,
  Copy,
} from 'lucide-react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import RNShare from 'react-native-share';
import { useInvoice } from '../../hooks/useInvoice';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import type { InvoiceItem } from '../../types/invoice.types';
import { STATUT_OPTIONS_DETAIL_MODAL, resolvePaymentMethod } from '../../types/invoice.types';

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
  const { t, i18n } = useTranslation();
  const token = useSelector((state: any) => state.user.token);
  const { getPdfDownloadUrl, duplicateInvoice, getInvoice } = useInvoice();

  // ── Fetched detail state ──────────────────────────────────────────
  const [detail, setDetail] = useState<any>(null);
  const [totals, setTotals] = useState<{ total_ht: number; total_discount: number; total_tva: number; total_ttc: number } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      const result = await getInvoice(item.id);
      if (!cancelled) {
        if (result.success && result.invoice) {
          setDetail(result.invoice);
          setTotals(result.totals ?? null);
        } else {
          // fall back to list data
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
  const [duplicating, setDuplicating] = useState(false);

  // Keep currentStatus in sync if detail loads a different status
  useEffect(() => {
    if (detail?.status) setCurrentStatus(detail.status);
  }, [detail?.status]);

  const handleStatusChange = async (newStatus: string) => {
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
        invoice_number: src.invoice_number ?? item.invoice_number,
        payment_method: src.payment_method ?? item.payment_method,
        status: newStatus,
        notes: (src.notes && src.notes !== 'null') ? src.notes : null,
        document: null,
        articles: (src.articles ?? item.articles).map((a: any) => ({
          designation: a.designation,
          unit_price_ht: parseFloat(a.unit_price_ht),
          quantity: a.quantity,
          total_price_ht: parseFloat(a.total_price_ht),
          tva_percentage: parseFloat(a.tva_percentage),
          product_id: a.product_id,
          unit_id: a.unit_id ?? null,
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
      t('message_confirm_delete').replace('{invoice_number}', src.invoice_number ?? item.invoice_number),
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
    if (!src.invoice_url) return;

    setDownloading(true);

    try {
      const { fs, config } = ReactNativeBlobUtil;
      const filePath = `${fs.dirs.CacheDir}/invoice_${item.id}`;

      const res = await config({
        fileCache: true,
        path: filePath,
      }).fetch('GET', src.invoice_url, {
        Authorization: `Bearer ${token}`,
        Accept: 'application/octet-stream',
      });

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
      const safeNumber = (src.invoice_number ?? item.invoice_number).replace(/[^a-zA-Z0-9]/g, '_');
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

      const subject = t('subject_share_invoice').replace('{invoice_number}', src.invoice_number ?? item.invoice_number);
      const message = t('message_share_invoice').replace('{invoice_number}', src.invoice_number ?? item.invoice_number);

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
      const { fs, config } = ReactNativeBlobUtil;
      const safeNumber = (src.invoice_number ?? item.invoice_number).replace(/[^a-zA-Z0-9]/g, '_');
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

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <Text style={styles.detailModalTitle}>{t('title_invoice_details')}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={async () => {
                setDuplicating(true);
                try {
                  const result = await duplicateInvoice(item.id);
                  if (result.success) {
                    Alert.alert(t('success_title'), t('success_invoice_duplicated'));
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
            <ActivityIndicator size="large" color="#1E5BAC" />
          </View>
        ) : (
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
                  <Text>{currentStatus}</Text>
                  <ChevronDown size={14} color="#6B7280" style={{ marginLeft: 4 }} />
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.detailAmount}>
              {(totals?.total_ttc ?? 0).toLocaleString('fr-FR')} MAD
            </Text>
            <Text style={styles.detailDate}>{formattedDate}</Text>
          </View>

          {/* Detail rows */}
          <View style={styles.detailCard}>
            {[
              { label: t('label_invoice_number'), value: src.invoice_number },
              { label: t('label_client'), value: src.client?.client_name ?? '—' },
              { label: t('label_payment_method'), value: resolvePaymentMethod(src.payment_method, i18n.language) },
              { label: t('label_due_date'), value: src.due_date ? new Date(src.due_date).toLocaleDateString('fr-FR') : '—' },
              { label: t('label_status'), value: currentStatus },
              { label: t('label_total_ht'),       value: `${(totals?.total_ht ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: t('label_discount'),        value: `${(totals?.total_discount ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: t('label_total_tva'),       value: `${(totals?.total_tva ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: t('label_total_ttc'),       value: `${(totals?.total_ttc ?? 0).toLocaleString('fr-FR')} MAD` },
              { label: t('label_notes'), value: (src.notes && src.notes !== 'null') ? src.notes : '-' },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{row.label}</Text>
                <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
              </View>
            ))}
          </View>

          {/* Articles */}
          {(src.articles ?? []).length > 0 && (
            <View style={styles.detailCard}>
              <View style={[styles.detailRow, { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
                <Text style={[styles.detailRowLabel, { fontWeight: '700', color: '#1F2937' }]}>
                  {t('label_articles')}
                </Text>
              </View>
              {(src.articles ?? []).map((a: any) => (
                <View key={a.id} style={styles.detailRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.detailRowLabel, { fontWeight: '600', color: '#1F2937' }]}>
                      {a.designation}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                      {a.quantity} × {parseFloat(a.unit_price_ht).toLocaleString('fr-FR')} MAD HT
                      {' '}•{'  TVA '}{a.tax.rate}%
                      {parseFloat(a.discount ?? '0') > 0 ? `  •  ${t('label_discount')} ${parseFloat(a.discount).toLocaleString('fr-FR')} MAD` : ''}
                    </Text>
                  </View>
                  <Text style={styles.detailRowValue}>{parseFloat(a.total_ttc).toLocaleString('fr-FR')} MAD</Text>
                </View>
              ))}
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
                  <FileText size={20} color="#1E5BAC" />
                </View>
                <View>
                  <Text style={styles.attachmentName}>{attachmentName}</Text>
                  <Text style={styles.attachmentSub}>{t('label_document_attached')}</Text>
                </View>
              </View>
              <View style={styles.attachmentDownload}>
                {downloading ? <ActivityIndicator size="small" color="#1E5BAC" /> : <Download size={18} color="#1E5BAC" />}
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
                <Text style={styles.inlineDeleteText}>{t('alert_delete_invoice')}</Text>
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
              <ActivityIndicator size="small" color="#16A34A" />
            ) : (
              <>
                <Download size={16} color="#16A34A" />
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
            <Upload size={16} color="#FFFFFF" />
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
              {STATUT_OPTIONS_DETAIL_MODAL.map(s => (
                <TouchableOpacity
                  key={s.key}
                  style={styles.pickerOption}
                  onPress={() => handleStatusChange(s.key)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, currentStatus === s.key && styles.pickerOptionSelected]}>
                    {resolveStatus(s.key, i18n.language)}
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
