# 🔄 Refatoração Completa - Guia de Implementação

## 📁 Estrutura Criada

```
src/
├── types/
│   ├── domain/
│   │   └── CardLimit.ts          ✅ Domain model + business logic
│   └── Result.ts                  ✅ Result type (Swift-like)
├── lib/
│   └── utils/
│       └── formatters.ts          ✅ Pure functions para formatação
├── contexts/
│   └── ToastContext.tsx           ✅ Estado global com Context API
├── hooks/
│   └── useCardLimit.ts            ✅ Hook com useReducer
├── components/
│   ├── Toast/
│   │   ├── ToastRefactored.tsx   ✅ Componente memoizado
│   │   └── ToastContainer.tsx     ✅ Integração com Context
│   ├── CardLimitInput/
│   │   └── CardLimitInputRefactored.tsx  ✅ Input controlado
│   ├── LimitInfo/
│   │   └── LimitInfoRefactored.tsx       ✅ Compound Components
│   └── ActionButtons/
│       └── ActionButtonsRefactored.tsx   ✅ Buttons memoizados
└── pages/
    ├── _app_refactored.tsx       ✅ Provider global
    └── index_refactored.tsx      ✅ Home refatorada
```

---

## 🎯 Principais Melhorias Implementadas

### 1. **TypeScript Avançado**

#### Discriminated Unions
```typescript
// ❌ ANTES: Tipos permissivos
type ToastState = {
  message: string;
  type: string;
  isVisible: boolean;
}

// ✅ DEPOIS: Tipos estritos com discriminated unions
type ToastState =
  | { status: 'hidden' }
  | { 
      status: 'visible';
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
    };
```

**Benefício**: TypeScript força verificação do `status` antes de acessar `message`.

#### Result Type (Swift-like)
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Uso:
const result = await updateLimit(5000);
if (result.success) {
  console.log(result.data); // TypeScript sabe que data existe
} else {
  console.error(result.error); // TypeScript sabe que error existe
}
```

---

### 2. **Context API - Estado Global**

#### ❌ ANTES: Estado local (duplicado em cada página)
```tsx
function Home() {
  const { toast, hideToast, success } = useToast(); // local
  
  return (
    <>
      <Content />
      <Toast {...toast} onClose={hideToast} />
    </>
  );
}
```

#### ✅ DEPOIS: Estado global via Context
```tsx
// _app.tsx
<ToastProvider>
  <Component {...pageProps} />
  <ToastContainer /> {/* Renderiza globalmente */}
</ToastProvider>

// Qualquer componente pode usar:
function AnyComponent() {
  const { success } = useToast(); // acessa contexto global
  success('Sucesso!'); // toast aparece mesmo em outra página
}
```

**Benefícios**:
- Toast acessível de qualquer lugar
- Sem prop drilling
- Estado persistente entre navegações

---

### 3. **useReducer - Estado Complexo**

#### ❌ ANTES: Múltiplos useState
```tsx
const [newLimit, setNewLimit] = useState('');
const [numericLimit, setNumericLimit] = useState(0);
const [canSave, setCanSave] = useState(false);
const [validationMessage, setValidationMessage] = useState('');

// Lógica espalhada, difícil de testar
```

#### ✅ DEPOIS: useReducer centralizado
```typescript
type Action =
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_INPUT': {
      // Toda lógica centralizada aqui
      const numeric = digitsToReais(action.payload);
      return {
        ...state,
        inputValue: action.payload,
        numericValue: numeric,
        validationError: validate(numeric),
      };
    }
    // ...
  }
}

const [state, dispatch] = useReducer(reducer, initialState);
```

**Benefícios**:
- Lógica centralizada (fácil testar)
- Estado consistente (atualizações atômicas)
- Histórico de ações (debug fácil)

---

### 4. **Compound Components Pattern**

#### ❌ ANTES: Props individuais (inflexível)
```tsx
<LimitInfo total={10000} used={4000} />
// Difícil adicionar customizações
```

#### ✅ DEPOIS: Composição flexível
```tsx
<LimitInfo total={10000} used={4000}>
  <LimitInfo.Row label="Total" type="total" />
  <LimitInfo.Row label="Usado" type="used" highlighted />
  
  {/* Pode adicionar elementos personalizados */}
  <div className="my-custom-footer">
    <Icon />
    <Text>Informação extra</Text>
  </div>
