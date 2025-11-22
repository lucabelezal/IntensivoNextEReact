/**
 * Domain Model: CardLimit
 * 
 * Representa o limite de cartão com suas regras de negócio.
 * Imutável por design (readonly) - inspirado em Swift structs.
 */

export interface CardLimit {
    readonly currentLimit: number;
    readonly usedAmount: number;
    readonly availableAmount: number;
    readonly minAllowedLimit: number;
    readonly maxAllowedLimit: number;
}

/**
 * Domain Logic: Funções puras que operam sobre CardLimit
 * Similar a extension methods no Swift
 */
export const CardLimitDomain = {
    /**
     * Cria um novo CardLimit com valores padrão
     */
    create(usedAmount: number): CardLimit {
        const currentLimit = usedAmount;
        return {
            currentLimit,
            usedAmount,
            availableAmount: 0,
            minAllowedLimit: usedAmount,
            maxAllowedLimit: 50000,
        };
    },

    /**
     * Verifica se um novo limite é válido
     */
    canUpdateTo(limit: CardLimit, newAmount: number): boolean {
        return (
            newAmount >= limit.minAllowedLimit &&
            newAmount <= limit.maxAllowedLimit &&
            !Number.isNaN(newAmount)
        );
    },

    /**
     * Calcula o novo estado após atualização
     */
    withNewLimit(limit: CardLimit, newAmount: number): CardLimit {
        return {
            ...limit,
            currentLimit: newAmount,
            availableAmount: newAmount - limit.usedAmount,
        };
    },

    /**
     * Valida e retorna mensagem de erro (se houver)
     */
    validateLimit(limit: CardLimit, newAmount: number): string | null {
        if (Number.isNaN(newAmount)) {
            return 'Digite um valor numérico válido';
        }

        if (newAmount < limit.minAllowedLimit) {
            return `O novo limite deve ser maior ou igual ao usado (R$ ${limit.usedAmount.toLocaleString('pt-BR', {
                minimumFractionDigits: 2
            })})`;
        }

        if (newAmount > limit.maxAllowedLimit) {
            return `O limite não pode ser maior que R$ ${limit.maxAllowedLimit.toLocaleString('pt-BR')}`;
        }

        return null;
    },
};
