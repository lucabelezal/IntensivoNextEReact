/**
 * Constantes da Aplicação
 * Centraliza valores mágicos e configurações
 */

// ============================================
// CARD LIMIT
// ============================================

export const CARD_LIMIT = {
    DEFAULT_MAX: 50_000,
    MIN_INCREMENT: 100,
    DEFAULT_USED: 4_000,
} as const;

// ============================================
// TOAST
// ============================================

export const TOAST = {
    DURATION: {
        SHORT: 2000,
        MEDIUM: 3000,
        LONG: 5000,
    },
    POSITION: {
        TOP: 'top',
        BOTTOM: 'bottom',
    },
} as const;

// ============================================
// ANIMATIONS
// ============================================

export const ANIMATION = {
    KEYBOARD: {
        OPEN_DURATION: 480,
        CLOSE_DURATION: 480,
    },
    TOAST: {
        MOUNT_DURATION: 200,
        EXIT_DURATION: 150,
    },
} as const;

// ============================================
// VALIDATION MESSAGES
// ============================================

export const VALIDATION_MESSAGES = {
    LIMIT_TOO_LOW: (min: number) =>
        `O limite deve ser maior ou igual a ${formatCurrency(min)}`,
    LIMIT_TOO_HIGH: (max: number) => `O limite não pode exceder ${formatCurrency(max)}`,
    INVALID_VALUE: 'Por favor, insira um valor válido',
    REQUIRED: 'Este campo é obrigatório',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
    LIMIT_UPDATED: (value: number) => `Limite atualizado para ${formatCurrency(value)}!`,
    LIMIT_RESET: 'Limite restaurado ao valor anterior',
} as const;

// ============================================
// HELPERS
// ============================================

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
}
