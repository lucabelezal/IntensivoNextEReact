/**
 * Result Type - Inspirado no Swift Result<Success, Failure>
 * 
 * Usado para operações que podem falhar de forma previsível.
 * Força o tratamento explícito de erros em compile-time.
 */

export type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

/**
 * Helpers para trabalhar com Result
 */
export const Result = {
    ok<T>(data: T): Result<T, never> {
        return { success: true, data };
    },

    err<E>(error: E): Result<never, E> {
        return { success: false, error };
    },

    /**
     * Transforma o valor dentro de um Result (como map do Swift)
     */
    map<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
        if (result.success) {
            return Result.ok(fn(result.data));
        }
        return result as Result<U, E>;
    },

    /**
     * Extrai o valor ou lança erro (use com cautela!)
     */
    unwrap<T, E>(result: Result<T, E>): T {
        if (result.success) {
            return result.data;
        }
        const errorResult = result as { success: false; error: E };
        throw new Error(String(errorResult.error));
    },
};
