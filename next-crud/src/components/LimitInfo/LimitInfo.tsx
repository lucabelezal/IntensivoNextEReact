/**
 * LimitInfo - Refatorado com Compound Components Pattern
 * 
 * Permite composição flexível e reutilização.
 * Similar ao pattern de ViewBuilder do SwiftUI.
 */

import { createContext, useContext, ReactNode, memo } from 'react';
import { formatMoney } from '@/lib/utils/formatters';
import styles from './LimitInfo.module.css';

// ============================================
// CONTEXT (interno)
// ============================================

interface LimitInfoContextValue {
    total: number;
    used: number;
    available: number;
}

const LimitInfoContext = createContext<LimitInfoContextValue | null>(null);

function useLimitInfoContext() {
    const context = useContext(LimitInfoContext);
    if (!context) {
        throw new Error('LimitInfo sub-components devem ser usados dentro de LimitInfo');
    }
    return context;
}

// ============================================
// MAIN COMPONENT
// ============================================

interface LimitInfoProps {
    total: number;
    used: number;
    children?: ReactNode;
}

/**
 * Container principal - Sem memo para permitir compound components
 */
function LimitInfoComponent({
    total,
    used,
    children,
}: LimitInfoProps) {
    const available = total - used;

    const value: LimitInfoContextValue = {
        total,
        used,
        available,
    };

    return (
        <LimitInfoContext.Provider value={value}>
            <div className={styles.container}>
                {children || (
                    <>
                        <LimitInfoRow label="Limite Total" type="total" />
                        <LimitInfoRow label="Em Uso" type="used" />
                        <LimitInfoRow label="Disponível" type="available" />
                    </>
                )}
            </div>
        </LimitInfoContext.Provider>
    );
}

// ============================================
// SUB-COMPONENTS (Compound Components)
// ============================================

interface LimitInfoRowProps {
    label: string;
    type: keyof LimitInfoContextValue;
    highlighted?: boolean;
}

const LimitInfoRow = memo(function LimitInfoRow({
    label,
    type,
    highlighted = false,
}: LimitInfoRowProps) {
    const context = useLimitInfoContext();
    const value = context[type];

    const rowClassName = `${styles.row} ${highlighted ? styles.rowHighlighted : ''}`;

    return (
        <div className={rowClassName}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{formatMoney(value)}</span>
        </div>
    );
});

// ============================================
// CUSTOM SECTION (para extensão)
// ============================================

interface LimitInfoSectionProps {
    children: ReactNode;
}

const LimitInfoSection = memo(function LimitInfoSection({
    children,
}: LimitInfoSectionProps) {
    return <div className={styles.section}>{children}</div>;
});

// ============================================
// EXPORT com compound components
// ============================================

export const LimitInfo = Object.assign(memo(LimitInfoComponent), {
    Row: LimitInfoRow,
    Section: LimitInfoSection,
});
