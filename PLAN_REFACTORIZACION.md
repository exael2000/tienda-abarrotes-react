# 🏗️ PLAN DE REFACTORIZACIÓN ARQUITECTÓNICA

**Objetivo:** Mejorar desacoplamiento, mantenibilidad y escalabilidad
**Estimated Time:** 2-3 semanas

---

## 📊 Estado Actual vs Objetivo

| Aspecto            | Actual                | Objetivo               |
| ------------------ | --------------------- | ---------------------- |
| **Sincronización** | Ad-hoc, sin patrón    | MVC/Redux pattern      |
| **Errores**        | Inconsistentes        | Centralizados          |
| **Validación**     | Duplicada             | Compartida             |
| **API Docs**       | Ninguna               | Swagger/OpenAPI        |
| **Tests**          | Ninguno               | 80% coverage           |
| **Monitoreo**      | Console logs          | Structured logging     |
| **Estado**         | 3-4 fuentes de verdad | Single source of truth |

---

## 1️⃣ REFACTORIZAR CART CONTEXT (Mayor impacto)

### Problema Actual

```javascript
// Múltiples fuentes de verdad
const cartState = useContext(CartContext);           // State local
const localStorage.getItem('cart');                 // LocalStorage
const userCartsFromDB = await fetch('/api/cart');   // BD remota
// + flags: isGuest, pendingCart, userCartLoaded, cartCombinationDone
// = 🤯 Confusión total
```

### Solución: Máquina de Estados Clara

```javascript
// hooks/useCart.js - NEW
export const CartStates = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  GUEST_READY: 'GUEST_READY',
  USER_READY: 'USER_READY',
  CONSOLIDATING: 'CONSOLIDATING',
  ERROR: 'ERROR',
};

export const useCart = () => {
  const [state, dispatch] = useReducer(cartReducer, {
    status: CartStates.IDLE,
    items: [],
    error: null,
    lastSyncTime: null,
  });

  // Retornar:
  // - items
  // - add()
  // - remove()
  // - update()
  // - status (para loading states)
  // - error (para error handling)
};

// Usar así:
const cart = useCart();

if (cart.status === CartStates.LOADING) {
  return <Spinner />;
}

if (cart.status === CartStates.ERROR) {
  return <Error message={cart.error} />;
}

return <CartItems items={cart.items} onAdd={cart.add} onRemove={cart.remove} />;
```

### Transición: Cómo migrar

```javascript
// PASO 1: Crear nuevo hook
export const useCartV2 = () => {
  /* ... */
};

// PASO 2: Usar en nuevos componentes
const {
  ProductListV2,
} = () => {
  const cart = useCartV2(); // Nuevo hook
  // ...
};

// PASO 3: Migrar componentes uno por uno
// ProductList → ProductListV2 ✅
// Cart → CartV2 ✅
// Checkout → CheckoutV2 ✅

// PASO 4: Deprecate antiguo CartContext
console.warn('CartContext is deprecated, use useCart() hook');

// PASO 5: Remover CartContext
```

---

## 2️⃣ CREAR CAPA DE TRANSFORMACIÓN DE DATOS

### Nueva estructura

```
src/
├── services/
│   ├── api/
│   │   ├── raw/           # Raw API calls
│   │   │   ├── auth.js
│   │   │   ├── products.js
│   │   │   └── orders.js
│   │   └── transformed/   # Transformed data
│   │       ├── authService.js
│   │       ├── productService.js
│   │       └── orderService.js
│   ├── transformers/
│   │   ├── user.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── order.js
│   └── errors/
│       ├── ApiError.js
│       ├── ValidationError.js
│       └── handlers.js
```

### Ejemplo: Transformación de Usuario

```javascript
// services/api/raw/auth.js
export const rawAuthLogin = async credentials => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  return response.json();
};

// services/transformers/user.js
export const normalizeUser = apiUser => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email,
  displayName: `${apiUser.first_name} ${apiUser.last_name}`,
  firstName: apiUser.first_name,
  lastName: apiUser.last_name,
  isAdmin: apiUser.is_admin || false,
});

// services/api/transformed/authService.js
export const loginUser = async credentials => {
  try {
    const raw = await rawAuthLogin(credentials);
    return {
      user: normalizeUser(raw.user),
      token: raw.access_token,
    };
  } catch (error) {
    throw new AuthError(error.message);
  }
};

// En componente
const { user, token } = await loginUser(credentials);
// user.displayName ✅ (nunca first_name/last_name)
```

