/**
 * Utility: Formatadores monetários
 * Funções puras para formatação de valores
 */

/**
 * Converte string de dígitos (centavos) para número decimal
 * Exemplo: "123456" -> 1234.56
 */
export function digitsToReais(digits: string): number {
    if (!digits) return 0;

    const padded = digits.padStart(3, '0');
    const intPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);

    return Number(`${intPart}.${decimalPart}`);
}

/**
 * Formata dígitos como moeda brasileira
 * Exemplo: "123456" -> "R$ 1.234,56"
 */
export function formatMoneyFromDigits(digits: string): string {
    if (!digits) return '';

    const padded = digits.padStart(3, '0');
    const intPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);
    const intFormatted = Number(intPart).toLocaleString('pt-BR');

    return `R$ ${intFormatted},${decimalPart}`;
}

/**
 * Formata número como moeda brasileira
 * Exemplo: 1234.56 -> "R$ 1.234,56"
 */
export function formatMoney(value: number): string {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

/**
 * Remove caracteres não-numéricos de uma string
 */
export function extractDigits(value: string): string {
    return value.replace(/\D/g, '');
}
