/**
 * API Response Types
 * 
 * Padroniza as respostas da API seguindo REST best practices.
 * Similar ao padrão de Result<T, Error> mas específico para HTTP.
 * 
 * No Swift seria algo como:
 * struct APIResponse<T: Codable>: Codable {
 *     let success: Bool
 *     let data: T?
 *     let error: APIError?
 * }
 */

import { Result } from './Result';

/**
 * Estrutura de resposta da API
 * Genérica para suportar qualquer tipo de dados
 */
export interface APIResponse<T> {
    /** Se a operação foi bem-sucedida */
    success: boolean;

    /** Dados retornados (quando success = true) */
    data?: T;

    /** Mensagem de erro (quando success = false) */
    error?: APIError;

    /** Metadados adicionais (paginação, totais, etc) */
    meta?: APIResponseMeta;
}

/**
 * Estrutura de erro da API
 * Contém código e mensagem para tratamento no cliente
 */
export interface APIError {
    /** Código de erro (ex: 'NOT_FOUND', 'VALIDATION_ERROR') */
    code: string;

    /** Mensagem legível para o usuário */
    message: string;

    /** Detalhes adicionais (campos com erro, stack trace em dev, etc) */
    details?: Record<string, unknown>;
}

/**
 * Metadados da resposta
 * Útil para paginação e informações extras
 */
export interface APIResponseMeta {
    /** Total de itens (para listas) */
    total?: number;

    /** Página atual */
    page?: number;

    /** Itens por página */
    pageSize?: number;

    /** Timestamp do servidor */
    timestamp?: string;
}

/**
 * Requisição paginada
 * Para endpoints que retornam listas
 */
export interface PaginatedRequest {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Helper para criar respostas de sucesso
 * 
 * Uso:
 * return ApiResponse.success(data);
 */
export const ApiResponse = {
    /**
     * Cria resposta de sucesso
     * Similar a Result.ok() mas para HTTP
     */
    success<T>(data: T, meta?: APIResponseMeta): APIResponse<T> {
        return {
            success: true,
            data,
            meta,
        };
    },

    /**
     * Cria resposta de erro
     * Similar a Result.err() mas para HTTP
     */
    error<T = never>(code: string, message: string, details?: Record<string, unknown>): APIResponse<T> {
        return {
            success: false,
            error: {
                code,
                message,
                details,
            },
        };
    },

    /**
     * Converte APIResponse para Result<T, E>
     * Ponte entre o tipo HTTP e o tipo de domínio
     * 
     * Útil para usar com hooks que trabalham com Result
     */
    toResult<T>(response: APIResponse<T>): Result<T, APIError> {
        if (response.success && response.data !== undefined) {
            return Result.ok(response.data);
        }
        return Result.err(response.error || {
            code: 'UNKNOWN_ERROR',
            message: 'Erro desconhecido',
        });
    },
};

/**
 * Códigos de erro comuns
 * Enum-like object para type safety
 */
export const API_ERROR_CODES = {
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    SERVER_ERROR: 'SERVER_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
} as const;

/**
 * Type helper para códigos de erro
 */
export type APIErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES];
