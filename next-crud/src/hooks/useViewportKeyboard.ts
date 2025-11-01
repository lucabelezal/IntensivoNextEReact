import { useEffect, useState, useRef } from 'react';

export interface UseViewportKeyboardOptions {
    extraPadding?: number;
    closedOffset?: number;
    listenFocus?: boolean;
    listenOrientation?: boolean;
    debug?: boolean;
}

export interface UseViewportKeyboardResult {
    bottomOffset: number;
    isKeyboardOpen: boolean;
}

/**
 * Hook que calcula um offset bottom baseado no tamanho do viewport.
 * Compatível com visualViewport onde disponível, e com fallbacks.
 * Aplica heurística de focus para webviews que não atualizam visualViewport imediatamente.
 */
export default function useViewportKeyboard(
    options: UseViewportKeyboardOptions = {}
): UseViewportKeyboardResult {
    const {
        extraPadding = 0,
        closedOffset = 0,
        listenFocus = true,
        listenOrientation = true,
        debug = true,
    } = options;

    const [bottomOffset, setBottomOffset] = useState<number>(closedOffset);
    const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isKeyboardOpenRef = useRef<boolean>(false);
    const lastValues = useRef({ viewportHeight: 0, windowHeight: 0, keyboardHeight: 0, timestamp: 0 });

    useEffect(() => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const isiOS = /iP(ad|hone|od)/.test(ua);
        const isiOSWebView = isiOS && !/Safari/.test(ua);

        const estimateKeyboardHeight = () => (isiOS ? 300 : 260);

        const updateOffset = () => {
            const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
            const windowHeight = window.innerHeight;
            const keyboardHeight = Math.max(0, windowHeight - viewportHeight);
            const newOffset = keyboardHeight > 0 ? keyboardHeight + extraPadding : closedOffset;

            if (debug) {
                console.debug('[useViewportKeyboard] updateOffset', {
                    viewportHeight,
                    windowHeight,
                    keyboardHeight,
                    newOffset,
                    timestamp: Date.now(),
                });
            }

            if (keyboardHeight === 0) {
                // ao fechar: aplicar imediatamente para evitar descida atrasada
                setBottomOffset(newOffset);
            } else if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(() => setBottomOffset(newOffset));
            } else {
                setBottomOffset(newOffset);
            }

            setIsKeyboardOpen(keyboardHeight > 0);
            isKeyboardOpenRef.current = keyboardHeight > 0;

            lastValues.current = {
                viewportHeight,
                windowHeight,
                keyboardHeight,
                timestamp: Date.now(),
            };
        };

        const onFocusIn = (ev: Event) => {
            try {
                const target = ev.target as HTMLElement | null;
                const isInput = !!target && (
                    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
                    target.isContentEditable
                );
                if (!isInput) return;

                const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
                const windowHeight = window.innerHeight;
                const visualDiff = Math.max(0, windowHeight - (window.visualViewport?.height ?? windowHeight));

                const immediateKeyboardHeight = visualDiff > 0 ? visualDiff : estimateKeyboardHeight();
                const immediateOffset = immediateKeyboardHeight + extraPadding;

                if (debug) {
                    console.debug('[useViewportKeyboard] focusin heuristic', {
                        immediateKeyboardHeight,
                        immediateOffset,
                        isiOSWebView,
                        timestamp: Date.now(),
                    });
                }

                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                // aplicar apenas uma fração do offset heurístico imediato para evitar um grande
                // salto quando o visualViewport corrigir o valor — isso reduz o "balanço".
                const HEURISTIC_FACTOR = 0.6;
                const softened = Math.round(immediateOffset * HEURISTIC_FACTOR);
                setBottomOffset(softened);
                setIsKeyboardOpen(true);
                isKeyboardOpenRef.current = true;
            } catch (err) {
                // ignore
            }
        };

        const onFocusOut = () => {
            if (debug) console.debug('[useViewportKeyboard] focusout', { timestamp: Date.now() });
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setBottomOffset(closedOffset);
            setIsKeyboardOpen(false);
            isKeyboardOpenRef.current = false;
        };

        const onOrientation = () => updateOffset();

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', updateOffset);
            window.visualViewport.addEventListener('scroll', updateOffset);
        }
        window.addEventListener('resize', updateOffset);

        if (listenFocus) {
            window.addEventListener('focusin', onFocusIn);
            window.addEventListener('focusout', onFocusOut);
        }

        if (listenOrientation) {
            window.addEventListener('orientationchange', onOrientation);
        }

        // inicial
        updateOffset();

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', updateOffset);
                window.visualViewport.removeEventListener('scroll', updateOffset);
            }
            window.removeEventListener('resize', updateOffset);
            if (listenFocus) {
                window.removeEventListener('focusin', onFocusIn);
                window.removeEventListener('focusout', onFocusOut);
            }
            if (listenOrientation) {
                window.removeEventListener('orientationchange', onOrientation);
            }
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [extraPadding, closedOffset, listenFocus, listenOrientation, debug]);

    return { bottomOffset, isKeyboardOpen };
}
