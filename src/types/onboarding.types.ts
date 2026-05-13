import { ImageSourcePropType } from 'react-native';

export interface OnboardingSlideData {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  accentColor: string;
  screenshotSource?: ImageSourcePropType;
}

export type ChecklistStatus = 'completed' | 'pending';

export interface ChecklistItemAPI {
    id: string;
    status: ChecklistStatus;
}

export interface ChecklistItem {
  id: string;
  titleKey: string;
  subtitleKey: string;
  status: ChecklistStatus;
  targetScreen?: string;
  targetParams?: Record<string, unknown>;
  iconName: 'Building2' | 'User' | 'FileText' | 'Users' | 'Receipt';
}

export interface OnboardingChecklistState {
  showChecklist: boolean;
  hasSeenChecklist: boolean | null;
  checklistItems: ChecklistItem[];
  dismissedInSession: boolean;
}
