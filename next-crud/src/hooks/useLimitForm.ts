export interface UseLimitFormResult {
    newLimit: string;
    setNewLimit: (v: string) => void;
    numericLimit: number;
    canSave: boolean;
    validationMessage: string;
}

function digitsToReais(digits: string): number {
    if (!digits) return 0;
    const padded = digits.padStart(3, "0");
    const intPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);
    return Number(`${intPart}.${decimalPart}`);
}

import { useState } from 'react';

export default function useLimitForm(usedLimit: number, maxLimit = 50000): UseLimitFormResult {
    const [newLimit, setNewLimit] = useState(() => String(usedLimit * 100));

    const numericLimit = digitsToReais(newLimit);

    const canSave =
        newLimit !== "" &&
        !Number.isNaN(numericLimit) &&
        numericLimit >= usedLimit &&
        numericLimit <= maxLimit;

    const validationMessage = (() => {
        if (newLimit === "") return "";
        if (Number.isNaN(numericLimit)) return "Digite um valor numérico válido";
        if (numericLimit < usedLimit) return `O novo limite deve ser maior ou igual ao usado (R$ ${usedLimit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})`;
        if (numericLimit > maxLimit) return `O limite não pode ser maior que R$ ${maxLimit.toLocaleString('pt-BR')}`;
        return "";
    })();

    return {
        newLimit,
        setNewLimit,
        numericLimit,
        canSave,
        validationMessage,
    };
}
