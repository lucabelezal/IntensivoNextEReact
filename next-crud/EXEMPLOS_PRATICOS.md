# 🧪 Exemplos Práticos - Refatoração

## 🎯 Casos de Uso Reais

### 1. Toast Global - Múltiplos Cenários

#### Exemplo 1: Toast de Sucesso com Posição Customizada
```tsx
import { useToast } from '@/contexts/ToastContext';

function SaveButton() {
  const toast = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      
      // Toast no topo (padrão)
      toast.success('Dados salvos com sucesso!');
      
      // OU: Toast no bottom
      toast.success('Dados salvos com sucesso!', 'bottom');
    } catch (error) {
      toast.error('Erro ao salvar');
    }
  };
  
  return <button onClick={handleSave}>Salvar</button>;
}
```

#### Exemplo 2: Toast de Loading com Estado
```tsx
function AsyncOperation() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOperation = async () => {
    setIsLoading(true);
    toast.info('Processando...', 'top');
    
    try {
      await longOperation();
      toast.success('Concluído!');
    } catch (error) {
      toast.error('Falha na operação');
    } finally {
      setIsLoading(false);
    }
  };
  
  return <button onClick={handleOperation} disabled={isLoading}>Processar</button>;
}
```

#### Exemplo 3: Toast Chamado de Qualquer Lugar
```tsx
// Em um serviço/utility
import { useToast } from '@/contexts/ToastContext';

// ❌ NÃO funciona (hooks só em componentes)
export function showSuccessToast(message: string) {
  const toast = useToast(); // ERRO!
  toast.success(message);
}

// ✅ Solução 1: Passar callback
export function MyComponent() {
  const toast = useToast();
  
  const handleSave = async () => {
    await saveWithCallback((message) => toast.success(message));
  };
}

// ✅ Solução 2: Event emitter (avançado)
// lib/events.ts
export const toastEmitter = new EventEmitter();

// Em _app.tsx
function App() {
  const toast = useToast();
  
  useEffect(() => {
    toastEmitter.on('success', (msg) => toast.success(msg));
    toastEmitter.on('error', (msg) => toast.error(msg));
    
    return () => {
      toastEmitter.off('success');
      toastEmitter.off('error');
    };
  }, [toast]);
}

// Em qualquer lugar:
import { toastEmitter } from '@/lib/events';
toastEmitter.emit('success', 'Sucesso!');
```

---

### 2. useCardLimit - Casos Avançados

#### Exemplo 1: Validação em Tempo Real com Debounce
```tsx
import { useCardLimit } from '@/hooks/useCardLimit';
import { useDebounce } from '@/hooks/useDebounce'; // criar este hook

function CardLimitForm() {
  const { inputValue, setInputValue, validationError, canSave } = useCardLimit({
    initialUsedAmount: 4000,
  });
  
  // Debounce de 500ms antes de validar
  const debouncedValue = useDebounce(inputValue, 500);
  
  useEffect(() => {
    // Validação só acontece 500ms após parar de digitar
    console.log('Validando:', debouncedValue);
  }, [debouncedValue]);
  
  return (
    <div>
      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      {validationError && <p className="error">{validationError}</p>}
      <button disabled={!canSave}>Salvar</button>
    </div>
  );
}
```

#### Exemplo 2: Sincronizar com API
```tsx
import { useCardLimit } from '@/hooks/useCardLimit';
import { useAsync } from '@/hooks/useAsync'; // criar este hook

function CardLimitWithAPI() {
  // Carregar limite inicial da API
  const { data: apiLimit, status } = useAsync(
    () => fetch('/api/card-limit').then(r => r.json()),
    true // execute immediately
  );
  
  const {
    inputValue,
    setInputValue,
    canSave,
    commitChange,
  } = useCardLimit({
    initialUsedAmount: apiLimit?.used || 0,
  });
  
  const handleSave = async () => {
    if (!canSave) return;
    
    try {
      const response = await fetch('/api/card-limit', {
        method: 'PUT',
        body: JSON.stringify({ newLimit: numericValue }),
      });
      
      if (response.ok) {
        commitChange(numericValue);
        toast.success('Limite atualizado!');
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };
  
  if (status === 'loading') return <Spinner />;
  
  return (
    <CardLimitInput value={inputValue} onChange={setInputValue} />
  );
}
```

