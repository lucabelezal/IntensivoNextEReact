/**
 * IOSNavigationBar - Barra de navegação estilo iOS
 * 
 * Componente reutilizável que replica a UINavigationBar do iOS
 * - Fundo translúcido com blur
 * - Botão de voltar
 * - Título centralizado (opcional)
 */

import { useRouter } from 'next/router';
import { MdArrowBack } from 'react-icons/md';

interface IOSNavigationBarProps {
    title?: string;
    showBackButton?: boolean;
    onBack?: () => void;
}

export function IOSNavigationBar({
    title,
    showBackButton = true,
    onBack
}: IOSNavigationBarProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '0.5px solid rgba(0, 0, 0, 0.1)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            <div style={{
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '8px',
                paddingRight: '16px',
                position: 'relative',
            }}>
                {showBackButton && (
                    <button
                        onClick={handleBack}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: '#007AFF',
                            background: 'none',
                            border: 'none',
                            fontSize: '17px',
                            padding: '8px',
                            cursor: 'pointer',
                            marginLeft: '-8px',
                        }}
                        aria-label="Voltar"
                    >
                        <MdArrowBack size={24} />
                    </button>
                )}
                {title && (
                    <h1 style={{
                        fontSize: '17px',
                        fontWeight: '600',
                        margin: 0,
                        color: '#000',
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}>
                        {title}
                    </h1>
                )}
            </div>
        </div>
    );
}
