import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  // Coordonnées card (rendered inline in the screen)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoTextBlock: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#1F2937' },

  // Delete button
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  deleteBtnText: { fontSize: 14, fontWeight: '600', color: '#DC2626' },
});
