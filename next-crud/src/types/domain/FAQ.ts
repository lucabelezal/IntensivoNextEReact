/**
 * FAQ Domain Model
 * 
 * Similar a um model Codable no Swift:
 * struct FAQ: Codable, Identifiable {
 *     let id: String
 *     let question: String
 *     // ...
 * }
 * 
 * Representa uma pergunta frequente com seus metadados.
 */

export interface FAQ {
    /** ID único da FAQ (como UUID no Swift) */
    id: string;

    /** Pergunta do usuário */
    question: string;

    /** Resposta detalhada */
    answer: string;

    /** Categoria para filtros (ex: "Cartão", "Limites", "Segurança") */
    category: FAQCategory;

    /** Tags para busca (como keywords) */
    tags: string[];

    /** Número de pessoas que acharam útil */
    helpfulCount: number;

    /** Data de criação (ISO string para facilitar serialização) */
    createdAt: string;

    /** Data da última atualização */
    updatedAt: string;
}

/**
 * Categorias disponíveis para FAQs
 * 
 * Enum similar ao Swift:
 * enum FAQCategory: String, CaseIterable {
 *     case card = "Cartão"
 *     case limits = "Limites"
 * }
 */
export type FAQCategory =
    | 'card'      // Cartão
    | 'limits'    // Limites
    | 'security'  // Segurança
    | 'payments'  // Pagamentos
    | 'account'   // Conta
    | 'app';      // Aplicativo

/**
 * Metadados de uma categoria
 * Para exibir chips/filters na UI
 */
export interface FAQCategoryInfo {
    id: FAQCategory;
    label: string;
    icon: string; // emoji ou nome de ícone
    color: string; // cor hex para UI
}

/**
 * Mapeamento de categorias para UI
 * Similar a um Dictionary<FAQCategory, Info> no Swift
 */
export const FAQ_CATEGORIES: Record<FAQCategory, FAQCategoryInfo> = {
    card: {
        id: 'card',
        label: 'Cartão',
        icon: '💳',
        color: '#3B82F6', // blue-500
    },
    limits: {
        id: 'limits',
        label: 'Limites',
        icon: '📊',
        color: '#8B5CF6', // violet-500
    },
    security: {
        id: 'security',
        label: 'Segurança',
        icon: '🔒',
        color: '#EF4444', // red-500
    },
    payments: {
        id: 'payments',
        label: 'Pagamentos',
        icon: '💰',
        color: '#10B981', // green-500
    },
    account: {
        id: 'account',
        label: 'Conta',
        icon: '👤',
        color: '#F59E0B', // amber-500
    },
    app: {
        id: 'app',
        label: 'Aplicativo',
        icon: '📱',
        color: '#6366F1', // indigo-500
    },
};

/**
 * Filtros de busca para FAQs
 * Similar a uma struct de configuração no Swift
 */
export interface FAQFilters {
    /** Texto de busca (procura em question, answer e tags) */
    searchText: string;

    /** Categorias selecionadas (vazio = todas) */
    categories: FAQCategory[];

    /** Ordenação */
    sortBy: 'recent' | 'helpful' | 'alphabetical';
}

/**
 * Estado inicial dos filtros
 */
export const INITIAL_FAQ_FILTERS: FAQFilters = {
    searchText: '',
    categories: [],
    sortBy: 'helpful',
};
