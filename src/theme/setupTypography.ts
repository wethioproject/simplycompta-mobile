import { Text, TextInput, Platform } from 'react-native';
import { FontFamily } from './typography';

export function setupTypography(): void {
  const T = Text as any;
  if (!T.defaultProps) T.defaultProps = {};
  T.defaultProps.style = {
    fontFamily: FontFamily.regular,
    allowFontScaling: true,
    maxFontSizeMultiplier: 1.3,
  };

  const TI = TextInput as any;
  if (!TI.defaultProps) TI.defaultProps = {};
  TI.defaultProps.style = {
    fontFamily: FontFamily.regular,
  };
  TI.defaultProps.autoCorrect    = TI.defaultProps.autoCorrect    ?? false;
  TI.defaultProps.autoCapitalize = TI.defaultProps.autoCapitalize ?? 'sentences';
  if (Platform.OS === 'android') {
    TI.defaultProps.underlineColorAndroid =
      TI.defaultProps.underlineColorAndroid ?? 'transparent';
  }
}