#### Exemplo 3: Undo/Redo
```tsx
function useCardLimitWithHistory() {
  const cardLimit = useCardLimit();
  const [history, setHistory] = useState<string[]>([cardLimit.inputValue]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const setInputWithHistory = (value: string) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(value);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
    cardLimit.setInputValue(value);
  };
  
  const undo = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      cardLimit.setInputValue(history[newIndex]);
    }
  };
  
  const redo = () => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      cardLimit.setInputValue(history[newIndex]);
    }
  };
  
  return {
    ...cardLimit,
    setInputValue: setInputWithHistory,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
  };
}

// Uso:
function FormWithHistory() {
  const { inputValue, setInputValue, undo, redo, canUndo, canRedo } = 
    useCardLimitWithHistory();
  
  return (
    <>
      <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
      <button onClick={undo} disabled={!canUndo}>↶ Desfazer</button>
      <button onClick={redo} disabled={!canRedo}>↷ Refazer</button>
    </>
  );
}
```

---

### 3. Compound Components - Layouts Flexíveis

#### Exemplo 1: Layout Customizado
```tsx
import { LimitInfo } from '@/components/LimitInfo/LimitInfoRefactored';

function CustomLimitDisplay() {
  return (
    <LimitInfo total={10000} used={4000}>
      {/* Layout personalizado */}
      <div className="grid grid-cols-2 gap-4">
        <LimitInfo.Row label="💰 Total" type="total" />
        <LimitInfo.Row label="📊 Em Uso" type="used" />
      </div>
      
      <div className="mt-4 p-4 bg-blue-100 rounded">
        <LimitInfo.Row label="✨ Disponível" type="available" highlighted />
      </div>
      
      {/* Elementos customizados */}
      <div className="mt-2 text-sm text-gray-600">
        <p>Última atualização: {new Date().toLocaleDateString()}</p>
      </div>
    </LimitInfo>
  );
}
```

#### Exemplo 2: Variações de Layout
```tsx
// Layout Vertical (padrão)
function VerticalLayout() {
  return (
    <LimitInfo total={10000} used={4000}>
      <LimitInfo.Row label="Total" type="total" />
      <LimitInfo.Row label="Usado" type="used" />
      <LimitInfo.Row label="Disponível" type="available" />
    </LimitInfo>
  );
}

// Layout Horizontal
function HorizontalLayout() {
  return (
    <LimitInfo total={10000} used={4000}>
      <div className="flex gap-8">
        <LimitInfo.Row label="Total" type="total" />
        <LimitInfo.Row label="Usado" type="used" />
        <LimitInfo.Row label="Disponível" type="available" />
      </div>
    </LimitInfo>
  );
}

// Layout com Cards
function CardLayout() {
  return (
    <LimitInfo total={10000} used={4000}>
      <div className="grid grid-cols-3 gap-4">
        {['total', 'used', 'available'].map((type) => (
          <div key={type} className="p-4 bg-white shadow rounded">
            <LimitInfo.Row label={type} type={type as any} />
          </div>
        ))}
      </div>
    </LimitInfo>
  );
}
```

#### Exemplo 3: Conditional Rendering
```tsx
function ConditionalLimitInfo({ showAvailable = true }) {
  return (
    <LimitInfo total={10000} used={4000}>
      <LimitInfo.Row label="Limite Total" type="total" />
      <LimitInfo.Row label="Em Uso" type="used" />
      
      {showAvailable && (
        <LimitInfo.Row label="Disponível" type="available" highlighted />
      )}
      
      {/* Alerta se disponível < 1000 */}
      <LimitInfo.Section>
        {(context) => {
          if (context.available < 1000) {
            return (
              <div className="p-2 bg-red-100 text-red-800 rounded">
                ⚠️ Limite quase esgotado!
              </div>
            );
          }
          return null;
        }}
      </LimitInfo.Section>
    </LimitInfo>
  );
}
```

---

### 4. Domain Logic - Testável e Reutilizável