</LimitInfo>
```

**Benefícios**:
- Extremamente flexível
- Context interno (sub-componentes acessam dados do pai)
- Reutilizável em diferentes layouts

---

### 5. **Memoization - Performance**

#### ❌ ANTES: Re-renders desnecessários
```tsx
function Home() {
  const { toast } = useToast();
  
  // handleSave recriado a cada render
  const handleSave = () => { /* ... */ };
  
  return (
    <>
      {/* CardLimitInput re-renderiza quando toast muda */}
      <CardLimitInput onChange={handleSave} />
    </>
  );
}
```

#### ✅ DEPOIS: Componentes e callbacks memoizados
```tsx
// Componente memoizado
export const CardLimitInput = memo(function CardLimitInput(props) {
  // ...
});

function Home() {
  // Callback estável
  const handleSave = useCallback(() => {
    // ...
  }, [dependencies]);
  
  return (
    <>
      {/* Não re-renderiza se handleSave não mudar */}
      <CardLimitInput onChange={handleSave} />
    </>
  );
}
```

**Benefícios**:
- Menos re-renders
- Performance em listas grandes
- Bateria economizada (mobile)

---

### 6. **Separação de Responsabilidades**

#### Domain Layer
```typescript
// types/domain/CardLimit.ts
export const CardLimitDomain = {
  create(used: number): CardLimit { /* ... */ },
  canUpdateTo(limit: CardLimit, newAmount: number): boolean { /* ... */ },
  validateLimit(limit: CardLimit, newAmount: number): string | null { /* ... */ },
};
```

#### Utilities Layer
```typescript
// lib/utils/formatters.ts
export function digitsToReais(digits: string): number { /* ... */ }
export function formatMoney(value: number): string { /* ... */ }
```

#### Presentation Layer
```typescript
// hooks/useCardLimit.ts
export function useCardLimit() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // Orquestra domain + utils
}
```

**Benefícios**:
- Testabilidade (cada camada isolada)
- Reutilização (domain logic em qualquer app)
- Manutenibilidade (mudanças localizadas)

---

## 🚀 Como Migrar do Código Antigo

### Passo 1: Adicionar Provider em _app.tsx
```tsx
// Renomeie _app.js para _app.tsx e adicione:
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/Toast/ToastContainer';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ToastProvider defaultPosition="top">
      <Component {...pageProps} />
      <ToastContainer />
    </ToastProvider>
  );
}
```

### Passo 2: Atualizar index.tsx
```tsx
// Substitua:
import useLimitForm from '@/hooks/useLimitForm';
// Por:
import { useCardLimit } from '@/hooks/useCardLimit';

// Substitua:
import { useToast } from '@/hooks/useToast';
// Por:
import { useToast } from '@/contexts/ToastContext';

// Substitua componentes pelos refatorados:
import { CardLimitInput } from '@/components/CardLimitInput/CardLimitInputRefactored';
import { LimitInfo } from '@/components/LimitInfo/LimitInfoRefactored';
import { ActionButtons } from '@/components/ActionButtons/ActionButtonsRefactored';
```

### Passo 3: Adaptar uso dos hooks
```tsx
// ❌ ANTES:
const { newLimit, setNewLimit, canSave, validationMessage } = useLimitForm(4000);

// ✅ DEPOIS:
const { inputValue, setInputValue, canSave, validationError } = useCardLimit({
  initialUsedAmount: 4000,
});
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | Antes | Depois |
|---------|-------|--------|
| **TypeScript** | Tipos básicos, any implícito | Discriminated unions, Result type |
| **Estado Toast** | Local (duplicado) | Global via Context |
| **Estado Form** | useState múltiplos | useReducer centralizado |
| **Componentes** | Props drilling | Compound Components |
| **Performance** | Re-renders frequentes | Memoization estratégica |
| **Arquitetura** | Lógica misturada | Camadas separadas (Domain/Utils/Presentation) |
| **Testabilidade** | Difícil (lógica acoplada) | Fácil (funções puras) |
| **Manutenção** | Médio esforço | Baixo esforço |

