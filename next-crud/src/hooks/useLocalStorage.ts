/**
 * useLocalStorage Hook
 * 
 * Sincroniza um estado do React com localStorage.
 * Dados persistem entre sessões e reloads.
 * 
 * Similar ao @AppStorage no SwiftUI:
 * @AppStorage("favorites") var favorites: [String] = []
 * 
 * Uso:
 * const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);
 */

import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';

/**
 * Tipo do setter (igual ao useState)
 */
type SetValue<T> = Dispatch<SetStateAction<T>>;

/**
 * Hook useLocalStorage
 * 
 * Funciona exatamente como useState, mas persiste no localStorage.
 * 
 * @param key Chave no localStorage (ex: 'user-preferences')
 * @param initialValue Valor inicial se não existir no localStorage
 * @returns [value, setValue] - mesma API do useState
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>] {
    /**
     * Estado que sincroniza com localStorage
     * 
     * A função passada para useState só executa no mount inicial.
     * Similar a lazy initialization no Swift.
     */
    const [storedValue, setStoredValue] = useState<T>(() => {
        // Server-side rendering check
        // localStorage não existe no Node.js (SSR do Next.js)
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            // Tenta ler do localStorage
            const item = window.localStorage.getItem(key);

            // Se existe, faz parse do JSON
            // Similar a JSONDecoder no Swift
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            // Em caso de erro (JSON inválido, etc), usa valor inicial
            console.warn(`Erro ao ler localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    /**
     * Setter que atualiza tanto o estado quanto o localStorage
     * 
     * Aceita valor direto ou função (igual useState)
     * Exemplo: setValue(newValue) ou setValue(prev => prev + 1)
     */
    const setValue: SetValue<T> = useCallback(
        (value: SetStateAction<T>) => {
            try {
                // Permite passar uma função (como no useState)
                // Se for função, executa com valor atual
                const valueToStore = value instanceof Function
                    ? value(storedValue)
                    : value;

                // Atualiza estado do React
                setStoredValue(valueToStore);

                // Atualiza localStorage (apenas no client)
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );

                    // Dispara evento customizado para sincronizar entre tabs
                    // Permite que múltiplas abas do app fiquem sincronizadas
                    window.dispatchEvent(
                        new CustomEvent('local-storage', {
                            detail: { key, value: valueToStore },
                        })
                    );
                }
            } catch (error) {
                console.error(`Erro ao salvar no localStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    /**
     * Effect para sincronizar entre tabs/windows
     * 
     * Se o usuário abrir o app em 2 abas, mudanças em uma
     * refletem automaticamente na outra.
     */
    useEffect(() => {
        // Não executa no servidor
        if (typeof window === 'undefined') {
            return;
        }

        /**
         * Handler para storage event (built-in do browser)
         * Dispara quando localStorage muda em OUTRA tab
         */
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue) {
                try {
                    setStoredValue(JSON.parse(e.newValue) as T);
                } catch (error) {
                    console.warn('Erro ao parsear storage event:', error);
                }
            }
        };

        /**
         * Handler para nosso evento customizado
         * Dispara quando localStorage muda na MESMA tab
         */
        const handleCustomEvent = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail.key === key) {
                setStoredValue(customEvent.detail.value);
            }
        };

        // Registra listeners
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('local-storage', handleCustomEvent);

        // Cleanup: remove listeners
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('local-storage', handleCustomEvent);
        };
    }, [key]);

    return [storedValue, setValue];
}

/**
 * Hook auxiliar: useSessionStorage
 * 
 * Igual ao useLocalStorage, mas usa sessionStorage.
 * Dados persistem apenas durante a sessão (fecha aba = perde dados).
 */
export function useSessionStorage<T>(
    key: string,
    initialValue: T
): [T, SetValue<T>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            const item = window.sessionStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            console.warn(`Erro ao ler sessionStorage key "${key}":`, error);
            return initialValue;
        }
    });

    const setValue: SetValue<T> = useCallback(
        (value: SetStateAction<T>) => {
            try {
                const valueToStore = value instanceof Function
                    ? value(storedValue)
                    : value;

                setStoredValue(valueToStore);

                if (typeof window !== 'undefined') {
                    window.sessionStorage.setItem(
                        key,
                        JSON.stringify(valueToStore)
                    );
                }
            } catch (error) {
                console.error(`Erro ao salvar no sessionStorage key "${key}":`, error);
            }
        },
        [key, storedValue]
    );

    return [storedValue, setValue];
}

/**
 * Exemplos de uso:
 * 
 * // 1. Favoritos persistentes
 * function useFavorites() {
 *     const [favorites, setFavorites] = useLocalStorage<string[]>('faq-favorites', []);
 * 
 *     const addFavorite = (id: string) => {
 *         setFavorites(prev => [...prev, id]);
 *     };
 * 
 *     const removeFavorite = (id: string) => {
 *         setFavorites(prev => prev.filter(fid => fid !== id));
 *     };
 * 
 *     return { favorites, addFavorite, removeFavorite };
 * }
 * 
 * // 2. Preferências do usuário
 * function useTheme() {
 *     const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
 *     return { theme, setTheme };
 * }
 * 
 * // 3. Cache de dados (com expiração)
 * interface CachedData<T> {
 *     data: T;
 *     timestamp: number;
 * }
 * 
 * function useCachedData<T>(key: string, ttl: number = 3600000) {
 *     const [cached, setCached] = useLocalStorage<CachedData<T> | null>(`cache-${key}`, null);
 * 
 *     const isExpired = cached 
 *         ? Date.now() - cached.timestamp > ttl 
 *         : true;
 * 
 *     const setData = (data: T) => {
 *         setCached({ data, timestamp: Date.now() });
 *     };
 * 
 *     return {
 *         data: !isExpired ? cached?.data : undefined,
 *         setData,
 *         isExpired,
 *     };
 * }
 */
