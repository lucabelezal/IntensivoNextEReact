# 💳 Card Limit Manager

Aplicação para gerenciamento de limite de cartão, construída com Next.js, React e TypeScript seguindo as melhores práticas.

## 🚀 Tecnologias

- **Next.js 16** - Framework React com SSR
- **React 19** - Biblioteca UI  
- **TypeScript 5.9** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **CSS Modules** - Estilos com escopo local

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ActionButtons/   # Botões de ação (Cancelar/Salvar)
│   ├── CardLimitInput/  # Input de limite com formatação
│   ├── LimitInfo/       # Display de informações (Compound Components)
│   └── Toast/           # Sistema de notificações
├── contexts/            # React Context (estado global)
│   └── ToastContext.tsx # Context API para toasts
├── hooks/               # Custom hooks
│   ├── useCardLimit.ts  # Hook com useReducer para lógica de limite
│   └── useViewportKeyboard.ts # Detecção de teclado mobile
├── lib/                 # Utilitários e helpers
│   ├── constants.ts     # Constantes da aplicação
│   └── utils/
│       └── formatters.ts # Funções de formatação
├── pages/               # Páginas Next.js
│   ├── _app.tsx         # App wrapper com providers
│   ├── index.tsx        # Página inicial
│   └── api/             # API routes
├── styles/              # Estilos globais
└── types/               # Definições de tipos
    ├── domain/          # Domain models
    │   └── CardLimit.ts # Modelo e lógica de negócio
    └── Result.ts        # Result type (Swift-like)
```

## 🎯 Conceitos Aplicados

### Architecture Patterns
- ✅ **Domain-Driven Design** - Lógica de negócio isolada
- ✅ **Separation of Concerns** - Componentes presentacionais vs lógica
- ✅ **Compound Components** - Composição flexível (LimitInfo)
- ✅ **Provider Pattern** - Context API para estado global

### React Patterns
- ✅ **useReducer** - Gerenciamento de estado complexo
- ✅ **Custom Hooks** - Lógica reutilizável encapsulada
- ✅ **Memoization** - React.memo, useCallback, useMemo
- ✅ **Discriminated Unions** - Type-safe state management

### TypeScript
- ✅ **Strict Mode** - Tipagem rigorosa
- ✅ **Readonly Types** - Imutabilidade
- ✅ **Result Type** - Error handling funcional
- ✅ **Type Guards** - Type narrowing seguro

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build            # Cria build de produção
npm start                # Inicia servidor de produção

# Code Quality
npm run lint             # Verifica problemas de linting
npm run lint:fix         # Corrige problemas automaticamente
npm run format           # Formata código com Prettier
npm run format:check     # Verifica formatação
npm run type-check       # Valida tipos TypeScript

# Limpeza
npm run clean            # Remove arquivos de cache
```

## 📚 Guias de Estudo

- **[PLANO_DE_ESTUDOS.md](./PLANO_DE_ESTUDOS.md)** - Plano completo de 4 semanas
- **[REFATORACAO_GUIA.md](./REFATORACAO_GUIA.md)** - Guia detalhado da refatoração
- **[REFATORACAO_RESUMO.md](./REFATORACAO_RESUMO.md)** - Comparações before/after
- **[EXEMPLOS_PRATICOS.md](./EXEMPLOS_PRATICOS.md)** - Casos de uso reais

## 🎨 Padrões de Código

### Nomenclatura
- **Componentes**: PascalCase (ex: `CardLimitInput`)
- **Hooks**: camelCase com prefixo `use` (ex: `useCardLimit`)
- **Types/Interfaces**: PascalCase (ex: `CardLimit`)
- **Funções**: camelCase (ex: `formatMoney`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `CARD_LIMIT.DEFAULT_MAX`)

### Organização de Arquivos
```
Component/
├── index.ts              # Barrel export
├── Component.tsx         # Implementação
├── Component.module.css  # Estilos
└── Component.test.tsx    # Testes (futuro)
```

### Ordem de Imports
```typescript
// 1. React e bibliotecas externas
import { useState } from 'react';

// 2. Contexts e hooks
import { useToast } from '@/contexts/ToastContext';

// 3. Componentes
import { CardLimitInput } from '@/components/CardLimitInput';

// 4. Utils e tipos
import { formatMoney } from '@/lib/utils/formatters';
import type { CardLimit } from '@/types/domain/CardLimit';

// 5. Estilos
import styles from './Component.module.css';
```

## 🔧 Configuração

### ESLint
Configurado com regras para Next.js e TypeScript:
- Sem `any` implícito
- Warnings para `console.log`
- Rules of Hooks enforcement
- Imports organizados

### Prettier
Formatação consistente:
- Single quotes
- Tab width: 4 espaços
- Trailing commas
- Max line length: 100

## 🎓 Paralelos com iOS/Swift

| React/TypeScript | iOS/Swift |
|------------------|-----------|
| Context API | @EnvironmentObject |
| useReducer | TCA (Composable Architecture) |
| React.memo | @Observable / @State |
| Custom Hooks | Property Wrappers |
| Result Type | Swift Result<Success, Failure> |
| Readonly | struct (value types) |

## 🚦 Próximos Passos

- [ ] Adicionar testes unitários (Jest + Testing Library)
- [ ] Implementar Error Boundaries
- [ ] Adicionar service layer para API
- [ ] Implementar persistência (localStorage)
- [ ] Adicionar loading states
- [ ] Criar mais hooks utilitários (useAsync, useDebounce)

## 📝 Licença

MIT

---

**Desenvolvido como projeto de estudo** para aprender boas práticas de React, TypeScript e arquitetura front-end.
