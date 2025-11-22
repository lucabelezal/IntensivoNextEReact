# 📚 Plano de Estudos - React/TypeScript para Desenvolvedor iOS

## 🎯 Visão Geral do Projeto Atual

Este projeto é uma aplicação Next.js para gerenciamento de limite de cartão. Análise revelou:

### ✅ Pontos Positivos
- Hooks customizados bem extraídos (`useLimitForm`, `useToast`, `useViewportKeyboard`)
- Separação de lógica de negócio da apresentação
- TypeScript configurado
- CSS Modules para encapsulamento de estilos

### ⚠️ Oportunidades de Melhoria (Seu Aprendizado)
1. **Estado Global** - Toast e teclado gerenciados localmente, mas poderiam ser globais
2. **Composição** - Componentes ainda acoplados (ex: `ActionButtons` conhece `FixedAboveKeyboard`)
3. **Type Safety** - Uso de `any` implícito, tipos poderiam ser mais estritos
4. **Performance** - Re-renders desnecessários, falta memoization
5. **Arquitetura** - Falta camada de serviços/API, tipos de domínio misturados com UI
6. **Testing** - Sem testes unitários ou de integração

---

## 📖 Módulos de Estudo

### **MÓDULO 1: Fundamentos TypeScript & JavaScript Moderno** ⏱️ 2-3 dias
**Objetivo**: Dominar tipagem estática, inferência e padrões TypeScript

#### 1.1 Tipos Avançados
**O que aprender:**
```typescript
// ❌ Estado atual (implícito/permissivo)
const [toast, setToast] = useState<ToastState>({
  message: '',
  type: 'info',
  isVisible: false,
  position: 'bottom',
});

// ✅ Melhor: usar tipos discriminados (union types)
type ToastState = 
  | { status: 'hidden' }
  | { 
      status: 'visible';
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      position: 'top' | 'bottom';
    };

// Benefício: TypeScript força você a checar o status antes de acessar message
```

**Paralelo com iOS:**
- Union types = Swift `enum` com associated values
- Generics = Swift Generics
- Utility types = Swift property wrappers

**Exercícios Práticos:**
1. Refatorar `ToastState` para usar discriminated unions
2. Criar tipo `Result<T, E>` (como Swift) para operações assíncronas
3. Implementar `Brand Types` para validação compile-time (ex: `ValidatedLimit`)

