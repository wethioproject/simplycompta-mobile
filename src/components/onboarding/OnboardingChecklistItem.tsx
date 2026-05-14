import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  User,
  FileText,
  Users,
  Receipt,
  Check,
  ChevronRight,
} from 'lucide-react-native';
import { ChecklistItem } from '../../types/onboarding.types';
import { PremiumTouchable } from '../common/PremiumMotion';

const ICON_MAP = {
  Building2,
  User,
  FileText,
  Users,
  Receipt,
} as const;

interface OnboardingChecklistItemProps {
  item: ChecklistItem;
  onPress: (item: ChecklistItem) => void;
}

const OnboardingChecklistItem: React.FC<OnboardingChecklistItemProps> = ({ item, onPress }) => {
  const { t } = useTranslation();
  const isCompleted = item.status === 'completed';
  const IconComponent = ICON_MAP[item.iconName];
  const title = t(item.titleKey);
  const subtitle = t(item.subtitleKey);

  return (
    <PremiumTouchable
      style={[styles.row, isCompleted && styles.rowCompleted]}
      onPress={() => !isCompleted && onPress(item)}
      activeOpacity={isCompleted ? 1 : 0.7}
      haptic={!isCompleted}
    >
      {/* Icon container */}
      <View style={[styles.iconBox, isCompleted ? styles.iconBoxDone : styles.iconBoxPending]}>
        {isCompleted ? (
          <Check size={18} color="#FFFFFF" strokeWidth={2.5} />
        ) : (
          <IconComponent size={18} color="#9CA3AF" />
        )}
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text style={[styles.title, isCompleted && styles.titleDone]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      </View>

      {/* Right indicator */}
      {isCompleted ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('checklist_badge_completed')}</Text>
        </View>
      ) : (
        <View style={styles.chevronBox}>
          <ChevronRight size={16} color="#1E5BAC" />
        </View>
      )}
    </PremiumTouchable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    gap: 12,
  },
  rowCompleted: {
    backgroundColor: '#F0FDF4',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBoxDone: {
    backgroundColor: '#16A34A',
  },
  iconBoxPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  titleDone: {
    color: '#6B7280',
  },
  subtitle: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  badge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#16A34A',
  },
  chevronBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});

export default OnboardingChecklistItem;