---

## 3️⃣ IMPLEMENTAR ERROR HANDLING CENTRALIZADO

### Nueva estructura

```javascript
// services/errors/AppError.js
export class AppError extends Error {
  constructor(message, code, statusCode = 500, details = {}) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 'VALIDATION_ERROR', 400, { fields });
  }
}

export class AuthError extends AppError {
  constructor(message) {
    super(message, 'AUTH_ERROR', 401);
  }
}

export class NetworkError extends AppError {
  constructor(message) {
    super(message, 'NETWORK_ERROR', 503);
  }
}

// services/errors/errorHandler.js
export const handleApiError = error => {
  if (error instanceof ValidationError) {
    return {
      type: 'VALIDATION',
      message: error.message,
      fields: error.details.fields,
    };
  }

  if (error instanceof AuthError) {
    localStorage.clear();
    window.location.href = '/login';
    return {
      type: 'AUTH',
      message: 'Sesión expirada. Por favor, inicia sesión de nuevo.',
    };
  }

  if (error instanceof NetworkError) {
    return {
      type: 'NETWORK',
      message: 'Error de conexión. Verifica tu internet.',
    };
  }

  return {
    type: 'UNKNOWN',
    message: error.message || 'Error inesperado',
  };
};

// En componentes
try {
  const user = await loginUser(credentials);
} catch (error) {
  const errorInfo = handleApiError(error);
  showToast[errorInfo.type.toLowerCase()](errorInfo.message);

  if (errorInfo.fields) {
    setFieldErrors(errorInfo.fields);
  }
}
```

---

## 4️⃣ AGREGAR VALIDACIÓN COMPARTIDA

### Nueva estructura

```
src/
├── validation/
│   ├── schemas/
│   │   ├── user.js        # Zod/Yup schemas
│   │   ├── product.js
│   │   ├── order.js
│   │   └── cart.js
│   ├── rules.js           # Reglas customizadas
│   └── index.js           # Exports
```

### Implementación

```javascript
// validation/schemas/user.js
import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(50, 'Máximo 50 caracteres'),
  password: z.string().min(4, 'Contraseña requerida'),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Solo letras, números, _ y -'),
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Mínimo 1 mayúscula')
    .regex(/[0-9]/, 'Mínimo 1 número'),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

// validation/schemas/order.js
export const checkoutSchema = z.object({
  customerName: z.string().min(3),
  customerEmail: z.string().email(),
  customerPhone: z.string().regex(/^\d{10}$/),
  paymentMethod: z.enum(['cash', 'card', 'transfer']),
  items: z
    .array(
      z.object({
        productId: z.number().positive(),
        quantity: z.number().positive().max(100),
      })
    )
    .min(1, 'Carrito vacío'),
});

// En servicios (compartir validación)
export const validateLogin = data => {
  return loginSchema.parse(data); // Lanza error si no válido
};

// En componentes (FE)
const handleSubmit = async formData => {
  try {
    const validated = validateLogin(formData);
    const user = await loginUser(validated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      setErrors(error.flatten().fieldErrors);
    }
  }
};
```

---

## 5️⃣ MEJORAR AUTENTICACIÓN

### Nueva arquitectura

```javascript
// contexts/AuthContext.js - REFACTORED
export const AuthProvider = ({ children }) => {
  const [auth, dispatch] = useReducer(authReducer, initialState);

  // Reducers explícitos
  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user, token } = await authService.login(credentials);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
    } catch (error) {
      dispatch({ type: 'LOGIN_ERROR', payload: error });
    }
  };

  const logout = async () => {
    dispatch({ type: 'LOGOUT_START' });
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT_SUCCESS' });
    } catch (error) {
      dispatch({ type: 'LOGOUT_ERROR', payload: error });
    } finally {
      // Limpiar siempre, aunque falle
      localStorage.clear();
    }
  };

  // Verificar token al montar
  useEffect(() => {
    dispatch({ type: 'INIT' });
    authService.verifyToken()
      .then(user => dispatch({ type: 'INIT_SUCCESS', payload: user }))
      .catch(() => dispatch({ type: 'INIT_ERROR' }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        // Estado
        user: auth.user,
        token: auth.token,
        status: auth.status,  // 'idle' | 'loading' | 'authenticated' | 'error'
        error: auth.error,
        // Acciones
        login,
        logout,
        loginAsGuest: (guestUser) => dispatch({ ... })
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Usar claramente los estados
const LoginPage = () => {
  const { status, error, login } = useAuth();

  if (status === 'loading') return <Spinner />;
  if (status === 'authenticated') return <Redirect to="/" />;

  return (
    <LoginForm
      onSubmit={login}
      isLoading={status === 'loading'}
      error={error}
    />
  );
};
```

