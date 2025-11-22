/**
 * FavoritesContext
 * 
 * Context global para gerenciar FAQs favoritas.
 * Persiste no localStorage e sincroniza entre componentes.
 * 
 * Similar ao @EnvironmentObject no SwiftUI:
 * @EnvironmentObject var favorites: FavoritesStore
 * 
 * Uso:
 * const { favorites, addFavorite, removeFavorite } = useFavorites();
 */

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

/**
 * Estrutura de um favorito
 * Armazena ID + timestamp para ordenação
 */
export interface FavoriteItem {
    /** ID da FAQ */
    id: string;

    /** Quando foi favoritada (ISO string) */
    favoritedAt: string;
}

/**
 * Interface do contexto de favoritos
 */
export interface FavoritesContextValue {
    /** Lista de IDs favoritados */
    favorites: string[];

    /** Lista completa com metadados */
    favoritesDetailed: FavoriteItem[];

    /** Adiciona FAQ aos favoritos */
    addFavorite: (id: string) => void;

    /** Remove FAQ dos favoritos */
    removeFavorite: (id: string) => void;

    /** Toggle favorito (add se não existe, remove se existe) */
    toggleFavorite: (id: string) => void;

    /** Verifica se FAQ está favoritada */
    isFavorite: (id: string) => boolean;

    /** Limpa todos os favoritos */
    clearFavorites: () => void;

    /** Total de favoritos */
    count: number;
}

/**
 * Context criado
 * Inicialmente undefined - será preenchido pelo Provider
 */
const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

/**
 * Props do Provider
 */
interface FavoritesProviderProps {
    children: ReactNode;
}

/**
 * Provider do contexto de favoritos
 * 
 * Envolve a aplicação e fornece estado global de favoritos.
 * 
 * Similar a .environmentObject() no SwiftUI:
 * ContentView()
 *     .environmentObject(FavoritesStore())
 */
export function FavoritesProvider({ children }: FavoritesProviderProps) {
    /**
     * Estado persistido no localStorage
     * Automaticamente sincroniza entre tabs e persiste entre sessões
     */
    const [favoritesDetailed, setFavoritesDetailed] = useLocalStorage<FavoriteItem[]>(
        'faq-favorites',
        []
    );

    /**
     * Lista apenas dos IDs (derivada)
     * Útil para checks rápidos de isFavorite
     * 
     * useMemo evita recálculo a cada render
     */
    const favorites = useMemo(
        () => favoritesDetailed.map(item => item.id),
        [favoritesDetailed]
    );

    /**
     * Adiciona FAQ aos favoritos
     * Se já existir, não faz nada
     * 
     * useCallback mantém referência estável (importante para deps de useEffect)
     */
    const addFavorite = useCallback(
        (id: string) => {
            setFavoritesDetailed(prev => {
                // Se já existe, não adiciona duplicado
                if (prev.some(item => item.id === id)) {
                    return prev;
                }

                // Adiciona novo favorito no início da lista
                const newFavorite: FavoriteItem = {
                    id,
                    favoritedAt: new Date().toISOString(),
                };

                return [newFavorite, ...prev];
            });
        },
        [setFavoritesDetailed]
    );

    /**
     * Remove FAQ dos favoritos
     */
    const removeFavorite = useCallback(
        (id: string) => {
            setFavoritesDetailed(prev =>
                prev.filter(item => item.id !== id)
            );
        },
        [setFavoritesDetailed]
    );

    /**
     * Toggle favorito
     * Adiciona se não existe, remove se existe
     * 
     * Similar ao padrão toggle do Swift:
     * favorites.toggle(id)
     */
    const toggleFavorite = useCallback(
        (id: string) => {
            if (favorites.includes(id)) {
                removeFavorite(id);
            } else {
                addFavorite(id);
            }
        },
        [favorites, addFavorite, removeFavorite]
    );

    /**
     * Verifica se FAQ está favoritada
     * 
     * Similar a:
     * favorites.contains(id)
     */
    const isFavorite = useCallback(
        (id: string): boolean => {
            return favorites.includes(id);
        },
        [favorites]
    );

    /**
     * Limpa todos os favoritos
     * Útil para "resetar app" ou logout
     */
    const clearFavorites = useCallback(() => {
        setFavoritesDetailed([]);
    }, [setFavoritesDetailed]);

    /**
     * Total de favoritos
     */
    const count = favorites.length;

    /**
     * Valor do context
     * Memoizado para evitar re-renders desnecessários
     */
    const value: FavoritesContextValue = useMemo(
        () => ({
            favorites,
            favoritesDetailed,
            addFavorite,
            removeFavorite,
            toggleFavorite,
            isFavorite,
            clearFavorites,
            count,
        }),
        [
            favorites,
            favoritesDetailed,
            addFavorite,
            removeFavorite,
            toggleFavorite,
            isFavorite,
            clearFavorites,
            count,
        ]
    );

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}

/**
 * Hook para consumir o contexto
 * 
 * Lança erro se usado fora do Provider (type-safety).
 * 
 * Similar a @EnvironmentObject que crasha se não injetado no SwiftUI.
 */
export function useFavorites(): FavoritesContextValue {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error(
            'useFavorites deve ser usado dentro de um FavoritesProvider'
        );
    }

    return context;
}

/**
 * Exemplos de uso:
 * 
 * // 1. Setup no _app.tsx
 * function MyApp({ Component, pageProps }: AppProps) {
 *     return (
 *         <FavoritesProvider>
 *             <Component {...pageProps} />
 *         </FavoritesProvider>
 *     );
 * }
 * 
 * // 2. Usar em componente
 * function FAQItem({ faq }: Props) {
 *     const { isFavorite, toggleFavorite } = useFavorites();
 *     const favorited = isFavorite(faq.id);
 * 
 *     return (
 *         <div>
 *             <h3>{faq.question}</h3>
 *             <button onClick={() => toggleFavorite(faq.id)}>
 *                 {favorited ? '⭐️ Favoritado' : '☆ Favoritar'}
 *             </button>
 *         </div>
 *     );
 * }
 * 
 * // 3. Listar favoritos
 * function FavoritesScreen() {
 *     const { favorites } = useFavorites();
 *     const { faqs } = useFAQs();
 * 
 *     const favoritedFAQs = faqs.filter(faq => favorites.includes(faq.id));
 * 
 *     return (
 *         <div>
 *             <h2>Minhas Favoritas ({favorites.length})</h2>
 *             <FAQList faqs={favoritedFAQs} />
 *         </div>
 *     );
 * }
 * 
 * // 4. Badge no TabBar
 * function TabBar() {
 *     const { count } = useFavorites();
 * 
 *     return (
 *         <nav>
 *             <button>
 *                 FAQ
 *                 {count > 0 && <span className="badge">{count}</span>}
 *             </button>
 *         </nav>
 *     );
 * }
 */
