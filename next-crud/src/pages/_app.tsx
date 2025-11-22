/**
 * _app.tsx - Refatorado
 * 
 * Application wrapper com providers globais.
 * Similar ao App.swift com @main no iOS.
 * 
 * Conceitos demonstrados:
 * - Context API: FavoritesProvider (estado global)
 * - Composition: múltiplos providers aninhados
 * - Layout compartilhado: TabBar em todas as páginas
 */

import React, { useEffect, useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import { FavoritesProvider } from '@/contexts/FavoritesContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/Toast';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();

    // Detectar direção da navegação
    const [direction, setDirection] = useState(1);
    const historyRef = React.useRef<string[]>([router.pathname]);

    useEffect(() => {
        const handleRouteChange = (url: string) => {
            const history = historyRef.current;

            // Verifica se a URL já existe no histórico (voltando)
            const existingIndex = history.indexOf(url);

            if (existingIndex !== -1 && existingIndex < history.length - 1) {
                // É um voltar (pop) - remove tudo depois dessa posição
                setDirection(-1);
                historyRef.current = history.slice(0, existingIndex + 1);
            } else {
                // É um avançar (push)
                setDirection(1);
                historyRef.current = [...history, url];
            }
        };

        router.events?.on('routeChangeStart', handleRouteChange);

        return () => {
            router.events?.off('routeChangeStart', handleRouteChange);
        };
    }, [router]);

    useEffect(() => {
        // Previne zoom em double-tap no iOS
        let lastTouchEnd = 0;
        document.addEventListener(
            'touchend',
            (event) => {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    event.preventDefault();
                }
                lastTouchEnd = now;
            },
            { passive: false }
        );
    }, []);

    useEffect(() => {
        // Previne seleção de texto acidental em mobile
        const clearSelectionIfNotEditable = (e: Event) => {
            try {
                const target = e.target as HTMLElement;
                const isEditable =
                    target.tagName === 'INPUT' ||
                    target.tagName === 'TEXTAREA' ||
                    target.isContentEditable;

                if (isEditable) return;

                const selection = window.getSelection();
                if (selection && selection.rangeCount) {
                    selection.removeAllRanges();
                }
            } catch (err) {
                // Silently fail
            }
        };

        document.addEventListener('touchend', clearSelectionIfNotEditable, {
            passive: true,
        });
        document.addEventListener('mouseup', clearSelectionIfNotEditable);

        return () => {
            document.removeEventListener('touchend', clearSelectionIfNotEditable);
            document.removeEventListener('mouseup', clearSelectionIfNotEditable);
        };
    }, []);

    return (
        <>
            <Head>
                {/* PWA e iOS Meta Tags */}
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Card Limit" />
                <meta name="theme-color" content="#005BAA" />

                {/* Previne zoom em iOS */}
                <meta name="format-detection" content="telephone=no" />
            </Head>

            {/* 
                Provider Composition Pattern:
                - FavoritesProvider: estado global de favoritos (similar a @StateObject no SwiftUI)
                - ToastProvider: sistema de notificações toast
            */}
            <FavoritesProvider>
                <ToastProvider defaultPosition="top" defaultDuration={4000}>
                    {/* 
                        AnimatePresence + motion.div: transições push entre páginas
                        Similar a NavigationStack no SwiftUI
                        Push (forward): slide da direita para esquerda
                        Pop (backward): slide da esquerda para direita
                    */}
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        height: '100vh',
                        overflow: 'hidden'
                    }}>
                        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                            <motion.div
                                key={router.pathname}
                                custom={direction}
                                initial={{
                                    x: direction > 0 ? '100%' : '-20%',
                                    zIndex: direction > 0 ? 2 : 1,
                                }}
                                animate={{
                                    x: 0,
                                    zIndex: direction > 0 ? 2 : 1,
                                }}
                                exit={{
                                    x: direction > 0 ? '-20%' : '100%',
                                    zIndex: direction > 0 ? 1 : 2,
                                }}
                                transition={{
                                    type: 'tween',
                                    ease: [0.4, 0, 0.2, 1], // iOS native ease curve
                                    duration: 0.35,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: '#F2F2F7',
                                }}
                            >
                                <Component {...pageProps} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                    <ToastContainer />
                </ToastProvider>
            </FavoritesProvider>
        </>
    );
}