---

## 6️⃣ CREAR COMPOSICIÓN DE TESTS

```javascript
// __tests__/unit/services/authService.test.js
describe('authService', () => {
  describe('login', () => {
    it('should return user and token on success', async () => {
      const response = {
        user: { id: 1, username: 'test' },
        access_token: 'token123',
      };

      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: async () => response,
      });

      const result = await loginUser({ username: 'test', password: 'pass' });

      expect(result.user.id).toBe(1);
      expect(result.token).toBe('token123');
    });

    it('should throw AuthError on invalid credentials', async () => {
      jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid credentials' }),
      });

      await expect(
        loginUser({ username: 'wrong', password: 'wrong' })
      ).rejects.toThrow(AuthError);
    });
  });
});

// __tests__/integration/checkout.test.js
describe('Checkout flow', () => {
  it('should complete order with cash payment', async () => {
    // Setup
    const cart = [{ id: 1, name: 'Product', quantity: 2, price: 100 }];

    // Action
    const order = await completeCheckout({
      cart,
      paymentMethod: 'cash',
      customerData: { name: 'John', email: 'john@example.com' },
    });

    // Assert
    expect(order.id).toBeDefined();
    expect(order.status).toBe('completed');
  });
});
```

---

## 7️⃣ DOCUMENTAR API CON SWAGGER

```python
# backend/config/swagger.py
from flask_restx import Api, Resource, fields, Namespace

# Definir modelos
user_model = api.model('User', {
    'id': fields.Integer(required=True),
    'username': fields.String(required=True),
    'email': fields.String(required=True)
})

login_model = api.model('Login', {
    'username': fields.String(required=True),
    'password': fields.String(required=True)
})

# Documentar endpoint
auth_ns = Namespace('auth', description='Authentication endpoints')

@auth_ns.route('/login')
class Login(Resource):
    @auth_ns.expect(login_model)
    @auth_ns.response(200, 'Success', user_model)
    @auth_ns.response(401, 'Invalid credentials')
    def post(self):
        """User login endpoint"""
        pass

api.add_namespace(auth_ns)
```

**URL Swagger:** http://localhost:5001/api/docs

---

## 📈 TIMELINE RECOMENDADO

### Semana 1: Fundaciones

- Day 1-2: Refactorizar CartContext
- Day 3-4: Crear capa de transformación
- Day 5: Error handling centralizado

### Semana 2: Validación & Testing

- Day 1-2: Validación compartida (Zod/Yup)
- Day 3-4: Agregar tests unitarios
- Day 5: Integration tests

### Semana 3: Documentación & Polish

- Day 1-2: Documentar con Swagger
- Day 3: Refactorizar Autenticación
- Day 4-5: Testing completo & bugs

---

## ✅ CHECKLIST DE REFACTORIZACIÓN

- [ ] Crear `useCart` hook con máquina de estados
- [ ] Migrar ProductList a useCart
- [ ] Migrar Cart a useCart
- [ ] Migrar Checkout a useCart
- [ ] Crear capa de transformación (user, product)
- [ ] Implementar error handling centralizado
- [ ] Agregar validación con Zod/Yup
- [ ] Crear tests unitarios básicos
- [ ] Documentar API con Swagger
- [ ] Refactorizar AuthContext
- [ ] Performance profiling
- [ ] Deployment testing

---

## 💡 BENEFICIOS ESPERADOS

| Métrica                         | Antes | Después | Mejora |
| ------------------------------- | ----- | ------- | ------ |
| Líneas de código en CartContext | 512   | 250     | -51%   |
| Duplicación en transformación   | 40%   | 0%      | -40%   |
| Tiempo para debuggear carrito   | 30min | 5min    | -83%   |
| Componentes acoplados           | 8     | 2       | -75%   |
| Cobertura de tests              | 0%    | 70%     | +70%   |
| Errores en producción           | TBD   | -50%    | est.   |
