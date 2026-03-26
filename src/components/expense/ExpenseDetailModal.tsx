import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Share,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, FileText, Download, CloudUpload, Trash2, Upload } from 'lucide-react-native';
import { ExpenseItem } from '../../types/expense.types';
import { formatDate, formatCurrency } from '../../utils/expense.helpers';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';

interface ExpenseDetailModalProps {
  item: ExpenseItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  item,
  onClose,
  onDelete,
  onEdit,
}) => {
  const token = useSelector((state: any) => state.user.token);
  const { t, i18n } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const formattedDate = formatDate(item.date);

  const handleDelete = () => {
    Alert.alert(
      t('alert_delete_expense'),
      t('message_confirm_delete_expense'),
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
    if (!item.file_url) return;
    setDownloading(true);
    try {
      const { fs, config } = ReactNativeBlobUtil;
      const filePath = `${fs.dirs.CacheDir}/expense_${item.id}`;

      const res = await config({ fileCache: true, path: filePath }).fetch(
        'GET',
        item.file_url,
        {
          Authorization: `Bearer ${token}`,
          Accept: 'application/octet-stream',
        }
      );

      const headers = res.respInfo.headers;
      const mime = (
        headers['Content-Type'] ||
        headers['content-type'] ||
        'application/pdf'
      )
        .split(';')[0];

      const extensionMap: Record<string, string> = {
        'application/pdf': 'pdf',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/jpg': 'jpg',
      };
      const ext = extensionMap[mime] || 'pdf';
      const finalPath = `${res.path()}.${ext}`;

      if (await fs.exists(finalPath)) await fs.unlink(finalPath);
      await fs.mv(res.path(), finalPath);

      if (Platform.OS === 'ios') {
        await Share.share({ url: `file://${finalPath}` });
      } else {
        await ReactNativeBlobUtil.android.actionViewIntent(finalPath, mime);
      }
    } catch {
      Alert.alert(t('error_title'), t('error_document_unavailable'));
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer} edges={['top']}>
        {/* Header */}
        <View style={styles.detailModalHeader}>
          <Text style={styles.detailModalTitle}>{t('title_expense_details')}</Text>
          <TouchableOpacity onPress={onClose} style={styles.detailCloseBtn} activeOpacity={0.7}>
            <X size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Hero */}
          <View style={styles.detailHero}>
            <View style={styles.badgeRedLg}>
              <Text style={styles.badgeRedLgText}>{t('label_expense')}</Text>
            </View>
            <Text style={styles.detailAmount}>{formatCurrency(item.total_ttc)}</Text>
            <Text style={styles.detailDate}>{formattedDate}</Text>
          </View>

          {/* Info rows */}
          <View style={styles.detailCard}>
            {[
              { label: t('label_category'), value: item.category.name },
              { label: t('label_payment_method'), value: resolvePaymentMethod(item.payment_method, i18n.language) },
            ].map(row => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={styles.detailRowLabel}>{row.label}</Text>
                <Text style={styles.detailRowValue}>{row.value ?? '—'}</Text>
              </View>
            ))}
          </View>

          {/* Attachment */}
          {item.file ? (
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
                  {(() => {
                    const rawName = item.file.split('/').pop() || 'Document';
                    const displayName =
                      rawName.length > 24 ? `${rawName.slice(0, 24)}...` : rawName;
                    return (
                      <>
                        <Text style={styles.attachmentName}>{displayName}</Text>
                        <Text style={styles.attachmentSub}>{t('text_tap_to_download')}</Text>
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
              <Text style={styles.noAttachmentText}>{t('text_no_documents')}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.noAttachmentLink}>{t('label_add_document')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Footer actions */}
        <View style={styles.detailFooter}>
          <TouchableOpacity
            style={styles.detailDeleteBtn}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : (
              <>
                <Trash2 size={16} color="#DC2626" />
                <Text style={styles.detailDeleteText}>{t('button_delete')}</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.detailEditBtn} onPress={onEdit} activeOpacity={0.8}>
            <Upload size={16} color="#FFFFFF" />
            <Text style={styles.detailEditText}>{t('button_edit')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ExpenseDetailModal;
