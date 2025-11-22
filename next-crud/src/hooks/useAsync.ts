/**
 * useAsync Hook
 * 
 * Hook genérico para operações assíncronas com estados de loading/error.
 * Similar a ter um @Published var no Swift com estados de loading.
 * 
 * Inspirado no padrão AsyncResult do Swift:
 * enum AsyncResult<T> {
 *     case idle
 *     case loading
 *     case success(T)
 *     case failure(Error)
 * }
 * 
 * Uso:
 * const { data, isLoading, error, execute } = useAsync(fetchData);
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Result } from '@/types/Result';

/**
 * Estados possíveis de uma operação assíncrona
 * Similar a um enum com associated values no Swift
 */
export type AsyncState<T, E = Error> =
    | { status: 'idle' }                    // Ainda não executou
    | { status: 'loading' }                 // Executando
    | { status: 'success'; data: T }        // Sucesso com dados
    | { status: 'error'; error: E };        // Erro

/**
 * Retorno do hook useAsync
 */
export interface UseAsyncReturn<T, E = Error> {
    /** Dados retornados (undefined se não executou ou falhou) */
    data: T | undefined;

    /** Se está executando */
    isLoading: boolean;

    /** Erro (undefined se não falhou) */
    error: E | undefined;

    /** Estado completo (para pattern matching) */
    state: AsyncState<T, E>;

    /** Executa a operação async */
    execute: (...args: Parameters<AsyncFunction<T, E>>) => Promise<void>;

    /** Reseta o estado para idle */
    reset: () => void;
}

/**
 * Tipo de função assíncrona que retorna Result
 */
type AsyncFunction<T, E = Error> = (...args: any[]) => Promise<Result<T, E>>;

/**
 * Hook useAsync
 * 
 * Gerencia o ciclo de vida completo de uma operação assíncrona:
 * 1. idle -> loading -> success/error
 * 2. Cancela se componente desmontar durante loading
 * 3. Previne race conditions
 * 
 * @param asyncFunction Função que retorna Promise<Result<T, E>>
 * @param immediate Se deve executar imediatamente (default: false)
 */
export function useAsync<T, E = Error>(
    asyncFunction: AsyncFunction<T, E>,
    immediate = false
): UseAsyncReturn<T, E> {
    // Estado da operação async
    const [state, setState] = useState<AsyncState<T, E>>({ status: 'idle' });

    // Ref para cancelar se componente desmontar
    // Similar a usar Task com cancellation no Swift
    const isMountedRef = useRef(true);

    // Ref para rastrear a última execução (previne race conditions)
    const executionCountRef = useRef(0);

    /**
     * Executa a função assíncrona
     * useCallback garante referência estável (importante para useEffect)
     */
    const execute = useCallback(
        async (...args: Parameters<AsyncFunction<T, E>>) => {
            // Incrementa contador de execução
            const currentExecution = ++executionCountRef.current;

            // Muda para loading
            setState({ status: 'loading' });

            try {
                // Executa a função async
                const result = await asyncFunction(...args);

                // Checa se ainda está montado E se é a execução mais recente
                // Previne race condition onde uma chamada mais antiga completa depois de uma nova
                if (!isMountedRef.current || currentExecution !== executionCountRef.current) {
                    return;
                }

                // Atualiza estado baseado no Result
                if (result.success) {
                    setState({ status: 'success', data: result.data });
                } else {
                    // Type assertion necessário por causa do discriminated union
                    const errorResult = result as { success: false; error: E };
                    setState({ status: 'error', error: errorResult.error });
                }
            } catch (error) {
                // Trata erros não esperados (que não retornaram Result.err)
                if (!isMountedRef.current || currentExecution !== executionCountRef.current) {
                    return;
                }

                setState({
                    status: 'error',
                    error: error as E
                });
            }
        },
        [asyncFunction]
    );

    /**
     * Reseta o estado para idle
     * Útil para limpar após sucesso/erro
     */
    const reset = useCallback(() => {
        setState({ status: 'idle' });
    }, []);

    // Executa imediatamente se requested
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    // Cleanup: marca como desmontado
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Helpers derivados do state (para conveniência)
    const data = state.status === 'success' ? state.data : undefined;
    const isLoading = state.status === 'loading';
    const error = state.status === 'error' ? state.error : undefined;

    return {
        data,
        isLoading,
        error,
        state,
        execute,
        reset,
    };
}

/**
 * Exemplo de uso:
 * 
 * // 1. Defina a função async
 * async function fetchUser(id: string): Promise<Result<User, APIError>> {
 *     const res = await fetch(`/api/users/${id}`);
 *     const json = await res.json();
 *     return ApiResponse.toResult(json);
 * }
 * 
 * // 2. Use o hook
 * function UserProfile({ userId }: Props) {
 *     const { data, isLoading, error, execute } = useAsync(fetchUser);
 * 
 *     useEffect(() => {
 *         execute(userId);
 *     }, [userId, execute]);
 * 
 *     if (isLoading) return <Spinner />;
 *     if (error) return <Error message={error.message} />;
 *     if (!data) return null;
 * 
 *     return <div>{data.name}</div>;
 * }
 */
