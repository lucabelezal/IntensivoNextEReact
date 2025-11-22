/**
 * TabBar Component
 * 
 * Navegação em abas estilo iOS/Material Design.
 * Fica fixo na parte inferior da tela.
 * 
 * Similar ao TabView do SwiftUI:
 * TabView {
 *     HomeView().tabItem { Label("Home", systemImage: "house") }
 *     FAQView().tabItem { Label("FAQ", systemImage: "questionmark.circle") }
 * }
 */

import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import styles from './TabBar.module.css';

/**
 * Definição de uma aba
 */
interface Tab {
    /** Rota da aba (ex: '/', '/faq') */
    href: string;

    /** Label visível */
    label: string;

    /** Ícone (string emoji ou ReactNode com componente de ícone) */
    icon: string | ReactNode;

    /** Badge count (opcional) - ex: número de favoritos */
    badge?: number;
}

/**
 * Props do TabBar
 */
export interface TabBarProps {
    /** Lista de abas */
    tabs: Tab[];

    /** Classe CSS adicional */
    className?: string;
}

/**
 * TabBar Component
 * 
 * Navegação inferior com animação de indicador.
 * Usa Next.js Link para navegação otimizada (pre-fetch).
 */
export function TabBar({ tabs, className = '' }: TabBarProps) {
    /**
     * Hook do Next.js para saber rota atual
     * Similar ao NavigationPath no SwiftUI
     */
    const router = useRouter();

    /**
     * Verifica se aba está ativa
     * Compara pathname atual com href da aba
     */
    const isActive = (href: string): boolean => {
        if (href === '/') {
            // Home: só ativo se exatamente '/'
            return router.pathname === '/';
        }
        // Outras rotas: ativo se pathname começa com href
        return router.pathname.startsWith(href);
    };

    return (
        <nav className={`${styles.tabBar} ${className}`}>
            <div className={styles.container}>
                {tabs.map((tab) => {
                    const active = isActive(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`${styles.tab} ${active ? styles.active : ''}`}
                        >
                            {/* Container do ícone com badge */}
                            <div className={styles.iconContainer}>
                                <span className={styles.icon}>
                                    {tab.icon}
                                </span>

                                {/* Badge (se tiver) */}
                                {tab.badge !== undefined && tab.badge > 0 && (
                                    <motion.span
                                        className={styles.badge}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        exit={{ scale: 0 }}
                                        transition={{
                                            type: 'spring',
                                            stiffness: 500,
                                            damping: 30,
                                        }}
                                    >
                                        {tab.badge > 99 ? '99+' : tab.badge}
                                    </motion.span>
                                )}
                            </div>

                            {/* Label */}
                            <span className={styles.label}>
                                {tab.label}
                            </span>

                            {/* Indicador animado */}
                            {active && (
                                <motion.div
                                    className={styles.indicator}
                                    layoutId="activeTab" // Framer Magic! Anima entre tabs
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

/**
 * Exemplo de uso:
 * 
 * function AppLayout({ children }: PropsWithChildren) {
 *     const { count } = useFavorites();
 * 
 *     const tabs = [
 *         { href: '/', label: 'Limite', icon: '💳' },
 *         { href: '/faq', label: 'FAQ', icon: '❓', badge: count },
 *     ];
 * 
 *     return (
 *         <div>
 *             <main>{children}</main>
 *             <TabBar tabs={tabs} />
 *         </div>
 *     );
 * }
 */
