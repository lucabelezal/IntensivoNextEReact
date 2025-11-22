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

// ============================================
// iOS DESIGN SYSTEM
// ============================================

export const IOSColors = {
    // System Colors
    primary: '#007AFF',
    background: '#F2F2F7',
    white: '#FFFFFF',
    black: '#000000',

    // Gray Scale
    gray: '#8E8E93',
    lightGray: '#C6C6C8',
    separator: 'rgba(0, 0, 0, 0.1)',

    // Navigation
    navBackground: 'rgba(255, 255, 255, 0.85)',
} as const;

export const IOSTypography = {
    // Títulos
    largeTitle: { fontSize: '34px', fontWeight: 'bold' as const },
    title1: { fontSize: '28px', fontWeight: '600' as const },
    title2: { fontSize: '24px', fontWeight: '600' as const },
    title3: { fontSize: '20px', fontWeight: '600' as const },

    // Corpo
    body: { fontSize: '17px', fontWeight: '400' as const },
    callout: { fontSize: '16px', fontWeight: '400' as const },
    subheadline: { fontSize: '15px', fontWeight: '400' as const },
    footnote: { fontSize: '13px', fontWeight: '400' as const },
    caption: { fontSize: '12px', fontWeight: '400' as const },
} as const;

export const IOSSpacing = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '32px',
} as const;

export const IOSRadius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
} as const;
