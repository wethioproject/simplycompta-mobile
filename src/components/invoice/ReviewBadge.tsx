import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { invoiceStyles as styles } from '../../styles/invoice.styles';
import { getReviewConfig } from '../../utils/badgeConfig';

interface ReviewBadgeProps {
  reviewStatus: string;
}

export const ReviewBadge: React.FC<ReviewBadgeProps> = ({ reviewStatus }) => {
  const { t } = useTranslation();
  const { badge, text } = getReviewConfig(reviewStatus, styles);
  const label =
    reviewStatus === 'PENDING'
      ? t('review_status_pending')
      : reviewStatus === 'APPROVED'
      ? t('review_status_approved')
      : t('review_status_rejected');

  return (
    <View style={[styles.badge, badge]}>
      <Text style={[styles.badgeText, text]}>{label}</Text>
    </View>
  );
};

export default ReviewBadge;
