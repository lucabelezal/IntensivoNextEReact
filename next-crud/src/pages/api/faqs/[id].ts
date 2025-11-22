/**
 * API Route: GET /api/faqs/[id]
 * 
 * Retorna uma FAQ específica por ID.
 * 
 * Dynamic route no Next.js - [id] vira um parâmetro da URL.
 * Similar a ter uma rota "/faqs/:id" no Express ou Vapor.
 * 
 * Exemplo de chamada:
 * GET /api/faqs/faq-1
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { FAQ } from '@/types/domain/FAQ';
import { APIResponse, ApiResponse } from '@/types/APIResponse';
import { findFAQById } from '@/lib/mockData/faqs';

/**
 * Handler do endpoint
 * Similar a uma função async que retorna Result<FAQ, Error> no Swift
 */
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIResponse<FAQ>>
) {
    // Apenas GET é permitido
    if (req.method !== 'GET') {
        return res.status(405).json(
            ApiResponse.error('METHOD_NOT_ALLOWED', 'Apenas GET é permitido')
        );
    }

    try {
        // Extrai o ID da URL
        // req.query.id vem do nome do arquivo [id].ts
        const { id } = req.query;

        // Validação: ID deve existir e ser string
        if (!id || typeof id !== 'string') {
            return res.status(400).json(
                ApiResponse.error(
                    'INVALID_REQUEST',
                    'ID da FAQ é obrigatório e deve ser uma string'
                )
            );
        }

        // Busca a FAQ no mock data
        const faq = findFAQById(id);

        // Se não encontrou, retorna 404
        if (!faq) {
            return res.status(404).json(
                ApiResponse.error(
                    'NOT_FOUND',
                    `FAQ com ID "${id}" não foi encontrada`,
                    { requestedId: id }
                )
            );
        }

        // Simula delay de rede (para testar loading states)
        // Remova em produção!
        const shouldDelay = process.env.NODE_ENV === 'development';
        if (shouldDelay) {
            return new Promise(resolve => {
                setTimeout(() => {
                    res.status(200).json(
                        ApiResponse.success(faq, {
                            timestamp: new Date().toISOString(),
                        })
                    );
                    resolve(undefined);
                }, 300); // 300ms de delay
            });
        }

        // Retorna a FAQ encontrada
        res.status(200).json(
            ApiResponse.success(faq, {
                timestamp: new Date().toISOString(),
            })
        );

    } catch (error) {
        // Em caso de erro inesperado
        console.error('Erro ao buscar FAQ:', error);

        res.status(500).json(
            ApiResponse.error(
                'SERVER_ERROR',
                'Erro ao buscar FAQ. Tente novamente.',
                { originalError: error instanceof Error ? error.message : 'Unknown' }
            )
        );
    }
}
