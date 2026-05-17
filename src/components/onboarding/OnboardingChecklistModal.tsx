import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaInsetsContext } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { X, ArrowRight, Sparkles } from 'lucide-react-native';
import { RootState, AppDispatch } from '../../store';
import { hideChecklist, hideChecklistForNavigation } from '../../store/slices/onboardingSlice';
import { ChecklistItem } from '../../types/onboarding.types';
import { navigationRef } from '../../navigation/navigationRef';
import OnboardingProgressBar from './OnboardingProgressBar';
import OnboardingChecklistItem from './OnboardingChecklistItem';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnboardingChecklistModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const showChecklist = useSelector((state: RootState) => state.onboarding.showChecklist);
  const items = useSelector((state: RootState) => state.onboarding.checklistItems);

  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const completedCount = items.filter(i => i.status === 'completed').length;
  const pendingCount = items.length - completedCount;
  const nextPending = items.find(i => i.status === 'pending');

  // Slide up when visible, slide down on hide
  useEffect(() => {
    if (showChecklist) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 28,
          stiffness: 280,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showChecklist]);



  const handleClose = () => {
    dispatch(hideChecklist());
  };

  const handleLater = () => {
    dispatch(hideChecklist());
  };

  const handleItemPress = (item: ChecklistItem) => {
    dispatch(hideChecklistForNavigation());
    if (item.targetScreen && navigationRef.isReady()) {
      (navigationRef as any).navigate(item.targetScreen, item.targetParams ?? {});
    }
  };

  const handleContinue = () => {
    const firstPending = items.find(i => i.status === 'pending');
    if (firstPending) {
      handleItemPress(firstPending);
    } else {
      handleClose();
    }
  };

  if (!showChecklist) return null;

  return (
    <Modal
      visible={showChecklist}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleLater}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={handleLater} />
      </Animated.View>

      {/* Sheet */}
      <SafeAreaInsetsContext.Consumer>
        {(insets) => (
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: (insets?.bottom ?? 0) + 16, transform: [{ translateY }] },
          ]}
        >
        {/* Handle bar */}
        <View style={styles.handleBar} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('checklist_header_title')}</Text>
            <Text style={styles.headerSubtitle}>
              {t('checklist_header_subtitle')}
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={handleClose} activeOpacity={0.7}>
            <X size={18} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Setup badge */}
        <View style={styles.badgeRow}>
          <View style={styles.setupBadge}>
            <Sparkles size={12} color="#1E5BAC" />
            <Text style={styles.setupBadgeText}>Setup</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <OnboardingProgressBar completed={completedCount} total={items.length} />
        </View>

        {nextPending && (
          <TouchableOpacity
            style={styles.nextStepCard}
            onPress={() => handleItemPress(nextPending)}
            activeOpacity={0.82}
          >
            <View style={styles.nextStepIcon}>
              <Sparkles size={15} color="#1E5BAC" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.nextStepLabel}>{t('checklist_next_step_label')}</Text>
              <Text style={styles.nextStepTitle} numberOfLines={1}>{t(nextPending.titleKey)}</Text>
            </View>
            <ArrowRight size={16} color="#1E5BAC" />
          </TouchableOpacity>
        )}

        {/* Checklist */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {items.map(item => (
            <OnboardingChecklistItem key={item.id} item={item} onPress={handleItemPress} />
          ))}
        </ScrollView>

        {/* Footer */}
        {pendingCount > 0 && (
          <View style={styles.footer}>
            <Text style={styles.footerHint}>
              {t('checklist_footer_hint', { count: pendingCount })}
            </Text>
          </View>
        )}

        {/* CTAs */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.primaryBtnText}>{t('checklist_cta_continue')}</Text>
            <ArrowRight size={16} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleLater} activeOpacity={0.75}>
            <Text style={styles.secondaryBtnText}>{t('checklist_cta_later')}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
        )}
      </SafeAreaInsetsContext.Consumer>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: SCREEN_HEIGHT * 0.88,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 20,
  },
  handleBar: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 99,
    backgroundColor: '#D1D5DB',
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  headerSubtitleBold: {
    fontWeight: '600',
    color: '#374151',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeRow: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  setupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  setupBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1E5BAC',
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  nextStepCard: {
    marginHorizontal: 20,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nextStepIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E5BAC',
    textTransform: 'uppercase',
  },
  nextStepTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  list: {
    paddingHorizontal: 12,
    maxHeight: SCREEN_HEIGHT * 0.36,
  },
  footer: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  footerHint: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  footerHintBold: {
    fontWeight: '600',
    color: '#374151',
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 10,
  },
  primaryBtn: {
    height: 50,
    backgroundColor: '#1E5BAC',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#1E5BAC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
});

export default OnboardingChecklistModal;
