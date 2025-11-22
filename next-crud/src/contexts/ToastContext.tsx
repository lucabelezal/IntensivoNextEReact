/**
 * Toast Context - Estado Global
 * 
 * Context API para gerenciar toasts em toda a aplicação.
 * Similar ao @EnvironmentObject do SwiftUI.
 */

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

// ============================================
// TYPES - Usando Discriminated Unions
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

/**
 * Estado do Toast - Discriminated Union
 * Força verificação do status antes de acessar message
 */
export type ToastState =
    | { status: 'hidden' }
    | {
        status: 'visible';
        message: string;
        type: ToastType;
        position: ToastPosition;
        duration: number;
    };

/**
 * Context Value - API pública do Toast
 */
interface ToastContextValue {
    state: ToastState;
    show: (message: string, type?: ToastType, position?: ToastPosition) => void;
    hide: () => void;
    success: (message: string, position?: ToastPosition) => void;
    error: (message: string, position?: ToastPosition) => void;
    warning: (message: string, position?: ToastPosition) => void;
    info: (message: string, position?: ToastPosition) => void;
}

// ============================================
// CONTEXT
// ============================================

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================
// PROVIDER
// ============================================

interface ToastProviderProps {
    children: ReactNode;
    defaultPosition?: ToastPosition;
    defaultDuration?: number;
}

export function ToastProvider({
    children,
    defaultPosition = 'top',
    defaultDuration = 4000,
}: ToastProviderProps) {
    const [state, setState] = useState<ToastState>({ status: 'hidden' });

    // useCallback para estabilizar referências (evitar re-renders)
    const show = useCallback(
        (
            message: string,
            type: ToastType = 'info',
            position: ToastPosition = defaultPosition
        ) => {
            setState({
                status: 'visible',
                message,
                type,
                position,
                duration: defaultDuration,
            });
        },
        [defaultPosition, defaultDuration]
    );

    const hide = useCallback(() => {
        setState({ status: 'hidden' });
    }, []);

    // Helper methods
    const success = useCallback(
        (message: string, position?: ToastPosition) => {
            show(message, 'success', position);
        },
        [show]
    );

    const error = useCallback(
        (message: string, position?: ToastPosition) => {
            show(message, 'error', position);
        },
        [show]
    );

    const warning = useCallback(
        (message: string, position?: ToastPosition) => {
            show(message, 'warning', position);
        },
        [show]
    );

    const info = useCallback(
        (message: string, position?: ToastPosition) => {
            show(message, 'info', position);
        },
        [show]
    );

    const value: ToastContextValue = {
        state,
        show,
        hide,
        success,
        error,
        warning,
        info,
    };

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para usar o Toast Context
 * Lança erro se usado fora do Provider (fail-fast)
 */
export function useToast(): ToastContextValue {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error('useToast deve ser usado dentro de ToastProvider');
    }

    return context;
}
