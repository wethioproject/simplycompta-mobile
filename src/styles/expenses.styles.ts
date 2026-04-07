import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTop: { alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logo: { height: 48, width: 160 },
  titleText: { fontSize: 20, fontWeight: '700', color: '#111827' },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20,
  },
  exportBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Filters
  filtersRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFFFFF', borderRadius: 10,
    paddingHorizontal: 16, paddingVertical: 9,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  filterBtnActive: { backgroundColor: '#1E5BAC', borderColor: '#1E5BAC' },
  filterBtnText: { fontSize: 13, fontWeight: '600', color: '#374151' },
  filterBtnTextActive: { color: '#FFFFFF' },
  dropdown: {
    position: 'absolute', top: 44, left: 0, zIndex: 50,
    backgroundColor: '#FFFFFF', borderRadius: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
    minWidth: 160, borderWidth: 1, borderColor: '#F3F4F6',
    paddingVertical: 4, maxHeight: 300,
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
    backgroundColor: '#FFFFFF', borderRadius: 20,
    padding: 16, flexDirection: 'row',
    alignItems: 'flex-start', justifyContent: 'space-between',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  expenseCardLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, flex: 1 },
  expenseIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FCE7F3',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  expenseIconText: { fontSize: 24, color: '#DB2777', fontWeight: '300', lineHeight: 28 },
  expenseDesc: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 4 },
  expenseMeta: { fontSize: 13, color: '#6B7280' },
  expenseAmount: { fontSize: 17, fontWeight: '700', color: '#DC2626' },

  // Expense Alert Card
  expenseAlertCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFBEB', borderRadius: 20, padding: 16,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  expenseAlertLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  expenseAlertIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F59E0B',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  expenseAlertText: { fontSize: 14, fontWeight: '600', color: '#111827', flex: 1, marginRight: 12 },
  expenseAlertBtn: {
    backgroundColor: '#1E5BAC', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 9,
  },
  expenseAlertBtnText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },

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

  // Attachment preview card
  attachmentPreview: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F0F4FF', borderRadius: 12,
    borderWidth: 1, borderColor: '#C7D2FE',
    padding: 10, gap: 10,
  },
  attachmentThumbWrapper: {
    width: 56, height: 56, borderRadius: 8,
    overflow: 'hidden', flexShrink: 0,
  },
  attachmentThumb: { width: 56, height: 56 },
  attachmentThumbOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center', alignItems: 'center',
  },
  attachmentFileIconBox: {
    width: 56, height: 56, borderRadius: 8,
    backgroundColor: '#E0E7FF',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  attachmentInfo: { flex: 1 },
  attachmentFileName: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
  attachmentFileMeta: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  attachmentRemoveBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },

  // Full-screen image preview
  imagePreviewOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center', alignItems: 'center',
  },
  imagePreviewClose: {
    position: 'absolute', top: 56, right: 20,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  imagePreviewFull: { width: '100%', height: '80%' },

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
  pickerSheetTitleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 12, paddingBottom: 8, marginBottom: 4,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  pickerSheetTitleText: { fontSize: 14, fontWeight: '700', color: '#374151' },
  pickerSheetAddBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center', alignItems: 'center',
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
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  datePickerSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  datePickerTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  datePickerCancel: { fontSize: 15, fontWeight: '500', color: '#6B7280' },
  datePickerOk: { fontSize: 15, fontWeight: '700', color: '#1E5BAC' },

  // Validation error
  fieldError: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 3,
    fontWeight: '500',
  },
  fieldInputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
  },

  // Disabled confirm buttons
  modalConfirmBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  confirmBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
    elevation: 0,
  },

  // Supplier search inside picker
  pickerSheetAddBtnActive: {
    backgroundColor: '#1E5BAC',
  },
  supplierSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginHorizontal: 8,
    marginBottom: 8,
  },
  supplierSearchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },

  // Pie chart
  pieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pieTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  pieLoader: { height: 180, justifyContent: 'center', alignItems: 'center' },
  pieEmpty: { height: 100, justifyContent: 'center', alignItems: 'center' },
  pieEmptyText: { fontSize: 13, color: '#9CA3AF' },
  pieChartRow: { alignItems: 'center', marginBottom: 20 },
  pieCenterValue: { fontSize: 16, fontWeight: '700', color: '#1F2937', textAlign: 'center' },
  pieCenterLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  pieLegend: { gap: 10 },
  pieLegendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pieLegendDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  pieLegendLabel: { flex: 1, fontSize: 13, color: '#374151' },
  pieLegendPct: { fontSize: 13, fontWeight: '600', color: '#1F2937' },
});
