/**
 * API Route: GET /api/faqs
 * 
 * Retorna lista de todas as FAQs com filtros opcionais.
 * 
 * No Next.js, arquivos em pages/api/ automaticamente se tornam endpoints.
 * Similar a ter um @GET endpoint no Vapor (Swift server) ou Express.
 * 
 * Exemplo de chamada:
 * GET /api/faqs?category=limits&search=aumentar
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { FAQ, FAQCategory } from '@/types/domain/FAQ';
import { APIResponse, ApiResponse } from '@/types/APIResponse';
import { MOCK_FAQS, searchFAQs, filterFAQsByCategory } from '@/lib/mockData/faqs';

/**
 * Handler do endpoint
 * Similar a uma função async no Swift que retorna Result<[FAQ], Error>
 */
export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<APIResponse<FAQ[]>>
) {
    // Apenas GET é permitido
    if (req.method !== 'GET') {
        return res.status(405).json(
            ApiResponse.error('METHOD_NOT_ALLOWED', 'Apenas GET é permitido')
        );
    }

    try {
        // Extrai query params
        // Similar a URLComponents no Swift
        const {
            search,      // texto de busca
            category,    // filtro de categoria
            sortBy = 'helpful'  // ordenação (helpful, recent, alphabetical)
        } = req.query;

        let faqs = [...MOCK_FAQS]; // cópia para não mutar original

        // Aplica filtro de busca se fornecido
        if (search && typeof search === 'string') {
            faqs = searchFAQs(search);
        }

        // Aplica filtro de categoria se fornecido
        if (category && typeof category === 'string') {
            const categoryFaqs = filterFAQsByCategory(category as FAQCategory);
            // Intersecção dos resultados (se já tem busca, mantém apenas os que também são da categoria)
            if (search) {
                faqs = faqs.filter(faq => categoryFaqs.some(cf => cf.id === faq.id));
            } else {
                faqs = categoryFaqs;
            }
        }

        // Aplica ordenação
        if (sortBy === 'helpful') {
            faqs.sort((a, b) => b.helpfulCount - a.helpfulCount);
        } else if (sortBy === 'recent') {
            faqs.sort((a, b) =>
                new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
        } else if (sortBy === 'alphabetical') {
            faqs.sort((a, b) => a.question.localeCompare(b.question));
        }

        // Simula delay de rede (para testar loading states)
        // Remova em produção!
        const shouldDelay = process.env.NODE_ENV === 'development';
        if (shouldDelay) {
            return new Promise(resolve => {
                setTimeout(() => {
                    res.status(200).json(
                        ApiResponse.success(faqs, {
                            total: faqs.length,
                            timestamp: new Date().toISOString(),
                        })
                    );
                    resolve(undefined);
                }, 500); // 500ms de delay
            });
        }

        // Retorna resposta de sucesso
        res.status(200).json(
            ApiResponse.success(faqs, {
                total: faqs.length,
                timestamp: new Date().toISOString(),
            })
        );

    } catch (error) {
        // Em caso de erro inesperado
        console.error('Erro ao buscar FAQs:', error);

        res.status(500).json(
            ApiResponse.error(
                'SERVER_ERROR',
                'Erro ao buscar FAQs. Tente novamente.',
                { originalError: error instanceof Error ? error.message : 'Unknown' }
            )
        );
    }
}
