/**
 * useFAQs Hook
 * 
 * Hook especializado para buscar e gerenciar FAQs.
 * Integra useAsync + cache + filtros.
 * 
 * Similar a ter um @StateObject ObservableObject no SwiftUI:
 * @StateObject var viewModel = FAQViewModel()
 * 
 * Uso:
 * const { faqs, isLoading, error, refetch } = useFAQs({ category: 'limits' });
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useAsync } from './useAsync';
import { FAQ, FAQFilters } from '@/types/domain/FAQ';
import { APIResponse, ApiResponse, APIError } from '@/types/APIResponse';
import { Result } from '@/types/Result';

/**
 * Opções do hook useFAQs
 */
export interface UseFAQsOptions {
    /** Filtros de busca (opcional) */
    filters?: Partial<FAQFilters>;

    /** Se deve buscar automaticamente ao montar */
    autoFetch?: boolean;
}

/**
 * Retorno do hook useFAQs
 */
export interface UseFAQsReturn {
    /** Lista de FAQs (vazio durante loading ou erro) */
    faqs: FAQ[];

    /** Se está carregando */
    isLoading: boolean;

    /** Erro se houver */
    error: APIError | undefined;

    /** Re-executa a busca */
    refetch: () => Promise<void>;

    /** Total de FAQs retornadas */
    total: number;
}

/**
 * Hook useFAQs
 * 
 * Busca FAQs da API com suporte a filtros.
 * Gerencia loading, error e cache automaticamente.
 */
export function useFAQs(options: UseFAQsOptions = {}): UseFAQsReturn {
    const {
        filters = {},
        autoFetch = true,
    } = options;

    /**
     * Função que faz o fetch das FAQs
     * 
     * Construída com useCallback para memoização.
     * Só recria se os filtros mudarem.
     */
    const fetchFAQs = useCallback(async (): Promise<Result<FAQ[], APIError>> => {
        try {
            // Constrói query params baseado nos filtros
            // Similar a URLComponents no Swift
            const params = new URLSearchParams();

            if (filters.searchText) {
                params.append('search', filters.searchText);
            }

            if (filters.categories && filters.categories.length > 0) {
                // Por simplicidade, pegamos apenas a primeira categoria
                // Em produção, a API poderia aceitar múltiplas categorias
                params.append('category', filters.categories[0]);
            }

            if (filters.sortBy) {
                params.append('sortBy', filters.sortBy);
            }

            // Faz a requisição
            const queryString = params.toString();
            const url = `/api/faqs${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url);
            const json: APIResponse<FAQ[]> = await response.json();

            // Converte APIResponse para Result
            return ApiResponse.toResult(json);

        } catch (error) {
            // Erros de rede ou parsing
            return Result.err({
                code: 'NETWORK_ERROR',
                message: 'Erro ao conectar com o servidor',
                details: { originalError: error instanceof Error ? error.message : 'Unknown' },
            });
        }
    }, [filters]); // Recria apenas se filtros mudarem

    /**
     * Usa o hook useAsync para gerenciar a operação
     * 
     * immediate: true significa que executa automaticamente no mount
     */
    const {
        data,
        isLoading,
        error,
        execute
    } = useAsync(fetchFAQs, autoFetch);

    /**
     * Re-executa quando filtros mudarem
     * 
     * Similar a um Combine publisher que reage a mudanças no Swift:
     * $filters.sink { _ in fetchFAQs() }
     */
    useEffect(() => {
        if (autoFetch) {
            execute();
        }
    }, [filters.searchText, filters.categories, filters.sortBy, autoFetch, execute]);

    /**
     * FAQs memoizadas
     * Evita recriação do array a cada render
     */
    const faqs = useMemo(() => data || [], [data]);

    /**
     * Total de FAQs
     */
    const total = faqs.length;

    return {
        faqs,
        isLoading,
        error,
        refetch: execute,
        total,
    };
}

/**
 * Hook useFAQ (singular)
 * 
 * Busca uma FAQ específica por ID.
 * Similar ao useFAQs mas para item único.
 */
export function useFAQ(id: string | undefined): {
    faq: FAQ | undefined;
    isLoading: boolean;
    error: APIError | undefined;
    refetch: () => Promise<void>;
} {
    /**
     * Função que busca FAQ por ID
     */
    const fetchFAQ = useCallback(async (): Promise<Result<FAQ, APIError>> => {
        // Se não tem ID, retorna erro
        if (!id) {
            return Result.err({
                code: 'INVALID_REQUEST',
                message: 'ID da FAQ é obrigatório',
            });
        }

        try {
            const response = await fetch(`/api/faqs/${id}`);
            const json: APIResponse<FAQ> = await response.json();

            return ApiResponse.toResult(json);

        } catch (error) {
            return Result.err({
                code: 'NETWORK_ERROR',
                message: 'Erro ao conectar com o servidor',
                details: { originalError: error instanceof Error ? error.message : 'Unknown' },
            });
        }
    }, [id]);

    const { data, isLoading, error, execute } = useAsync(fetchFAQ, !!id);

    // Re-executa se ID mudar
    useEffect(() => {
        if (id) {
            execute();
        }
    }, [id, execute]);

    return {
        faq: data,
        isLoading,
        error,
        refetch: execute,
    };
}

/**
 * Exemplos de uso:
 * 
 * // 1. Buscar todas as FAQs
 * function FAQListScreen() {
 *     const { faqs, isLoading, error } = useFAQs();
 * 
 *     if (isLoading) return <LoadingSpinner />;
 *     if (error) return <ErrorMessage error={error} />;
 * 
 *     return <FAQList faqs={faqs} />;
 * }
 * 
 * // 2. Buscar com filtros
 * function FilteredFAQs() {
 *     const [searchText, setSearchText] = useState('');
 *     const [category, setCategory] = useState<FAQCategory | null>(null);
 * 
 *     const { faqs, isLoading } = useFAQs({
 *         filters: {
 *             searchText,
 *             categories: category ? [category] : [],
 *             sortBy: 'helpful',
 *         },
 *     });
 * 
 *     return (
 *         <>
 *             <SearchInput value={searchText} onChange={setSearchText} />
 *             <CategoryFilter value={category} onChange={setCategory} />
 *             {isLoading ? <LoadingSpinner /> : <FAQList faqs={faqs} />}
 *         </>
 *     );
 * }
 * 
 * // 3. FAQ individual
 * function FAQDetailScreen({ faqId }: Props) {
 *     const { faq, isLoading, error } = useFAQ(faqId);
 * 
 *     if (isLoading) return <LoadingSpinner />;
 *     if (error) return <ErrorMessage error={error} />;
 *     if (!faq) return <NotFound />;
 * 
 *     return <FAQDetail faq={faq} />;
 * }
 */
