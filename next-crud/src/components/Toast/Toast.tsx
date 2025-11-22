/**
 * Toast Component - Refatorado
 * 
 * Agora é um componente "burro" (presentational) que recebe props.
 * A lógica de estado ficou no Context.
 */

import { useEffect, useState, memo } from 'react';
import styles from './Toast.module.css';
import { ToastType, ToastPosition } from '@/contexts/ToastContext';

// ============================================
// TYPES
// ============================================

interface ToastProps {
    message: string;
    type: ToastType;
    position: ToastPosition;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

// ============================================
// COMPONENT
// ============================================

/**
 * Toast presentational component
 * Memoizado para evitar re-renders desnecessários
 */
export const Toast = memo(function Toast({
    message,
    type,
    position,
    isVisible,
    onClose,
    duration = 4000,
}: ToastProps) {
    const [mounted, setMounted] = useState(isVisible);
    const [exiting, setExiting] = useState(false);

    const ANIM_DURATION = 320;

    useEffect(() => {
        let autoHideTimer: ReturnType<typeof setTimeout> | undefined;
        let unmountTimer: ReturnType<typeof setTimeout> | undefined;

        if (isVisible) {
            setMounted(true);
            setExiting(false);

            if (duration > 0) {
                autoHideTimer = setTimeout(() => onClose(), duration);
            }
        } else if (mounted) {
            setExiting(true);
            unmountTimer = setTimeout(() => setMounted(false), ANIM_DURATION);
        }

        return () => {
            if (autoHideTimer) clearTimeout(autoHideTimer);
            if (unmountTimer) clearTimeout(unmountTimer);
        };
    }, [isVisible, duration, onClose, mounted]);

    if (!mounted) return null;

    // Classes CSS
    const typeClass = styles[type];
    const animationClass = exiting
        ? position === 'top'
            ? styles.exitTop
            : styles.exit
        : position === 'top'
            ? styles.enterTop
            : styles.enter;
    const wrapperClass = position === 'top' ? styles.wrapperTop : styles.wrapper;

    return (
        <div className={wrapperClass}>
            <div
                className={`${styles.toast} ${typeClass} ${animationClass}`}
                role="status"
                aria-live="polite"
            >
                <div className={styles.content}>
                    <span>{message}</span>
                    <button
                        onClick={onClose}
                        aria-label="Fechar aviso"
                        className={styles.close}
                    >
                        ×
                    </button>
                </div>
            </div>
        </div>
    );
});
