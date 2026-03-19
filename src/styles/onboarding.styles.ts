import { StyleSheet } from 'react-native';

export const onboardingStyles = StyleSheet.create({
  /* ── Container ───────────────────────── */
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* ── Skip button ─────────────────────── */
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },

  /* ── FlatList ────────────────────────── */
  flatList: {
    flex: 1,
  },

  /* ── Single slide ────────────────────── */
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  phoneContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  phoneFrame: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  screenshot: {
    width: '100%',
    height: '100%',
  },
  screenshotPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 8,
  },

  /* ── Bottom section ──────────────────── */
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },

  /* ── Pagination dots ─────────────────── */
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: '#1E5BAC',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },

  /* ── CTA button ──────────────────────── */
  ctaButton: {
    width: '100%',
    backgroundColor: '#1E5BAC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
