declare module 'react-native-toast-message' {
  interface ToastConfig {
    type?: 'success' | 'error' | 'info' | 'warning';
    text1?: string;
    text2?: string;
    position?: 'top' | 'bottom';
    visibilityTime?: number;
    autoHide?: boolean;
    topOffset?: number;
    bottomOffset?: number;
    onShow?: () => void;
    onHide?: () => void;
  }

  interface Toast {
    show(config: ToastConfig): void;
    hide(): void;
  }

  const toast: Toast;
  export default toast;
}





