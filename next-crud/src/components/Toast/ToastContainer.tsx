/**
 * ToastContainer - Componente de Integração
 * 
 * Conecta o Toast Context com o Toast Component.
 * Renderiza globalmente (deve estar em _app ou layout).
 */

import { Toast } from './Toast';
import { useToast } from '@/contexts/ToastContext';

export function ToastContainer() {
    const { state, hide } = useToast();

    // Só renderiza se está visível
    if (state.status === 'hidden') {
        return null;
    }

    return (
        <Toast
            message={state.message}
            type={state.type}
            position={state.position}
            isVisible={state.status === 'visible'}
            onClose={hide}
            duration={state.duration}
        />
    );
}
