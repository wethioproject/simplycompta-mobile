import { Platform, TextStyle } from 'react-native';


export const FontFamily = {
  regular: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',
    default: 'System',
  }) as string,
  display: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
    default: 'System',
  }) as string,
};


export const FontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
};


const base = (
  size: number,
  weight: TextStyle['fontWeight'],
  lineHeight?: number,
  display?: boolean,
): TextStyle => ({
  fontFamily: display ? FontFamily.display : FontFamily.regular,
  fontSize: size,
  fontWeight: weight,
  ...(lineHeight ? { lineHeight } : {}),
});


export const Typography = {
  titleBold: base(20, FontWeight.bold, 28, true),
  titleSemiBold: base(18, FontWeight.semiBold, 26, true),
  headingSemiBold: base(16, FontWeight.semiBold, 24),
  subtitle: base(14, FontWeight.medium, 20),
  body: base(14, FontWeight.regular, 20),
  bodySmall: base(13, FontWeight.regular, 18),
  caption: base(12, FontWeight.regular, 16),
  captionSemiBold: base(12, FontWeight.semiBold, 16),
  kpi: base(22, FontWeight.bold, 28, true),
  kpiMedium: base(18, FontWeight.bold, 24, true),
  kpiSmall: base(15, FontWeight.bold, 20, true),
  label: base(13, FontWeight.semiBold, 18),
  button: base(15, FontWeight.semiBold, 20),
  buttonSmall: base(13, FontWeight.semiBold, 18),
} satisfies Record<string, TextStyle>;


export default Typography;
