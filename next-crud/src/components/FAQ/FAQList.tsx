/**
 * FAQList Component - Lista de FAQs com loading/empty states
 */

import { FAQ } from '@/types/domain/FAQ';
import { FAQItem } from './FAQItem';
import styles from './FAQList.module.css';

export interface FAQListProps {
    faqs: FAQ[];
    isLoading?: boolean;
    error?: string;
    expandable?: boolean;
}

export function FAQList({ faqs, isLoading, error, expandable }: FAQListProps) {
    if (isLoading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner} />
                <p>Carregando FAQs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                <span className={styles.errorIcon}>⚠️</span>
                <p>{error}</p>
            </div>
        );
    }

    if (faqs.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <h3>Nenhuma FAQ encontrada</h3>
                <p>Tente ajustar os filtros de busca</p>
            </div>
        );
    }

    return (
        <div className={styles.list}>
            {faqs.map((faq) => (
                <FAQItem
                    key={faq.id}
                    faq={faq}
                    expandable={expandable}
                />
            ))}
        </div>
    );
}
