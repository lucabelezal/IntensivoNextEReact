/**
 * Mock Data para FAQs
 * 
 * Base de dados simulada com perguntas sobre limite de cartão.
 * No app real, isso viria de uma API backend.
 */

import { FAQ } from '@/types/domain/FAQ';

/**
 * Lista de FAQs sobre limite de cartão
 */
export const MOCK_FAQS: FAQ[] = [
    {
        id: 'faq-1',
        question: 'Como aumentar o limite do meu cartão?',
        answer: `Para aumentar o limite do seu cartão, você pode:

1. **Usar a funcionalidade de aumento na tela inicial**
   - Acesse a tela de "Limite" no app
   - Defina o novo valor desejado
   - Confirme a solicitação

2. **Critérios para aprovação:**
   - Histórico de pagamentos em dia
   - Limite anterior utilizado adequadamente
   - Tempo mínimo de 6 meses com o cartão

3. **Tempo de análise:**
   - A análise é feita automaticamente
   - Resposta em até 48 horas úteis
   - Você receberá notificação no app

**Dica:** Manter um bom score de crédito aumenta suas chances de aprovação.`,
        category: 'limits',
        tags: ['limite', 'aumentar', 'cartão', 'crédito', 'aprovação'],
        helpfulCount: 234,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-11-20T15:30:00Z',
    },
    {
        id: 'faq-2',
        question: 'Qual o limite mínimo e máximo que posso solicitar?',
        answer: `Os limites variam de acordo com seu perfil:

**Limite Mínimo:**
- R$ 500,00 para novos clientes
- R$ 1.000,00 para clientes com mais de 6 meses

**Limite Máximo:**
- Até R$ 50.000,00 para pessoa física
- Análise baseada em renda e histórico
- Pode ser maior para clientes premium

**Como aumentar seu limite máximo:**
- Mantenha bom histórico de pagamentos
- Use o cartão regularmente
- Atualize suas informações de renda
- Solicite reavaliação a cada 6 meses`,
        category: 'limits',
        tags: ['limite', 'mínimo', 'máximo', 'valor', 'solicitar'],
        helpfulCount: 156,
        createdAt: '2024-02-01T11:00:00Z',
        updatedAt: '2024-11-19T16:45:00Z',
    },
    {
        id: 'faq-3',
        question: 'Por quanto tempo o limite aumentado fica disponível?',
        answer: `O aumento de limite tem validade variável:

**Aumento Permanente:**
- Aprovado após análise de crédito completa
- Fica disponível indefinidamente
- Pode ser usado a qualquer momento

**Aumento Temporário:**
- Válido por 30 dias
- Útil para compras específicas
- Retorna ao limite anterior após o período
- Disponível 1x a cada 3 meses

**Renovação:**
- Limites permanentes são revistos anualmente
- Você pode solicitar novo aumento após 6 meses
- Mudanças na situação financeira podem afetar o limite`,
        category: 'limits',
        tags: ['limite', 'duração', 'validade', 'temporário', 'permanente'],
        helpfulCount: 98,
        createdAt: '2024-02-10T14:00:00Z',
        updatedAt: '2024-11-20T10:15:00Z',
    },
    {
        id: 'faq-4',
        question: 'Minha solicitação foi negada, o que fazer?',
        answer: `Se seu pedido de aumento foi negado:

**Motivos comuns:**
- Histórico de atrasos nos pagamentos
- Score de crédito baixo
- Renda insuficiente
- Cartão usado há pouco tempo (menos de 6 meses)
- Limite atual subutilizado

**O que você pode fazer:**
1. Aguarde 90 dias para nova solicitação
2. Pague suas faturas sempre em dia
3. Utilize pelo menos 30% do limite atual
4. Atualize suas informações de renda
5. Consulte e melhore seu score de crédito

**Alternativas:**
- Solicite um limite temporário menor
- Use a função de parcelamento para compras grandes
- Entre em contato com o suporte para mais detalhes`,
        category: 'limits',
        tags: ['limite', 'negado', 'recusado', 'reprovado', 'tentar novamente'],
        helpfulCount: 187,
        createdAt: '2024-03-01T09:30:00Z',
        updatedAt: '2024-11-21T08:20:00Z',
    },
    {
        id: 'faq-5',
        question: 'Como funciona a análise de crédito para aumento?',
        answer: `A análise de crédito considera diversos fatores:

**Fatores avaliados:**
- Score de crédito (Serasa, SPC, etc)
- Histórico de pagamentos
- Renda mensal declarada
- Tempo de relacionamento com o banco
- Utilização do limite atual
- Dívidas em outras instituições

**Processo automático:**
- Análise feita em tempo real
- Algoritmo de IA avalia seu perfil
- Decisão em até 48 horas
- Não afeta negativamente seu score

**Dados necessários:**
- CPF atualizado
- Comprovante de renda recente
- Endereço atualizado
- Telefone e email válidos

**Transparência:**
- Você pode consultar o motivo da decisão
- Orientações para melhorar seu perfil
- Suporte disponível para dúvidas`,
        category: 'limits',
        tags: ['análise', 'crédito', 'score', 'aprovação', 'critérios'],
        helpfulCount: 145,
        createdAt: '2024-03-15T13:00:00Z',
        updatedAt: '2024-11-20T12:30:00Z',
    },
];

/**
 * Busca uma FAQ por ID
 */
export function findFAQById(id: string): FAQ | undefined {
    return MOCK_FAQS.find((faq) => faq.id === id);
}

/**
 * Filtra FAQs por categoria
 */
export function filterFAQsByCategory(category: string): FAQ[] {
    return MOCK_FAQS.filter((faq) => faq.category === category);
}

/**
 * Busca FAQs por texto (question, answer ou tags)
 */
export function searchFAQs(searchText: string): FAQ[] {
    const query = searchText.toLowerCase().trim();

    if (!query) {
        return MOCK_FAQS;
    }

    return MOCK_FAQS.filter((faq) => {
        const questionMatch = faq.question.toLowerCase().includes(query);
        const answerMatch = faq.answer.toLowerCase().includes(query);
        const tagsMatch = faq.tags.some((tag) =>
            tag.toLowerCase().includes(query)
        );

        return questionMatch || answerMatch || tagsMatch;
    });
}
