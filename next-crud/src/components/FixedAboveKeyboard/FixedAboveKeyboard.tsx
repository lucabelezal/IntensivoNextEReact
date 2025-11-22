import { CSSProperties, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import useViewportKeyboard from '@/hooks/useViewportKeyboard';

export interface FixedAboveKeyboardProps {
    children: React.ReactNode;
    className?: string;
    style?: CSSProperties;
    bottom?: number; // deslocamento base (em px) quando o teclado está fechado
    animateOnOpen?: boolean;
    openDuration?: number; // duração em ms para abertura (quando o teclado aparece)
    closeDuration?: number; // duração em ms para fechamento (quando o teclado desaparece)
}

function FixedAboveKeyboard({
    children,
    className,
    style,
    bottom = 16,
    animateOnOpen = true,
    openDuration = 300,
    closeDuration = 300,
}: FixedAboveKeyboardProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const { bottomOffset, isKeyboardOpen } = useViewportKeyboard({ closedOffset: 0 });

    // Quando o teclado abre, deslocamos todo o wrapper fixo para cima por bottomOffset px.
    // O elemento está ancorado com `bottom: bottom`, então quando o teclado está fechado ele fica nessa distância.
    const translateY = isKeyboardOpen ? -bottomOffset : 0;
    // Usa durações diferentes para abrir/fechar para permitir uma descida um pouco mais lenta,
    // reduzindo a sensação de 'solavanco' quando o teclado some.
    const duration = isKeyboardOpen ? openDuration : closeDuration;
    const transition = animateOnOpen ? `transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none';

    const outerStyle: CSSProperties = {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: bottom,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        transform: `translateY(${translateY}px)`,
        transition,
        willChange: 'transform',
        pointerEvents: 'none',
        zIndex: 1000,
    };

    const innerStyle: CSSProperties = {
        pointerEvents: 'auto',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'center',
    };

    const mergedOuterStyle: CSSProperties = { ...outerStyle };
    if (style) Object.assign(mergedOuterStyle, style);

    const node = (
        <div style={mergedOuterStyle} aria-hidden={false}>
            <div style={innerStyle} className={className}>
                {children}
            </div>
        </div>
    );

    if (!mounted) return null;
    return createPortal(node, document.body);
}

export default FixedAboveKeyboard;
