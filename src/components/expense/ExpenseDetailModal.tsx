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
import {
  ChevronLeft, ChevronRight, Copy, Trash2, Edit2, Share2,
  FileText, Download, Paperclip, Plus,
  Calendar, Folder, CreditCard, User, Hash, Minus,
} from 'lucide-react-native';
import { ExpenseItem } from '../../types/expense.types';
import { formatDate, formatCurrency } from '../../utils/expense.helpers';
import { resolvePaymentMethod } from '../../types/invoice.types';
import { styles } from '../../styles/expenses.styles';

interface ExpenseDetailModalProps {
  item: ExpenseItem;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onEdit: () => void;
  onDuplicate: (id: number) => Promise<void>;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  item,
  onClose,
  onDelete,
  onEdit,
  onDuplicate,
}) => {
  const token = useSelector((state: any) => state.user.token);
  const { t, i18n } = useTranslation();
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

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

  const detailRows = [
    {
      icon: <FileText size={18} color="#4F6EF7" />,
      iconBg: '#EEF2FF',
      label: t('label_category'),
      value: item.category?.name ?? '—',
    },
    {
      icon: <Calendar size={18} color="#D97706" />,
      iconBg: '#FEF3C7',
      label: t('label_date'),
      value: formattedDate,
    },
    {
      icon: <Folder size={18} color="#EA580C" />,
      iconBg: '#FFEDD5',
      label: t('label_category'),
      value: item.category?.name ?? '—',
    },
    {
      icon: <CreditCard size={18} color="#4F6EF7" />,
      iconBg: '#EEF2FF',
      label: t('label_payment_method'),
      value: resolvePaymentMethod(item.payment_method, i18n.language) ?? '—',
    },
    {
      icon: <Hash size={18} color="#4F6EF7" />,
      iconBg: '#EEF2FF',
      label: t('label_reference'),
      value: 'N/A',
    },
    {
      icon: <FileText size={18} color="#4F6EF7" />,
      iconBg: '#EEF2FF',
      label: t('label_notes'),
      value: item.notes ?? 'N/A',
    },
  ];

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
          <TouchableOpacity onPress={onClose} style={styles.detailHeaderBack} activeOpacity={0.7}>
            <ChevronLeft size={22} color="#1F2937" />
            <Text style={styles.detailModalTitle}>{t('label_expense')}</Text>
          </TouchableOpacity>
          <View style={styles.detailHeaderActions}>
            <TouchableOpacity
              style={styles.detailHeaderBtn}
              activeOpacity={0.7}
              disabled={duplicating}
              onPress={async () => {
                setDuplicating(true);
                try {
                  await onDuplicate(item.id);
                  Alert.alert(t('success_title'), t('success_expense_duplicated'));
                } finally {
                  setDuplicating(false);
                }
              }}
            >
              {duplicating
                ? <ActivityIndicator size="small" color="#6B7280" />
                : <Copy size={18} color="#6B7280" />}
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailHeaderBtn} activeOpacity={0.7}
              onPress={() => Share.share({ message: `${item.category?.name} — ${formatCurrency(item.total_ttc)}` })}>
              <Share2 size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.detailHeaderBtn, styles.detailHeaderBtnPrimary]} onPress={onEdit} activeOpacity={0.7}>
              <Edit2 size={18} color="#1E5BAC" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
          {/* Amount Hero */}
          <View style={styles.detailAmountSection}>
            <View style={styles.detailExpenseIconCircle}>
              <Minus size={24} color="#EC4899" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailExpenseCategoryName}>{item.category?.name ?? '—'}</Text>
              <Text style={styles.detailDate}>{formattedDate}</Text>
            </View>
            <Text style={styles.detailAmount}>-{formatCurrency(item.total_ttc)}</Text>
          </View>

          {/* Details Card */}
          <Text style={styles.detailSectionTitle}>{t('title_expense_details')}</Text>
          <View style={styles.detailCard}>
            {detailRows.map((row, index) => (
              <View
                key={index}
                style={[styles.detailRow, index === detailRows.length - 1 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.detailRowLeft}>
                  <View style={[styles.detailRowIconBox, { backgroundColor: row.iconBg }]}>
                    {row.icon}
                  </View>
                  <Text style={styles.detailRowLabel}>{row.label}</Text>
                </View>
                <View style={styles.detailRowRight}>
                  <Text style={styles.detailRowValue} numberOfLines={1}>{row.value}</Text>
                  <ChevronRight size={16} color="#D1D5DB" />
                </View>
              </View>
            ))}
          </View>

          {/* Attachments */}
          <View style={styles.detailAttachSection}>
            <View style={styles.detailAttachHeader}>
              <Paperclip size={16} color="#6B7280" />
              <Text style={styles.detailAttachTitle}>{t('label_attachments')}</Text>
            </View>
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
                      const displayName = rawName.length > 24 ? `${rawName.slice(0, 24)}...` : rawName;
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
                  {downloading
                    ? <ActivityIndicator size="small" color="#1E5BAC" />
                    : <Download size={18} color="#1E5BAC" />}
                </View>
              </TouchableOpacity>
            ) : (
              <>
              <View style={styles.noAttachment}>
                <Text style={styles.noAttachmentText}>{t('text_no_documents')}</Text>
              </View>
              <TouchableOpacity style={styles.attachAddBtn} activeOpacity={0.8} onPress={onEdit}>
              <View style={styles.attachAddIcon}>
                <Plus size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.attachAddText}>{t('label_add_document')}</Text>
            </TouchableOpacity>
              </>
            )}
            {/* <TouchableOpacity style={styles.attachAddBtn} activeOpacity={0.8}>
              <View style={styles.attachAddIcon}>
                <Plus size={16} color="#FFFFFF" />
              </View>
              <Text style={styles.attachAddText}>{t('label_add_document')}</Text>
            </TouchableOpacity> */}
          </View>
        </ScrollView>

        {/* Footer delete button */}
        <View style={styles.detailFooter}>
          <TouchableOpacity
            style={styles.detailDeleteBtn}
            onPress={handleDelete}
            disabled={deleting}
            activeOpacity={0.8}
          >
            {deleting
              ? <ActivityIndicator size="small" color="#DC2626" />
              : <>
                  <Trash2 size={16} color="#DC2626" />
                  <Text style={styles.detailDeleteText}>{t('button_delete')}</Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ExpenseDetailModal;
