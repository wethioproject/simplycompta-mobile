import Toast from 'react-native-toast-message';

type ToastKind = 'success' | 'error' | 'info';

export const showPremiumToast = (
  type: ToastKind,
  title: string,
  message?: string,
) => {
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: type === 'error' ? 4200 : 2600,
    topOffset: 54,
  });
};
