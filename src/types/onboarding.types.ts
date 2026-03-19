import { ImageSourcePropType } from 'react-native';

export interface OnboardingSlideData {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  accentColor: string;
  screenshotSource?: ImageSourcePropType;
}