#### Exemplo 1: Validação de Negócio
```typescript
// types/domain/CardLimit.ts
export const CardLimitDomain = {
  // Regra: Limite deve ser múltiplo de 100
  isValidIncrement(newLimit: number): boolean {
    return newLimit % 100 === 0;
  },
  
  // Regra: Taxa de 1% sobre aumento
  calculateFee(currentLimit: number, newLimit: number): number {
    const increase = newLimit - currentLimit;
    return increase > 0 ? increase * 0.01 : 0;
  },
  
  // Regra: Limite máximo baseado em score de crédito
  getMaxLimitForScore(creditScore: number): number {
    if (creditScore >= 800) return 50000;
    if (creditScore >= 700) return 30000;
    if (creditScore >= 600) return 15000;
    return 5000;
  },
  
  // Validação completa
  validateNewLimit(
    limit: CardLimit, 
    newAmount: number, 
    creditScore: number
  ): ValidationResult {
    const errors: string[] = [];
    
    if (newAmount < limit.usedAmount) {
      errors.push('Limite não pode ser menor que o valor em uso');
    }
    
    if (!this.isValidIncrement(newAmount)) {
      errors.push('Limite deve ser múltiplo de R$ 100,00');
    }
    
    const maxForScore = this.getMaxLimitForScore(creditScore);
    if (newAmount > maxForScore) {
      errors.push(`Seu score permite no máximo R$ ${maxForScore.toLocaleString()}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      fee: this.calculateFee(limit.currentLimit, newAmount),
    };
  },
};

type ValidationResult = {
  isValid: boolean;
  errors: string[];
  fee: number;
};
```

#### Exemplo 2: Uso no Hook
```tsx
function useCardLimitWithValidation(creditScore: number) {
  const cardLimit = useCardLimit();
  
  const validationResult = useMemo(() => {
    return CardLimitDomain.validateNewLimit(
      cardLimit.limit,
      cardLimit.numericValue,
      creditScore
    );
  }, [cardLimit.limit, cardLimit.numericValue, creditScore]);
  
  return {
    ...cardLimit,
    validationResult,
    canSave: cardLimit.canSave && validationResult.isValid,
  };
}

// Uso no componente:
function CardLimitFormAdvanced() {
  const creditScore = 750; // vindo de API
  const { validationResult, canSave } = useCardLimitWithValidation(creditScore);
  
  return (
    <div>
      <CardLimitInput />
      
      {validationResult.errors.map((error, i) => (
        <p key={i} className="text-red-600">{error}</p>
      ))}
      
      {validationResult.fee > 0 && (
        <p className="text-blue-600">
          Taxa: R$ {validationResult.fee.toFixed(2)}
        </p>
      )}
      
      <button disabled={!canSave}>Salvar</button>
    </div>
  );
}
```

---

### 5. Testing - Exemplos Práticos

#### Exemplo 1: Teste de Domain Logic
```typescript
// types/domain/__tests__/CardLimit.test.ts
import { CardLimitDomain } from '../CardLimit';

describe('CardLimitDomain', () => {
  describe('isValidIncrement', () => {
    it('deve aceitar múltiplos de 100', () => {
      expect(CardLimitDomain.isValidIncrement(5000)).toBe(true);
      expect(CardLimitDomain.isValidIncrement(5100)).toBe(true);
    });
    
    it('deve rejeitar não-múltiplos de 100', () => {
      expect(CardLimitDomain.isValidIncrement(5050)).toBe(false);
      expect(CardLimitDomain.isValidIncrement(5001)).toBe(false);
    });
  });
  
  describe('calculateFee', () => {
    it('deve calcular 1% sobre aumento', () => {
      expect(CardLimitDomain.calculateFee(5000, 6000)).toBe(10); // 1% de 1000
    });
    
    it('deve retornar 0 se não houver aumento', () => {
      expect(CardLimitDomain.calculateFee(5000, 5000)).toBe(0);
      expect(CardLimitDomain.calculateFee(5000, 4000)).toBe(0);
    });
  });
});
```

#### Exemplo 2: Teste de Hook
```typescript
// hooks/__tests__/useCardLimit.test.ts
import { renderHook, act } from '@testing-library/react';
import { useCardLimit } from '../useCardLimit';

