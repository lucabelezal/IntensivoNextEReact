/**
 * _app.tsx - Refatorado
 * 
 * Application wrapper com providers globais.
 * Similar ao App.swift com @main no iOS.
 */

import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/Toast';
import '@/styles/globals.css';
import 'tailwindcss/tailwind.css';

export default function App({ Component, pageProps }: AppProps) {
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

            <ToastProvider defaultPosition="top" defaultDuration={4000}>
                <Component {...pageProps} />
                <ToastContainer />
            </ToastProvider>
        </>
    );
}
