// ─── Status & Review Badge Styles Config ──────────────────────────────────

import { StyleProp, ViewStyle, TextStyle } from 'react-native';

interface BadgeConfig {
  badge: StyleProp<ViewStyle>;
  text: StyleProp<TextStyle>;
}

// Note: These reference the styles object from invoice.styles.ts
// Import this file and use in conjunction with the imported styles

export const getStatusConfig = (status: string, styles: any): BadgeConfig => {
  switch (status) {
    case 'Payé':
      return { badge: styles.badgeGreen, text: styles.badgeTextGreen };
    case 'Annulé':
      return { badge: styles.badgeRed, text: styles.badgeTextRed };
    case 'Issued':
      return { badge: styles.badgeBlue, text: styles.badgeTextBlue };
    default:
      return { badge: styles.badgeOrange, text: styles.badgeTextOrange };
  }
};

export const getReviewConfig = (reviewStatus: string, styles: any): BadgeConfig => {
  switch (reviewStatus) {
    case 'APPROVED':
      return { badge: styles.badgeGreen, text: styles.badgeTextGreen };
    case 'REJECTED':
      return { badge: styles.badgeRed, text: styles.badgeTextRed };
    default:
      // PENDING
      return { badge: styles.badgeOrange, text: styles.badgeTextOrange };
  }
};
