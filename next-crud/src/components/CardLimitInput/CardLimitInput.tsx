/**
 * CardLimitInput - Refatorado
 * 
 * Componente controlado, memoizado para performance.
 * Responsável apenas pela apresentação e captura de input.
 */

import { useRef, useEffect, memo, ChangeEvent } from 'react';
import { formatMoneyFromDigits } from '@/lib/utils/formatters';
import styles from './CardLimitInput.module.css';

// ============================================
// TYPES
// ============================================

export interface CardLimitInputProps {
    value: string; // string de dígitos
    onChange: (digits: string) => void;
    error?: string | null;
    disabled?: boolean;
    autoFocus?: boolean;
}

// ============================================
// COMPONENT
// ============================================

/**
 * Input de limite de cartão com formatação monetária
 * Memoizado - só re-renderiza se props mudarem
 */
export const CardLimitInput = memo(function CardLimitInput({
    value,
    onChange,
    error,
    disabled = false,
    autoFocus = false,
}: CardLimitInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll no focus (comportamento mobile)
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            const timer = setTimeout(() => {
                inputRef.current?.focus();
                // Scroll extra para compensar toolbar do iOS
                inputRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'nearest'
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [autoFocus]);

    // Handler de mudança
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        onChange(digits);
    };

    // Handler para Enter/Done - fecha o teclado
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            inputRef.current?.blur();
        }
    };

    // Valor formatado para display
    const displayValue = value ? formatMoneyFromDigits(value) : '';

    // Classes CSS dinâmicas
    const inputClassName = `${styles.input} ${error ? styles.inputError : ''}`;

    return (
        <div className={styles.container}>
            <label htmlFor="card-limit-input" className={styles.label}>
                Novo Limite
            </label>

            <input
                id="card-limit-input"
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={inputClassName}
                placeholder="R$ 0,00"
                aria-invalid={!!error}
                aria-describedby={error ? 'card-limit-error' : undefined}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                enterKeyHint="done"
            />

            {error && (
                <p id="card-limit-error" className={styles.error} role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});