**Recursos:**
- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Matt Pocock - TypeScript Tips](https://www.totaltypescript.com/)

---

### **MÓDULO 2: Gerenciamento de Estado Avançado** ⏱️ 3-4 dias
**Objetivo**: Entender quando usar Context, Reducers, e state managers externos

#### 2.1 Context API vs Props Drilling
**Problema Atual:**
```tsx
// index.tsx - Toast gerenciado localmente
const { toast, hideToast, success } = useToast();

// Problema: cada página precisa declarar seu próprio toast
// Se quiser mostrar toast de qualquer lugar -> não funciona
```

**Solução: Context API**
```typescript
// contexts/ToastContext.tsx
import { createContext, useContext, ReactNode } from 'react';

type ToastContextValue = {
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toastState = useToast(); // nosso hook existente
  
  return (
    <ToastContext.Provider value={toastState}>
      {children}
      <Toast {...toastState.toast} onClose={toastState.hideToast} />
    </ToastContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToastContext deve ser usado dentro de ToastProvider');
  return context;
}
```

**Paralelo com iOS:**
- Context API = `@EnvironmentObject` do SwiftUI ou Singleton pattern
- Provider = Root View com `.environmentObject()`
- Consumer = Views que acessam `@EnvironmentObject`

#### 2.2 useReducer para Estados Complexos
**Quando usar:**
- Estado com múltiplas sub-propriedades
- Lógica de atualização complexa
- Necessidade de "undo/redo"

**Refatoração do `useLimitForm`:**
```typescript
// hooks/useLimitForm.ts - VERSÃO COM REDUCER

type LimitFormState = {
  inputValue: string;
  numericValue: number;
  errors: string[];
  touched: boolean;
};

type LimitFormAction =
  | { type: 'SET_VALUE'; payload: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' }
  | { type: 'SET_TOUCHED' };

function limitFormReducer(state: LimitFormState, action: LimitFormAction): LimitFormState {
  switch (action.type) {
    case 'SET_VALUE': {
      const digits = action.payload.replace(/\D/g, '');
      const numeric = digitsToReais(digits);
      return { ...state, inputValue: digits, numericValue: numeric };
    }
    case 'VALIDATE': {
      // lógica de validação isolada
      const errors = validateLimit(state.numericValue);
      return { ...state, errors };
    }
    case 'RESET': {
      return initialState;
    }
    case 'SET_TOUCHED': {
      return { ...state, touched: true };
    }
    default:
      return state;
  }
}
```

**Paralelo com iOS:**
- Reducer = pattern Redux/TCA (The Composable Architecture)
- Actions = Swift enums para representar eventos
- Reducer function = `reduce(into:_:)` do Swift

#### 2.3 State Managers Externos (Zustand)
**Quando usar:**
- Estado compartilhado entre múltiplas páginas
- Necessidade de persistência (localStorage)
- Lógica de negócio complexa

**Exemplo: Store de Limite de Cartão**
```typescript
// stores/cardLimitStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CardLimitState {
  totalLimit: number;
  usedLimit: number;
  pendingLimit: number | null;
  
  // Actions
  setPendingLimit: (value: number) => void;
  confirmLimit: () => Promise<void>;
  cancelLimit: () => void;
}

export const useCardLimitStore = create<CardLimitState>()(
  persist(
    (set, get) => ({
      totalLimit: 10000,
      usedLimit: 4000,
      pendingLimit: null,
      
      setPendingLimit: (value) => set({ pendingLimit: value }),
      
      confirmLimit: async () => {
        const { pendingLimit } = get();
        if (!pendingLimit) return;
        
        // chamada API aqui
        await api.updateLimit(pendingLimit);
        
        set({ totalLimit: pendingLimit, pendingLimit: null });
      },
      
      cancelLimit: () => set({ pendingLimit: null }),
    }),
    { name: 'card-limit-storage' }
  )
);
```

**Paralelo com iOS:**
- Zustand = ObservableObject + @Published (sem Combine)
- Store = ViewModel no MVVM
- Persist middleware = UserDefaults/CoreData

**Exercícios Práticos:**
1. Migrar Toast para Context API global
2. Refatorar `useLimitForm` para usar `useReducer`
3. Criar store Zustand para gerenciar histórico de limites
4. Implementar undo/redo com `useReducer`

**Recursos:**
- [React Docs - Context](https://react.dev/learn/passing-data-deeply-with-context)
- [React Docs - useReducer](https://react.dev/reference/react/useReducer)
- [Zustand](https://github.com/pmndrs/zustand)

---

### **MÓDULO 3: Composição de Componentes & Patterns** ⏱️ 3-4 dias
**Objetivo**: Criar componentes reutilizáveis, flexíveis e testáveis

#### 3.1 Compound Components Pattern
**Problema Atual:**
```tsx
// LimitInfo recebe props individuais - pouco flexível
<LimitInfo total={totalLimit} used={usedLimit} />
```

**Solução: Compound Components**
```tsx
// components/LimitInfo/index.tsx
import { createContext, useContext, ReactNode } from 'react';

type LimitInfoContextValue = {
  total: number;
  used: number;
  available: number;
};

const LimitInfoContext = createContext<LimitInfoContextValue | null>(null);

function LimitInfo({ total, used, children }: { 
  total: number; 
  used: number; 
  children: ReactNode;
}) {
  const available = total - used;
  
  return (
    <LimitInfoContext.Provider value={{ total, used, available }}>
      <div className={styles.container}>
        {children}
      </div>
    </LimitInfoContext.Provider>
  );
}

LimitInfo.Row = function LimitInfoRow({ 
  label, 
  type 
}: { 
  label: string; 
  type: 'total' | 'used' | 'available'; 
}) {
  const context = useContext(LimitInfoContext);
  if (!context) throw new Error('LimitInfo.Row must be used within LimitInfo');
  
  const value = context[type];
  
  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}:</span>
      <span className={styles.value}>R$ {value.toLocaleString()}</span>
    </div>
  );
};

// Uso mais flexível:
<LimitInfo total={10000} used={4000}>
  <LimitInfo.Row label="Limite Total" type="total" />
  <LimitInfo.Row label="Em Uso" type="used" />
  <LimitInfo.Row label="Disponível" type="available" />
  {/* Pode adicionar outros elementos aqui facilmente */}
  <div className="my-custom-footer">...</div>
</LimitInfo>
```

**Paralelo com iOS:**
- Compound Components = SwiftUI `ViewBuilder` patterns
- Context interno = `@Environment` privado
- Subcomponentes = `static var` em SwiftUI Views

#### 3.2 Render Props & Children as Function
**Uso: Compartilhar lógica mantendo controle sobre renderização**

```tsx
// components/KeyboardAware/index.tsx
import { ReactNode } from 'react';
import useViewportKeyboard from '@/hooks/useViewportKeyboard';

type KeyboardAwareProps = {
  children: (params: { 
    isKeyboardOpen: boolean; 
    keyboardHeight: number;
  }) => ReactNode;
};

export function KeyboardAware({ children }: KeyboardAwareProps) {
  const { isKeyboardOpen, bottomOffset } = useViewportKeyboard();
  
  return <>{children({ isKeyboardOpen, keyboardHeight: bottomOffset })}</>;
}

// Uso:
<KeyboardAware>
  {({ isKeyboardOpen, keyboardHeight }) => (
    <div style={{ paddingBottom: isKeyboardOpen ? keyboardHeight : 0 }}>
      <input />
    </div>
  )}
</KeyboardAware>
```

#### 3.3 Higher-Order Components (HOCs) - Legacy mas útil conhecer
```typescript
// hocs/withLoading.tsx
function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent({ 
    isLoading, 
    ...props 
  }: P & { isLoading: boolean }) {
    if (isLoading) return <div>Loading...</div>;
    return <Component {...(props as P)} />;
  };
}

// Uso:
const LimitInfoWithLoading = withLoading(LimitInfo);
```

**Paralelo com iOS:**
- HOC = Swift property wrapper ou decorator pattern
- Render props = SwiftUI `@ViewBuilder` closures

**Exercícios Práticos:**
1. Refatorar `LimitInfo` para usar Compound Components
2. Criar `<Form>` component com validação usando render props
3. Criar HOC `withErrorBoundary` para capturar erros
4. Implementar `<KeyboardAvoidingView>` reutilizável

**Recursos:**
- [Patterns.dev - Compound Pattern](https://www.patterns.dev/posts/compound-pattern)
- [Kent C. Dodds - Compound Components](https://kentcdodds.com/blog/compound-components-with-react-hooks)

---

### **MÓDULO 4: Performance & Otimização** ⏱️ 2-3 dias
**Objetivo**: Eliminar re-renders desnecessários e otimizar bundle size

#### 4.1 Memoization com React.memo, useMemo, useCallback
**Problema Atual:**
```tsx
// Home re-renderiza tudo quando toast muda
function Home() {
  const { toast, success } = useToast();
  
  const handleSave = () => {
    success('Salvo!'); // causa re-render de TUDO
  };
  
  return (
    <>
      <CardLimitInput />  {/* re-renderiza sem necessidade */}
      <LimitInfo />       {/* re-renderiza sem necessidade */}
      <ActionButtons />   {/* re-renderiza sem necessidade */}
      <Toast {...toast} />
    </>
  );
}
```

**Solução:**
```tsx
import { memo, useCallback, useMemo } from 'react';

// 1. Memoizar componentes puros
const CardLimitInput = memo(function CardLimitInput({ value, onChange }) {
  // ...
});

const LimitInfo = memo(function LimitInfo({ total, used }) {
  // ...
});

// 2. Estabilizar callbacks
function Home() {
  const { toast, success } = useToast();
  
  const handleSave = useCallback(() => {
    success('Salvo!');
  }, [success]); // success deve ser estável (useCallback no hook)
  
  const handleCancel = useCallback(() => {
    alert('Cancelado');
  }, []);
  
  // 3. Memoizar cálculos pesados
  const validationRules = useMemo(() => ({
    minLimit: usedLimit,
    maxLimit: 50000,
    step: 100,
  }), [usedLimit]);
  
  return (/* ... */);
}
```

**Paralelo com iOS:**
- `React.memo` = `Equatable` do SwiftUI para evitar re-render
- `useMemo` = `@State` computed property com cache
- `useCallback` = `@State` closure que não causa view updates

#### 4.2 Code Splitting & Lazy Loading
```tsx
// pages/index.tsx
import { lazy, Suspense } from 'react';

// Lazy load componentes pesados
const HeavyChart = lazy(() => import('@/components/HeavyChart'));

function Home() {
  return (
    <>
      <CardLimitInput />
      
      <Suspense fallback={<div>Carregando gráfico...</div>}>
        <HeavyChart data={chartData} />
      </Suspense>
    </>
  );
}
```

#### 4.3 React DevTools Profiler
**Ferramenta essencial para debug de performance:**
1. Instalar React DevTools (Chrome/Firefox)
2. Abrir aba "Profiler"
3. Gravar interação (ex: digitar no input)
4. Analisar componentes que renderizaram e por quê

**Exercícios Práticos:**
1. Usar React DevTools para identificar re-renders desnecessários
2. Aplicar `memo` em todos os componentes folha
3. Estabilizar todos os callbacks com `useCallback`
4. Implementar code splitting para `Toast` animations
5. Criar custom hook `useDebounce` para input do limite

**Recursos:**
- [React Docs - Performance](https://react.dev/learn/render-and-commit)
- [Web.dev - React Performance](https://web.dev/react/)

---

### **MÓDULO 5: Arquitetura & Separação de Responsabilidades** ⏱️ 4-5 dias
**Objetivo**: Aplicar Clean Architecture e Design Patterns

#### 5.1 Estrutura de Pastas Proposta
```
src/
├── app/                    # Next.js 13+ app directory
│   ├── layout.tsx
│   └── page.tsx
├── components/             # UI Components
│   ├── ui/                # Design System (Button, Input, etc)
│   ├── features/          # Feature-specific components
│   │   └── card-limit/
│   │       ├── CardLimitForm.tsx
│   │       ├── CardLimitDisplay.tsx
│   │       └── index.ts
│   └── layout/            # Layout components
├── hooks/                 # Custom hooks
│   ├── useCardLimit.ts
│   └── useToast.ts
├── lib/                   # Business logic & utilities
│   ├── api/              # API clients
│   │   └── cardLimitApi.ts
│   ├── services/         # Business logic
│   │   └── cardLimitService.ts
│   ├── validators/       # Validation logic
│   │   └── limitValidators.ts
│   └── utils/            # Pure functions
│       └── formatters.ts
├── types/                # TypeScript types
│   ├── domain/           # Domain models
│   │   └── CardLimit.ts
│   └── api/              # API types
│       └── responses.ts
├── stores/               # State management (Zustand/Context)
│   └── cardLimitStore.ts
└── styles/               # Global styles
```

#### 5.2 Camadas de Abstração

**Camada 1: Domain (Entidades de Negócio)**
```typescript
// types/domain/CardLimit.ts
export type CardLimit = {
  readonly id: string;
  readonly userId: string;
  readonly currentLimit: number;
  readonly usedAmount: number;
  readonly availableAmount: number;
  readonly lastUpdated: Date;
};

// Métodos de domínio (business logic)
export const CardLimitDomain = {
  canIncreaseTo(limit: CardLimit, newAmount: number): boolean {
    return newAmount >= limit.usedAmount && newAmount <= 50000;
  },
  
  calculateFee(limit: CardLimit, newAmount: number): number {
    const increase = newAmount - limit.currentLimit;
    return increase > 0 ? increase * 0.01 : 0; // 1% de taxa
  },
  
  isValid(limit: CardLimit): limit is CardLimit {
    return limit.currentLimit >= limit.usedAmount;
  },
};
```

**Paralelo com iOS:**
- Domain model = Swift `struct` com computed properties
- Domain methods = Extension methods no Swift
- Readonly = `let` properties

**Camada 2: Services (Lógica de Aplicação)**
```typescript
// lib/services/cardLimitService.ts
import { CardLimit, CardLimitDomain } from '@/types/domain/CardLimit';
import * as api from '@/lib/api/cardLimitApi';

export class CardLimitService {
  async getCurrentLimit(): Promise<CardLimit> {
    const response = await api.fetchCurrentLimit();
    // Transformar resposta da API em domain model
    return {
      id: response.id,
      userId: response.user_id,
      currentLimit: response.current_limit,
      usedAmount: response.used_amount,
      availableAmount: response.current_limit - response.used_amount,
      lastUpdated: new Date(response.updated_at),
    };
  }
  
  async updateLimit(newAmount: number): Promise<Result<CardLimit, Error>> {
    try {
      const current = await this.getCurrentLimit();
      
      // Validar usando domain logic
      if (!CardLimitDomain.canIncreaseTo(current, newAmount)) {
        return { ok: false, error: new Error('Limite inválido') };
      }
      
      const response = await api.updateLimit(newAmount);
      const updated = await this.getCurrentLimit();
      
      return { ok: true, value: updated };
    } catch (error) {
      return { ok: false, error: error as Error };
    }
  }
}

// Singleton instance
export const cardLimitService = new CardLimitService();

// Result type (como Swift)
type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; error: E };
```

**Paralelo com iOS:**
- Service = Repository pattern ou UseCase no Clean Architecture
- Result type = Swift `Result<Success, Failure>`

**Camada 3: API Client**
```typescript
// lib/api/cardLimitApi.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiResponse<T> = {
  data: T;
  error?: string;
};

type CardLimitResponse = {
  id: string;
  user_id: string;
  current_limit: number;
  used_amount: number;
  updated_at: string;
};

export async function fetchCurrentLimit(): Promise<CardLimitResponse> {
  const response = await fetch(`${BASE_URL}/card-limit`, {
    headers: { 'Content-Type': 'application/json' },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
  
  const json: ApiResponse<CardLimitResponse> = await response.json();
  if (json.error) throw new Error(json.error);
  
  return json.data;
}

export async function updateLimit(newLimit: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/card-limit`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_limit: newLimit }),
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }
}
```

**Camada 4: Presentation (Hooks & Components)**
```typescript
// hooks/useCardLimit.ts
import { useState, useEffect } from 'react';
import { cardLimitService } from '@/lib/services/cardLimitService';
import { CardLimit } from '@/types/domain/CardLimit';

export function useCardLimit() {
  const [limit, setLimit] = useState<CardLimit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    loadLimit();
  }, []);
  
  async function loadLimit() {
    setIsLoading(true);
    try {
      const data = await cardLimitService.getCurrentLimit();
      setLimit(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }
  
  async function updateLimit(newAmount: number) {
    setIsLoading(true);
    const result = await cardLimitService.updateLimit(newAmount);
    
    if (result.ok) {
      setLimit(result.value);
      return { success: true };
    } else {
      setError(result.error);
      return { success: false, error: result.error };
    }
  }
  
  return {
    limit,
    isLoading,
    error,
    updateLimit,
    refetch: loadLimit,
  };
}
```

**Exercícios Práticos:**
1. Criar domain model `CardLimit` com validações
2. Implementar `cardLimitService` com mocks de API
3. Refatorar `useLimitForm` para usar service layer
4. Adicionar error handling global com Error Boundary
5. Implementar retry logic para falhas de API

**Recursos:**
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)

---

### **MÓDULO 6: Testing & Qualidade de Código** ⏱️ 3-4 dias
**Objetivo**: Escrever testes confiáveis e manter código maintainável

#### 6.1 Setup de Testing (Jest + Testing Library)
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom
```

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

#### 6.2 Testes de Unidade (Hooks & Utils)
```typescript
// hooks/__tests__/useLimitForm.test.ts
import { renderHook, act } from '@testing-library/react';
import useLimitForm from '../useLimitForm';

describe('useLimitForm', () => {
  it('deve validar limite mínimo', () => {
    const { result } = renderHook(() => useLimitForm(5000));
    
    act(() => {
      result.current.setNewLimit('400000'); // R$ 4000 (< usado)
    });
    
    expect(result.current.canSave).toBe(false);
    expect(result.current.validationMessage).toContain('maior ou igual');
  });
  
  it('deve permitir limite válido', () => {
    const { result } = renderHook(() => useLimitForm(5000));
    
    act(() => {
      result.current.setNewLimit('600000'); // R$ 6000
    });
    
    expect(result.current.canSave).toBe(true);
    expect(result.current.validationMessage).toBe('');
  });
  
  it('deve formatar valor corretamente', () => {
    const { result } = renderHook(() => useLimitForm(5000));
    
    act(() => {
      result.current.setNewLimit('123456'); // 123456 centavos
    });
    
    expect(result.current.numericLimit).toBe(1234.56);
  });
});
```

#### 6.3 Testes de Integração (Components)
```typescript
// components/__tests__/CardLimitForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CardLimitForm from '../CardLimitForm';

describe('CardLimitForm', () => {
  it('deve mostrar toast após salvar', async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    
    render(<CardLimitForm onSave={onSave} />);
    
    const input = screen.getByLabelText(/novo limite/i);
    await user.type(input, '8000');
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/salvo com sucesso/i)).toBeInTheDocument();
    });
  });
});
```

#### 6.4 Testes com Mock de API
```typescript
// lib/services/__tests__/cardLimitService.test.ts
import { cardLimitService } from '../cardLimitService';
import * as api from '@/lib/api/cardLimitApi';

jest.mock('@/lib/api/cardLimitApi');

describe('CardLimitService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('deve transformar resposta da API em domain model', async () => {
    (api.fetchCurrentLimit as jest.Mock).mockResolvedValue({
      id: '123',
      user_id: 'user-1',
      current_limit: 10000,
      used_amount: 4000,
      updated_at: '2024-01-01T00:00:00Z',
    });
    
    const result = await cardLimitService.getCurrentLimit();
    
    expect(result).toEqual({
      id: '123',
      userId: 'user-1',
      currentLimit: 10000,
      usedAmount: 4000,
      availableAmount: 6000,
      lastUpdated: expect.any(Date),
    });
  });
});
```

**Paralelo com iOS:**
- Jest = XCTest framework
- Testing Library = ViewInspector ou snapshot testing
- Mocks = Protocols + test doubles no Swift

**Exercícios Práticos:**
1. Escrever testes para todos os hooks existentes
2. Adicionar testes de snapshot para componentes UI
3. Criar mocks para `cardLimitService`
4. Implementar test coverage > 80%
5. Adicionar testes E2E com Playwright (opcional)

**Recursos:**
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Kent C. Dodds - Testing Course](https://kentcdodds.com/testing)

---

### **MÓDULO 7: Patterns Avançados & Best Practices** ⏱️ 3-4 dias
**Objetivo**: Dominar patterns específicos do ecossistema React

#### 7.1 Custom Hooks Patterns

**Pattern: useAsync (para data fetching)**
```typescript
// hooks/useAsync.ts
import { useState, useEffect, useCallback } from 'react';

type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' });
  
  const execute = useCallback(async () => {
    setState({ status: 'loading' });
    try {
      const data = await asyncFunction();
      setState({ status: 'success', data });
      return data;
    } catch (error) {
      setState({ status: 'error', error: error as Error });
      throw error;
    }
  }, [asyncFunction]);
  
  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);
  
  return {
    ...state,
    execute,
    reset: () => setState({ status: 'idle' }),
  };
}

// Uso:
function MyComponent() {
  const { status, data, error, execute } = useAsync(
    () => cardLimitService.getCurrentLimit()
  );
  
  if (status === 'loading') return <Spinner />;
  if (status === 'error') return <Error message={error.message} />;
  if (status === 'success') return <Display data={data} />;
  
  return <button onClick={execute}>Load</button>;
}
```

**Pattern: useLocalStorage (persistência)**
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });
  
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  
  return [storedValue, setValue];
}
```

**Pattern: useDebounce**
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}

// Uso no input de limite:
function CardLimitInput({ onChange }: Props) {
  const [inputValue, setInputValue] = useState('');
  const debouncedValue = useDebounce(inputValue, 300);
  
  useEffect(() => {
    // Só valida após 300ms sem digitar
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);
  
  return <input value={inputValue} onChange={e => setInputValue(e.target.value)} />;
}
```

#### 7.2 Error Boundaries
```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Enviar para serviço de logging (Sentry, etc)
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }
      
      return (
        <div>
          <h2>Algo deu errado</h2>
          <details>
            <summary>Detalhes do erro</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Uso:
<ErrorBoundary fallback={(error) => <CustomError error={error} />}>
  <CardLimitForm />
</ErrorBoundary>
```

#### 7.3 Portal Pattern (já usado em ActionButtons)
**Melhorias:**
```typescript
// components/Portal.tsx
import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: ReactNode;
  containerId?: string;
}

export function Portal({ children, containerId = 'portal-root' }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  
  useEffect(() => {
    let element = document.getElementById(containerId);
    
    if (!element) {
      element = document.createElement('div');
      element.id = containerId;
      document.body.appendChild(element);
    }
    
    setContainer(element);
    
    return () => {
      // Cleanup apenas se criamos o elemento
      if (element && element.childNodes.length === 0) {
        element.remove();
      }
    };
  }, [containerId]);
  
  if (!container) return null;
  
  return createPortal(children, container);
}
```

**Exercícios Práticos:**
1. Refatorar data fetching para usar `useAsync`
2. Adicionar persistência de limite pendente com `useLocalStorage`
3. Implementar debounce no input de limite
4. Criar Error Boundary global em `_app`
5. Melhorar Portal do Toast para suportar múltiplas instâncias

---

## 🚀 Plano de Implementação Sugerido

### **Semana 1: Fundamentos**
- Dia 1-2: Módulo 1 (TypeScript avançado)
- Dia 3-4: Módulo 2 (Estado - Context API)
- Dia 5: Módulo 2 (useReducer)

**Entregável**: Toast global com Context + tipos estritos

### **Semana 2: Composição & Performance**
- Dia 1-2: Módulo 3 (Compound Components)
- Dia 3: Módulo 3 (Render Props)
- Dia 4-5: Módulo 4 (Memoization & profiling)

**Entregável**: Componentes refatorados + análise de performance

### **Semana 3: Arquitetura**
- Dia 1-2: Módulo 5 (Estrutura de pastas + Domain)
- Dia 3-4: Módulo 5 (Services + API layer)
- Dia 5: Módulo 5 (Integração)

**Entregável**: Arquitetura limpa implementada com mocks

### **Semana 4: Testes & Patterns Avançados**
- Dia 1-2: Módulo 6 (Setup + testes unitários)
- Dia 3: Módulo 6 (Testes de integração)
- Dia 4-5: Módulo 7 (Custom hooks avançados)

**Entregável**: Coverage > 80% + hooks reutilizáveis

---

## 📚 Recursos Adicionais

### Livros
- "Learning React" - Alex Banks & Eve Porcello
- "Effective TypeScript" - Dan Vanderkam
- "React Design Patterns" - Carlos Santana Roldán

### Cursos Online
- [Epic React](https://epicreact.dev) - Kent C. Dodds (pago, mas vale MUITO)
- [Total TypeScript](https://totaltypescript.com) - Matt Pocock
- [React Docs Beta](https://react.dev) - Documentação oficial (LEIA!)

### Repositórios Exemplo
- [Bulletproof React](https://github.com/alan2207/bulletproof-react)
- [Real World App](https://github.com/gothinkster/realworld)

### Ferramentas Essenciais
- React DevTools (Chrome/Firefox)
- TypeScript Playground
- ESLint + Prettier (formatação)
- Storybook (component explorer)

---

## 🎯 Próximos Passos Imediatos

1. **Escolha 1-2 conceitos** do Módulo 1 ou 2 para começar HOJE
2. **Crie uma branch** `feat/refactor-architecture`
3. **Comece pequeno**: refatore apenas o `Toast` para Context API
4. **Peça code review** (pode usar ChatGPT/Claude para simular)
5. **Documente aprendizados** em um arquivo `LEARNINGS.md`

---

## 💡 Dicas de Estudo Vindas do iOS

1. **React Hooks = Swift Property Wrappers**
   - `useState` ≈ `@State`
   - `useEffect` ≈ `onAppear` + `onChange`
   - `useContext` ≈ `@EnvironmentObject`
   - `useReducer` ≈ TCA (The Composable Architecture)

2. **Component Composition = SwiftUI ViewBuilder**
   - Compound Components = Views com `.environmentObject`
   - Render props = `@ViewBuilder` closures

3. **TypeScript = Swift com esteróides**
   - Union types > Swift enums (mais flexível)
   - Utility types > Property wrappers (compile-time only)
   - Generics são quase idênticos

4. **Testing = XCTest + ViewInspector**
   - Jest = XCTest
   - Testing Library = assertions sobre DOM (como ViewInspector)

---

## ✅ Checklist de Progresso

Marque conforme for completando:

### TypeScript
- [ ] Tipos discriminados implementados
- [ ] Utility types dominados (Partial, Pick, Omit, etc)
- [ ] Generics em hooks customizados
- [ ] Brand types para validação

### Estado
- [ ] Context API global (Toast)
- [ ] useReducer implementado (Form)
- [ ] Zustand integrado (opcional)
- [ ] Performance otimizada (sem re-renders desnecessários)

### Composição
- [ ] Compound Components criados
- [ ] Render props implementados
- [ ] HOC para reutilização
- [ ] Children as function pattern

### Arquitetura
- [ ] Estrutura de pastas reorganizada
- [ ] Domain models criados
- [ ] Service layer implementado
- [ ] API client isolado

### Testing
- [ ] Jest configurado
- [ ] Hooks testados (100%)
- [ ] Components testados (> 80%)
- [ ] Mocks de API

### Avançado
- [ ] Custom hooks reutilizáveis
- [ ] Error Boundary global
- [ ] useAsync implementado
- [ ] Debounce aplicado

---

**Boa sorte nos estudos! 🚀**

Este projeto é uma ótima base para aprender. O código está funcional, mas tem espaço para evoluir - exatamente o cenário ideal para estudar refatorações incrementais.

*Dúvidas? Abra issues neste repositório ou anote em LEARNINGS.md para discussão futura.*
