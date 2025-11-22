/**
 * IOSCard - Card estilo iOS
 * 
 * Componente reutilizável para cards com estilo iOS nativo
 */

import { CSSProperties, ReactNode } from 'react';

interface IOSCardProps {
    children: ReactNode;
    style?: CSSProperties;
}

export function IOSCard({ children, style }: IOSCardProps) {
    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            ...style,
        }}>
            {children}
        </div>
    );
}