describe('useCardLimit', () => {
  it('deve inicializar com valor correto', () => {
    const { result } = renderHook(() => 
      useCardLimit({ initialUsedAmount: 5000 })
    );
    
    expect(result.current.limit.usedAmount).toBe(5000);
    expect(result.current.inputValue).toBe('500000'); // centavos
  });
  
  it('deve validar limite mínimo', () => {
    const { result } = renderHook(() => 
      useCardLimit({ initialUsedAmount: 5000 })
    );
    
    act(() => {
      result.current.setInputValue('400000'); // R$ 4000 < usado
    });
    
    expect(result.current.canSave).toBe(false);
    expect(result.current.validationError).toContain('maior ou igual');
  });
  
  it('deve permitir limite válido', () => {
    const { result } = renderHook(() => 
      useCardLimit({ initialUsedAmount: 5000 })
    );
    
    act(() => {
      result.current.setInputValue('600000'); // R$ 6000
    });
    
    expect(result.current.canSave).toBe(true);
    expect(result.current.validationError).toBeNull();
  });
  
  it('deve reseTAR para valor inicial', () => {
    const { result } = renderHook(() => 
      useCardLimit({ initialUsedAmount: 5000 })
    );
    
    act(() => {
      result.current.setInputValue('800000');
    });
    
    expect(result.current.inputValue).toBe('800000');
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.inputValue).toBe('500000');
    expect(result.current.isDirty).toBe(false);
  });
});
```

#### Exemplo 3: Teste de Componente com Context
```typescript
// components/__tests__/CardLimitForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastProvider } from '@/contexts/ToastContext';
import CardLimitForm from '../CardLimitForm';

function renderWithToast(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      {ui}
    </ToastProvider>
  );
}

describe('CardLimitForm', () => {
  it('deve mostrar toast de sucesso após salvar', async () => {
    const user = userEvent.setup();
    renderWithToast(<CardLimitForm />);
    
    const input = screen.getByLabelText(/novo limite/i);
    await user.type(input, '8000');
    
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    await user.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/limite atualizado/i)).toBeInTheDocument();
    });
  });
  
  it('deve desabilitar botão quando input inválido', async () => {
    const user = userEvent.setup();
    renderWithToast(<CardLimitForm />);
    
    const input = screen.getByLabelText(/novo limite/i);
    const saveButton = screen.getByRole('button', { name: /salvar/i });
    
    // Limpar input
    await user.clear(input);
    
    expect(saveButton).toBeDisabled();
  });
});
```

---

## 🎯 Exercícios Práticos

### Exercício 1: Adicionar Persistência
Implementar `useLocalStorage` para salvar limite pendente:

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  // TODO: Implementar
}

// Uso:
function useCardLimitWithPersistence() {
  const cardLimit = useCardLimit();
  const [savedLimit, setSavedLimit] = useLocalStorage('pending-limit', '');
  
  // Salvar no localStorage quando mudar
  useEffect(() => {
    setSavedLimit(cardLimit.inputValue);
  }, [cardLimit.inputValue]);
  
  // Restaurar ao montar
  useEffect(() => {
    if (savedLimit) {
      cardLimit.setInputValue(savedLimit);
    }
  }, []);
  
  return cardLimit;
}
```

### Exercício 2: Loading States
Adicionar estado de loading ao salvar:

```typescript
function useCardLimitWithAPI() {
  const cardLimit = useCardLimit();
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const saveLimit = async () => {
    setIsLoading(true);
    toast.info('Salvando...', 'top');
    
    try {
      await fetch('/api/limit', {
        method: 'PUT',
        body: JSON.stringify({ limit: cardLimit.numericValue }),
      });
      
      toast.success('Salvo com sucesso!');
      cardLimit.commitChange(cardLimit.numericValue);
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    ...cardLimit,
    saveLimit,
    isLoading,
  };
}
```

### Exercício 3: Error Boundary
Criar Error Boundary para capturar erros:

```tsx
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component<Props, State> {
  // TODO: Implementar componentDidCatch
}

// Uso:
<ErrorBoundary fallback={(error) => <ErrorDisplay error={error} />}>
  <CardLimitForm />
</ErrorBoundary>
```

---

**Continue praticando e explorando os conceitos!** 🚀
