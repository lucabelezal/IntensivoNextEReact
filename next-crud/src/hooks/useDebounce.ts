/**
 * useDebounce Hook
 * 
 * Atrasa a execução de uma função até que o usuário pare de digitar.
 * Essencial para search inputs - evita fazer request a cada tecla.
 * 
 * Similar ao uso de Combine no Swift:
 * publisher
 *     .debounce(for: .milliseconds(500), scheduler: RunLoop.main)
 *     .sink { value in ... }
 * 
 * Uso:
 * const debouncedSearch = useDebounce(searchText, 500);
 */

import { useState, useEffect } from 'react';

/**
 * Hook useDebounce
 * 
 * Retorna um valor "atrasado" que só atualiza após o delay especificado.
 * Se o valor mudar antes do delay, o timer é resetado.
 * 
 * @param value Valor a ser debounced
 * @param delay Delay em milissegundos (default: 500ms)
 * @returns Valor debounced
 * 
 * Exemplo prático:
 * - Usuário digita "r" -> timer inicia (500ms)
 * - Usuário digita "e" -> timer reseta e inicia novamente
 * - Usuário digita "a" -> timer reseta e inicia novamente
 * - Usuário digita "c" -> timer reseta e inicia novamente
 * - Usuário digita "t" -> timer reseta e inicia novamente
 * - Usuário para de digitar
 * - Após 500ms -> debouncedValue = "react"
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
    // Estado que armazena o valor debounced
    // Similar a @State no SwiftUI
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        /**
         * Cria um timer para atualizar o valor após o delay
         * Similar a DispatchQueue.main.asyncAfter no Swift
         */
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        /**
         * Cleanup function
         * Cancela o timer se:
         * 1. O value mudar antes do delay (usuário ainda digitando)
         * 2. O componente desmontar
         * 
         * Similar a task.cancel() no Swift
         */
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]); // Reexecuta quando value ou delay mudarem

    return debouncedValue;
}

/**
 * Exemplo de uso em um componente de busca:
 * 
 * function SearchInput() {
 *     // Estado imediato (atualiza a cada tecla)
 *     const [searchText, setSearchText] = useState('');
 *     
 *     // Valor debounced (só atualiza após parar de digitar)
 *     const debouncedSearch = useDebounce(searchText, 500);
 * 
 *     // Effect que faz a busca
 *     useEffect(() => {
 *         if (debouncedSearch) {
 *             // Só executa quando usuário parar de digitar por 500ms
 *             fetchSearchResults(debouncedSearch);
 *         }
 *     }, [debouncedSearch]); // Depende do valor debounced, não do imediato
 * 
 *     return (
 *         <input
 *             value={searchText}
 *             onChange={(e) => setSearchText(e.target.value)}
 *             placeholder="Digite para buscar..."
 *         />
 *     );
 * }
 * 
 * Benefícios:
 * - Reduz número de requests (se usuário digitar 10 letras, só 1 request)
 * - Melhora performance
 * - Economiza banda
 * - Melhor UX (não trava enquanto digita)
 */

/**
 * Variante: useDebouncedCallback
 * 
 * Alternativa que debounces uma função ao invés de um valor.
 * Útil quando você quer controlar quando a função é chamada.
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = 500
): (...args: Parameters<T>) => void {
    const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

    return (...args: Parameters<T>) => {
        // Cancela timeout anterior se existir
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        // Cria novo timeout
        const newTimeoutId = setTimeout(() => {
            callback(...args);
        }, delay);

        setTimeoutId(newTimeoutId);
    };
}

/**
 * Exemplo de uso do useDebouncedCallback:
 * 
 * function SearchInput() {
 *     const [searchText, setSearchText] = useState('');
 * 
 *     // Função debounced
 *     const debouncedSearch = useDebouncedCallback((text: string) => {
 *         fetchSearchResults(text);
 *     }, 500);
 * 
 *     const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
 *         const newValue = e.target.value;
 *         setSearchText(newValue);  // Atualiza UI imediatamente
 *         debouncedSearch(newValue); // Chama search após 500ms
 *     };
 * 
 *     return (
 *         <input
 *             value={searchText}
 *             onChange={handleChange}
 *         />
 *     );
 * }
 */
