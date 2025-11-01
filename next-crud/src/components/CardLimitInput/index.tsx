import { useRef, useEffect, useState } from "react";
import styles from "./CardLimitInput.module.css";

interface CardLimitInputProps {
    value?: string | number | null;
    onChange: (digits: string) => void; // envia sempre uma string contendo apenas dígitos
}

// Função utilitária para formatar valor monetário (R$ x.xxx,xx)
function formatMoney(digits: string): string {
    if (!digits) return "";
    // Garante pelo menos 3 dígitos para centavos
    const padded = digits.padStart(3, "0");
    const intPart = padded.slice(0, -2);
    const decimalPart = padded.slice(-2);
    const intFormatted = Number(intPart).toLocaleString("pt-BR");
    return `R$ ${intFormatted},${decimalPart}`;
}

function CardLimitInput({ value, onChange }: CardLimitInputProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (isFocused) {
            const t = setTimeout(() => {
                inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 200);
            return () => clearTimeout(t);
        }
    }, [isFocused]);

    // valor limpo (apenas dígitos)
    const digits = value === null || value === undefined ? "" : String(value).replace(/\D/g, "");
    // valor formatado para exibir
    const displayValue = digits ? formatMoney(digits) : "";

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        // extrai apenas dígitos e repassa ao pai
        const digits = e.target.value.replace(/\D/g, "");
        onChange(digits);
    }

    return (
        <div className={styles.container}>
            <label className={styles.label}>Novo Limite</label>
            <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={isFocused ? displayValue : displayValue}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Digite o novo limite"
                className={styles.input}
                aria-label="Novo limite"
            />
        </div>
    );
}

export default CardLimitInput;
