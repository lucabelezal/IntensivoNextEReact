/**
 * FAQSearch Component - Input de busca com debounce
 */

import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './FAQSearch.module.css';

export interface FAQSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function FAQSearch({ value, onChange, placeholder = 'Buscar FAQs...' }: FAQSearchProps) {
    const [localValue, setLocalValue] = useState(value);
    const debouncedValue = useDebounce(localValue, 300);

    useEffect(() => {
        onChange(debouncedValue);
    }, [debouncedValue, onChange]);

    return (
        <div className={styles.search}>
            <span className={styles.icon}>🔍</span>
            <input
                type="text"
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                placeholder={placeholder}
                className={styles.input}
            />
            {localValue && (
                <button
                    onClick={() => setLocalValue('')}
                    className={styles.clearBtn}
                    aria-label="Limpar busca"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
