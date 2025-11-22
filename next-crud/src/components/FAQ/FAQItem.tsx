/**
 * FAQItem Component
 * 
 * Card clicável que representa uma FAQ na lista.
 * Accordion expansível com animação.
 * 
 * Similar a um List row com disclosure no SwiftUI
 */

import { useState, memo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQ, FAQ_CATEGORIES } from '@/types/domain/FAQ';
import { useFavorites } from '@/contexts/FavoritesContext';
import styles from './FAQItem.module.css';

export interface FAQItemProps {
    faq: FAQ;
    /** Se deve expandir para mostrar resposta inline */
    expandable?: boolean;
    /** Callback ao clicar */
    onClick?: () => void;
}

export const FAQItem = memo(function FAQItem({
    faq,
    expandable = false,
    onClick
}: FAQItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();

    const favorited = isFavorite(faq.id);
    const categoryInfo = FAQ_CATEGORIES[faq.category];

    const handleToggleExpand = () => {
        if (expandable) {
            setIsExpanded(!isExpanded);
        }
        onClick?.();
    };

    const handleToggleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(faq.id);
    };

    const content = (
        <motion.div
            className={styles.card}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Header */}
            <div className={styles.header} onClick={handleToggleExpand}>
                <div className={styles.headerContent}>
                    {/* Category badge */}
                    <span
                        className={styles.category}
                        style={{ backgroundColor: `${categoryInfo.color}20`, color: categoryInfo.color }}
                    >
                        {categoryInfo.icon} {categoryInfo.label}
                    </span>

                    {/* Question */}
                    <h3 className={styles.question}>{faq.question}</h3>

                    {/* Meta info */}
                    <div className={styles.meta}>
                        <span className={styles.helpful}>
                            👍 {faq.helpfulCount}
                        </span>
                    </div>
                </div>

                <div className={styles.actions}>
                    {/* Favorite button */}
                    <button
                        className={styles.favoriteBtn}
                        onClick={handleToggleFavorite}
                        aria-label={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                    >
                        {favorited ? '⭐️' : '☆'}
                    </button>

                    {/* Expand arrow (if expandable) */}
                    {expandable && (
                        <motion.span
                            className={styles.arrow}
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                        >
                            ▼
                        </motion.span>
                    )}
                </div>
            </div>

            {/* Answer (expandable) */}
            <AnimatePresence>
                {expandable && isExpanded && (
                    <motion.div
                        className={styles.answer}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className={styles.answerContent}>
                            {faq.answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    // Se não é expandable, envolve em Link para navegação
    if (!expandable) {
        return (
            <Link href={`/faq/${faq.id}`} className={styles.link}>
                {content}
            </Link>
        );
    }

    return content;
});
