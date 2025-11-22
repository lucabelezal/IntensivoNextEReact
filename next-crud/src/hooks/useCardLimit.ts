/**
 * Hook: useCardLimit
 * 
 * Gerencia estado e lógica de negócio do limite de cartão.
 * Usa useReducer para estado complexo (melhor que múltiplos useState).
 */

import { useReducer, useCallback } from 'react';
import { CardLimit, CardLimitDomain } from '@/types/domain/CardLimit';
import { digitsToReais } from '@/lib/utils/formatters';

// ============================================
// STATE & ACTIONS - Padrão Reducer
// ============================================

interface CardLimitState {
    limit: CardLimit;
    inputValue: string; // string de dígitos (ex: "600000" = R$ 6000,00)
    numericValue: number;
    validationError: string | null;
    isDirty: boolean; // usuário já interagiu com o input?
}

type CardLimitAction =
    | { type: 'SET_INPUT'; payload: string }
    | { type: 'VALIDATE' }
    | { type: 'RESET' }
    | { type: 'COMMIT_CHANGE'; payload: number };

// ============================================
// REDUCER - Lógica centralizada
// ============================================

function cardLimitReducer(
    state: CardLimitState,
    action: CardLimitAction
): CardLimitState {
    switch (action.type) {
        case 'SET_INPUT': {
            const digits = action.payload.replace(/\D/g, '');
            const numeric = digitsToReais(digits);

            return {
                ...state,
                inputValue: digits,
                numericValue: numeric,
                isDirty: true,
                validationError: CardLimitDomain.validateLimit(state.limit, numeric),
            };
        }

        case 'VALIDATE': {
            return {
                ...state,
                validationError: CardLimitDomain.validateLimit(
                    state.limit,
                    state.numericValue
                ),
            };
        }

        case 'RESET': {
            const initialDigits = String(state.limit.usedAmount * 100);
            return {
                ...state,
                inputValue: initialDigits,
                numericValue: state.limit.usedAmount,
                validationError: null,
                isDirty: false,
            };
        }

        case 'COMMIT_CHANGE': {
            const newLimit = CardLimitDomain.withNewLimit(state.limit, action.payload);
            return {
                ...state,
                limit: newLimit,
                validationError: null,
                isDirty: false,
            };
        }

        default:
            return state;
    }
}

// ============================================
// HOOK
// ============================================

interface UseCardLimitOptions {
    initialUsedAmount?: number;
    maxLimit?: number;
}

export function useCardLimit(options: UseCardLimitOptions = {}) {
    const { initialUsedAmount = 4000, maxLimit = 50000 } = options;

    // Estado inicial
    const initialLimit = CardLimitDomain.create(initialUsedAmount);
    const initialState: CardLimitState = {
        limit: { ...initialLimit, maxAllowedLimit: maxLimit },
        inputValue: String(initialUsedAmount * 100),
        numericValue: initialUsedAmount,
        validationError: null,
        isDirty: false,
    };

    const [state, dispatch] = useReducer(cardLimitReducer, initialState);

    // Actions (estáveis com useCallback)
    const setInputValue = useCallback((value: string) => {
        dispatch({ type: 'SET_INPUT', payload: value });
    }, []);

    const validate = useCallback(() => {
        dispatch({ type: 'VALIDATE' });
    }, []);

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    const commitChange = useCallback((newAmount: number) => {
        dispatch({ type: 'COMMIT_CHANGE', payload: newAmount });
    }, []);

    // Computed values
    const canSave =
        state.isDirty &&
        state.validationError === null &&
        CardLimitDomain.canUpdateTo(state.limit, state.numericValue);

    return {
        // Estado
        limit: state.limit,
        inputValue: state.inputValue,
        numericValue: state.numericValue,
        validationError: state.validationError,
        isDirty: state.isDirty,
        canSave,

        // Actions
        setInputValue,
        validate,
        reset,
        commitChange,
    };
}
