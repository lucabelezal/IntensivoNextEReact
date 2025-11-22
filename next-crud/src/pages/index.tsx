/**
 * Home Page - Refatorada
 * 
 * Demonstra uso de:
 * - Context API global (Toast)
 * - useReducer (useCardLimit)
 * - Compound Components (LimitInfo)
 * - Memoization
 * - Separação de responsabilidades
 */

import { useCallback } from 'react';
import { useCardLimit } from '@/hooks/useCardLimit';
import { useToast } from '@/contexts/ToastContext';
import { CardLimitInput } from '@/components/CardLimitInput';
import { LimitInfo } from '@/components/LimitInfo';
import { ActionButtons } from '@/components/ActionButtons';
import { formatMoney } from '@/lib/utils/formatters';

export default function Home() {
    // ============================================
    // HOOKS - Estado e lógica de negócio
    // ============================================

    const {
        limit,
        inputValue,
        numericValue,
        validationError,
        canSave,
        setInputValue,
        reset,
        commitChange,
    } = useCardLimit({
        initialUsedAmount: 4000,
        maxLimit: 50000,
    });

    const toast = useToast();

    // ============================================
    // HANDLERS - Estáveis com useCallback
    // ============================================

    const handleSave = useCallback(() => {
        if (!canSave) return;

        // Aqui faria a chamada para API
        // const result = await cardLimitService.updateLimit(numericValue);

        // Simulando sucesso
        commitChange(numericValue);

        toast.success(
            `Limite atualizado para ${formatMoney(numericValue)}!`,
            'top'
        );
    }, [canSave, numericValue, commitChange, toast]);

    const handleCancel = useCallback(() => {
        reset();
        toast.info('Alteração cancelada', 'top');
    }, [reset, toast]);

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="min-h-screen flex flex-col bg-white">
            {/* Header com estilo iOS */}
            <div className="bg-white border-b border-gray-200 px-4 py-6 shadow-sm">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                    Aumentar Limite
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                    Defina um novo limite para seu cartão
                </p>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col p-4 gap-4 pb-32 bg-gradient-to-b from-gray-50 to-white">
                {/* Card do Input - estilo iOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                    <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
                        Novo Limite
                    </label>
                    <CardLimitInput
                        value={inputValue}
                        onChange={setInputValue}
                        error={validationError}
                    />
                </div>

                {/* Card de Informações - estilo iOS */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <LimitInfo total={limit.currentLimit} used={limit.usedAmount}>
                        <LimitInfo.Row label="Limite Total" type="total" />
                        <LimitInfo.Row label="Em Uso" type="used" />
                        <LimitInfo.Row label="Disponível" type="available" highlighted />
                    </LimitInfo>
                </div>

                {/* Dica visual - estilo iOS */}
                {canSave && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-2">
                        <span className="text-blue-600 text-lg">💡</span>
                        <p className="text-xs text-blue-900 flex-1">
                            Novo limite: <strong>{formatMoney(numericValue)}</strong>
                        </p>
                    </div>
                )}
            </div>

            {/* Action Buttons - Fixos no bottom com safe area */}
            <ActionButtons
                onCancel={handleCancel}
                onSave={handleSave}
                canSave={canSave}
            />
        </div>
    );
}
