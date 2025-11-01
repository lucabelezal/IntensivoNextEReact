import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'top' | 'bottom';
}

export function Toast({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 4000,
  position = 'bottom',
}: ToastProps) {
  // controla se o componente está montado para permitir animação de saída
  const [mounted, setMounted] = useState(isVisible);
  // indica que estamos em fase de animação de saída
  const [exiting, setExiting] = useState(false);

  // duração da animação (deve estar sincronizada com Toast.module.css)
  const ANIM_DURATION = 320; // ms

  // efeito para montar/desmontar com animação
  useEffect(() => {
    let autoHideTimer: ReturnType<typeof setTimeout> | undefined;
    let unmountTimer: ReturnType<typeof setTimeout> | undefined;

    if (isVisible) {
      // quando for visível, garante montado e cancela saída
      setMounted(true);
      setExiting(false);
      // inicia o auto-hide que chama onClose após 'duration' ms
      if (duration > 0) autoHideTimer = setTimeout(() => onClose(), duration);
    } else if (mounted) {
      // iniciar animação de saída e desmontar após ANIM_DURATION
      setExiting(true);
      unmountTimer = setTimeout(() => setMounted(false), ANIM_DURATION);
    }

    return () => {
      if (autoHideTimer) clearTimeout(autoHideTimer);
      if (unmountTimer) clearTimeout(unmountTimer);
    };
  }, [isVisible, duration, onClose, mounted]);

  // Se não está montado, não renderiza nada
  if (!mounted) return null;

  const typeClass = {
    success: styles.success,
    error: styles.error,
    warning: styles.warning,
    info: styles.info,
  }[type];

  // classes para entrada/saída
  const animationClass = exiting ? (position === 'top' ? styles.exitTop : styles.exit) : (position === 'top' ? styles.enterTop : styles.enter);
  const wrapperClass = position === 'top' ? styles.wrapperTop : styles.wrapper;

  return (
    <div className={wrapperClass}>
      <div className={`${styles.toast} ${typeClass} ${animationClass}`} role="status">
        <div className={styles.content}>
          <span>{message}</span>
          <button onClick={onClose} aria-label="Fechar aviso" className={styles.close}>
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
