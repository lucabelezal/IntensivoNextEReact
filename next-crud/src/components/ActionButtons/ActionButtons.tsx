/**
 * ActionButtons - Refatorado
 * 
 * Componente memoizado com callbacks estáveis.
 */

import { memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FixedAboveKeyboard } from '@/components/FixedAboveKeyboard';
import styles from './ActionButtons.module.css';

// ============================================
// TYPES
// ============================================

export interface ActionButtonsProps {
    onCancel: () => void;
    onSave: () => void;
    canSave?: boolean;
    saveLabel?: string;
    cancelLabel?: string;
    isLoading?: boolean;
}

// ============================================
// COMPONENT
// ============================================

/**
 * Barra de ações fixa (Cancelar/Salvar)
 * Memoizada para evitar re-renders desnecessários
 */
export const ActionButtons = memo(function ActionButtons({
    onCancel,
    onSave,
    canSave = false,
    saveLabel = 'Salvar',
    cancelLabel = 'Cancelar',
    isLoading = false,
}: ActionButtonsProps) {
    // Handlers estáveis (importante para memoization funcionar)
    const handleCancel = useCallback(() => {
        if (!isLoading) onCancel();
    }, [onCancel, isLoading]);

    const handleSave = useCallback(() => {
        if (canSave && !isLoading) onSave();
    }, [onSave, canSave, isLoading]);

    const saveButtonClassName = `${styles.save} ${!canSave || isLoading ? styles.disabled : ''
        }`;

    const buttonNode = (
        <FixedAboveKeyboard
            bottom={0}
            animateOnOpen
            openDuration={480}
            closeDuration={480}
        >
            <div className={styles.container}>
                <button
                    type="button"
                    className={styles.cancel}
                    onClick={handleCancel}
                    disabled={isLoading}
                >
                    {cancelLabel}
                </button>

                <button
                    type="button"
                    className={saveButtonClassName}
                    onClick={handleSave}
                    disabled={!canSave || isLoading}
                >
                    {isLoading ? 'Salvando...' : saveLabel}
                </button>
            </div>
        </FixedAboveKeyboard>
    );

    // Portal para renderizar fora da hierarquia
    return typeof window !== 'undefined'
        ? createPortal(buttonNode, document.body)
        : null;
});