---

## 🧪 Próximos Passos para Aprendizado

### 1. Testar a Refatoração
```bash
# Copie os arquivos refatorados para os originais
cp src/pages/_app_refactored.tsx src/pages/_app.tsx
cp src/pages/index_refactored.tsx src/pages/index.tsx

# Rode o projeto
npm run dev
```

### 2. Exercícios Sugeridos

#### Exercício 1: Adicionar Toast de Erro
```tsx
const handleSave = useCallback(async () => {
  try {
    // Simular falha de API
    throw new Error('Falha na API');
  } catch (error) {
    toast.error('Não foi possível salvar o limite');
  }
}, [toast]);
```

#### Exercício 2: Adicionar Loading State
```tsx
// No useCardLimit, adicione:
const [isLoading, setIsLoading] = useState(false);

const handleSave = async () => {
  setIsLoading(true);
  try {
    await api.updateLimit(numericValue);
    toast.success('Salvo!');
  } finally {
    setIsLoading(false);
  }
};
```

#### Exercício 3: Persistir no LocalStorage
```tsx
// Crie hook useLocalStorage (veja PLANO_DE_ESTUDOS.md)
const [limit, setLimit] = useLocalStorage('card-limit', 4000);
```

### 3. Adicionar Testes

#### Teste de Hook
```typescript
// hooks/__tests__/useCardLimit.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCardLimit } from '../useCardLimit';

test('deve validar limite mínimo', () => {
  const { result } = renderHook(() => useCardLimit({ initialUsedAmount: 5000 }));
  
  act(() => {
    result.current.setInputValue('400000'); // R$ 4000
  });
  
  expect(result.current.canSave).toBe(false);
  expect(result.current.validationError).toContain('maior ou igual');
});
```

#### Teste de Domain Logic
```typescript
// types/domain/__tests__/CardLimit.test.ts
import { CardLimitDomain } from '../CardLimit';

test('deve validar corretamente', () => {
  const limit = CardLimitDomain.create(4000);
  
  expect(CardLimitDomain.canUpdateTo(limit, 5000)).toBe(true);
  expect(CardLimitDomain.canUpdateTo(limit, 3000)).toBe(false); // < usado
  expect(CardLimitDomain.canUpdateTo(limit, 60000)).toBe(false); // > max
});
```

---

## 📚 Conceitos Aplicados (do Plano de Estudos)

✅ **Módulo 1**: TypeScript avançado (discriminated unions, Result type)  
✅ **Módulo 2**: Context API, useReducer  
✅ **Módulo 3**: Compound Components, memoization  
✅ **Módulo 4**: React.memo, useCallback  
✅ **Módulo 5**: Separação Domain/Utils/Presentation  

---

## 💡 Paralelos com iOS/Swift

| React Pattern | iOS/Swift Equivalente |
|---------------|----------------------|
| `Context API` | `@EnvironmentObject` |
| `useReducer` | TCA (The Composable Architecture) |
| `Result<T, E>` | `Result<Success, Failure>` |
| `Compound Components` | `@ViewBuilder` patterns |
| `memo()` | `Equatable` protocol |
| `useCallback` | `@State` closure sem trigger |
| Domain model | Swift `struct` com computed properties |

---

## 🎯 Checklist de Migração

- [ ] Estrutura de pastas criada (`types/`, `lib/`, `contexts/`)
- [ ] ToastProvider adicionado em `_app.tsx`
- [ ] ToastContainer renderizado globalmente
- [ ] Home usando `useCardLimit` em vez de `useLimitForm`
- [ ] Componentes refatorados importados
- [ ] Testes de tipos (rodar `npx tsc --noEmit`)
- [ ] Projeto rodando sem erros (`npm run dev`)
- [ ] Toast funcionando globalmente
- [ ] Validação de limite funcionando
- [ ] Botões desabilitados quando necessário

---

**Próximo Passo**: Leia cada arquivo refatorado com atenção, entenda os comentários, e teste no navegador! 🚀
