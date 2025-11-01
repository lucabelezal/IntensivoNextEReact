import { useState } from 'react';
import type { ToastType } from '../components/Toast';

interface ToastState {
  message: string;
  type: ToastType;
  isVisible: boolean;
  position?: 'top' | 'bottom';
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    isVisible: false,
    position: 'bottom',
  });

  const showToast = (message: string, type: ToastType = 'info', position: 'top' | 'bottom' = 'bottom') => {
    setToast({ message, type, isVisible: true, position });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const toastActions = {
    success: (message: string, position?: 'top' | 'bottom') => showToast(message, 'success', position),
    error: (message: string, position?: 'top' | 'bottom') => showToast(message, 'error', position),
    warning: (message: string, position?: 'top' | 'bottom') => showToast(message, 'warning', position),
    info: (message: string, position?: 'top' | 'bottom') => showToast(message, 'info', position),
  };

  return {
    toast,
    hideToast,
    ...toastActions,
  };
}
