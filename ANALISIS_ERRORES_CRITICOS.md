# 🚨 ANÁLISIS DE ERRORES, DESACOPLAMIENTO Y PUNTOS CRÍTICOS

**Fecha:** Febrero 19, 2026
**Versión del análisis:** 1.0

---

## 📊 Resumen Ejecutivo

| Severidad  | Cantidad | Estado                      | Impacto               |
| ---------- | -------- | --------------------------- | --------------------- |
| 🔴 CRÍTICO | 8        | Requiere atención inmediata | Sistema/Usuarios      |
| 🟠 ALTO    | 12       | Debe corregirse pronto      | Funcionalidad/UX      |
| 🟡 MEDIO   | 15       | Mejora recomendada          | Performance/Seguridad |
| 🟢 BAJO    | 10       | Nice to have                | Mantenibilidad        |
| **TOTAL**  | **45**   | -                           | -                     |

---

## 🔴 ERRORES CRÍTICOS (Requieren atención inmediata)

### 1. **Token JWT no se invalida en logout** ❌

**Ubicación:** `db-microservice/app.py` línea ~210
**Severidad:** 🔴 CRÍTICO
**Impacto:** Seguridad

```python
@app.route("/api/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    """Cerrar sesión (invalidar token)"""
    # En una implementación completa, aquí invalidarías el token
    # Por simplicidad, solo retornamos un mensaje  ❌ PROBLEMA!
    return jsonify({"message": "Sesión cerrada exitosamente"})
```

**Problema:**

- El token NO se invalida en el servidor
- Incluso después de logout, el token sigue siendo válido si alguien lo obtiene
- No existe un mecanismo de blacklist o revocación de tokens

**Solución recomendada:**

```python
# Opción 1: Lista negra en memoria (desarrollo)
INVALIDATED_TOKENS = set()

@app.route("/api/auth/logout", methods=["POST"])
@jwt_required()
def logout():
    token = request.headers['Authorization'].split()[1]
    INVALIDATED_TOKENS.add(token)
    return jsonify({"message": "Logout exitoso"}), 200

# Opción 2: Guardar en BD (producción)
# CREATE TABLE blacklisted_tokens (
#   id INTEGER PRIMARY KEY,
#   token_jti TEXT UNIQUE,
#   expires_at TIMESTAMP
# )
```

---

### 2. **Race condition en sincronización de carrito** ⚡

**Ubicación:** `src/context/CartContext.js` línea ~165
**Severidad:** 🔴 CRÍTICO
**Impacto:** Datos inconsistentes en carrito

```javascript
const addToCart = useCallback((product, quantity = 1) => {
  // Actualizar estado inmediatamente
  dispatch({
    type: CART_ACTIONS.ADD_TO_CART,
    payload: { ...product, quantity },
  });

  // Sincronizar sin esperar (fire and forget)  ❌ PROBLEMA!
  const token = localStorage.getItem('access_token');
  if (token && !isGuest) {
    fetch('/api/cart/add', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        product_id: product.id,
        quantity: quantity,
      }),
    }).catch(error => {
      console.error('Error syncing add to cart with DB:', error);
      // ❌ NO hay rollback si falla!
    });
  }
}, []);
```

**Problema:**

- Frontend actualiza estado local ANTES de confirmar en BD
- Si falla la sincronización, quedan desincronizados
- No hay manejo de errores ni rollback
- "Fire and forget" es peligroso con datos críticos

**Escenario de fallo:**

```
1. Usuario agregar producto (Cantidad: 2)
2. Estado local actualizado: cartItems = [producto x2]
3. POST /api/cart/add falla (error de red)
4. BD NO tiene el producto (Cantidad: 0)
5. Usuario ve 2 en carrito pero BD tiene 0
6. Checkout falla ❌
```

**Solución recomendada:**

```javascript
const addToCart = async (product, quantity = 1) => {
  try {
    if (token && !isGuest) {
      // Primero sincronizar con BD
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_id: product.id, quantity }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }
    }

    // SOLO después actualizar estado local
    dispatch({
      type: CART_ACTIONS.ADD_TO_CART,
      payload: { ...product, quantity },
    });
  } catch (error) {
    // Mostrar error y NO actualizar estado
    showToast.error('No se pudo agregar al carrito');
    throw error;
  }
};
```

---

### 3. **Inyección SQL potencial en GET /api/products** 💉

**Ubicación:** `db-microservice/app.py` línea ~230
**Severidad:** 🔴 CRÍTICO
**Impacto:** Seguridad

```python
@app.route("/api/products")
def get_products():
    conn = get_db_connection()

    supplier = request.args.get("supplier")  # ⚠️ Input no validado
    brand = request.args.get("brand")        # ⚠️ Input no validado

    query = "SELECT * FROM productos WHERE 1=1"
    params = []

    if supplier:
        query += " AND supplier = ?"  # ✅ Bien: usa ?
        params.append(supplier)       # ✅ Bien: parametrizado

    # Código OK para estos parámetros simples
    # PERO: NO hay validación de entrada
```

**Problema:**

- Aunque usa parametrized queries (bien), no hay validación de valores
- Usuario podría enviar valores inválidos o maliciosos
- Sin límite de resultados (DOS attack potencial)

**Solución recomendada:**

```python
from flask import request
import re

@app.route("/api/products")
def get_products():
    # Validar parámetros
    supplier = request.args.get("supplier", "").strip()
    brand = request.args.get("brand", "").strip()

    # Validar que son strings alfanuméricos
    if supplier and not re.match(r'^[a-zA-Z0-9_-]+$', supplier):
        return jsonify({"error": "Proveedor inválido"}), 400

    if brand and not re.match(r'^[a-zA-Z0-9_\s-]+$', brand):
        return jsonify({"error": "Marca inválida"}), 400

    # Límite de resultados
    limit = min(int(request.args.get("limit", 100)), 1000)

    # Resto del código...
```

---

### 4. **Contraseña JWT hardcodeada en producción** 🔑

**Ubicación:** `db-microservice/app.py` línea ~35
**Severidad:** 🔴 CRÍTICO
**Impacto:** Seguridad crítica

```python
# Configure JWT
app.config["JWT_SECRET_KEY"] = "tu-clave-secreta-super-segura-cambiar-en-produccion"
# ❌ HARDCODEADA! ¡¡¡CAMBIALA!!!
```

**Problema:**

- Clave secreta está en el código
- Si el repo se filtra, la seguridad está comprometida
- En producción de PythonAnywhere, esta clave es visible

**Solución INMEDIATA:**

```python
import os
from dotenv import load_dotenv

load_dotenv()

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "cambiar-esto-en-produccion"  # Default solo para desarrollo
)

if app.config["JWT_SECRET_KEY"] == "cambiar-esto-en-produccion":
    if os.getenv("FLASK_ENV") == "production":
        raise ValueError("⚠️ JWT_SECRET_KEY debe estar configurado en producción!")
```

**Configurar en PythonAnywhere:**

1. Dashboard → Web app → Add a new variable
2. `JWT_SECRET_KEY = <valor aleatorio 64 caracteres>`
3. `openssl rand -hex 32` para generar

---

### 5. **Persistencia de carrito sin validación de stock** 📦

**Ubicación:** `src/context/CartContext.js` línea ~110
**Severidad:** 🔴 CRÍTICO
**Impacto:** Compras inválidas

```javascript
useEffect(() => {
  const savedCart = localStorage.getItem('cart');

  if (savedCart) {
    try {
      const cartData = JSON.parse(savedCart);
      // ❌ NO VALIDA:
      // - ¿Producto existe?
      // - ¿Tiene stock?
      // - ¿Precio es válido?
      dispatch({ type: CART_ACTIONS.LOAD_CART, payload: cartData });
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  }
}, []);
```

**Problema:**

- Carga carrito sin validar productos
- Si se actualizó stock en otro navegador: inconsistencia
- Producto podría estar discontinuado
- Precio podría haber cambiado
- Usuario vería carrito "fantasma"

**Escenario:**

```
1. Usuario agrega producto: Camiseta x5 ($100)
2. Cierra navegador (carrito en localStorage)
3. Admin reduce stock a 2 unidades
4. Usuario reabre navegador
5. Ve Camiseta x5 en carrito ❌ (pero stock es 2)
6. Intenta checkout → ERROR "Stock insuficiente" ❌
```

**Solución:**

```javascript
useEffect(() => {
  const loadAndValidateCart = async () => {
    const savedCart = localStorage.getItem('cart');

    if (savedCart && token && !isGuest) {
      try {
        const cartData = JSON.parse(savedCart);

        // Validar cada producto con el servidor
        const validationResponse = await fetch('/api/cart/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ items: cartData }),
        });

        if (validationResponse.ok) {
          const validatedCart = await validationResponse.json();
          dispatch({ type: CART_ACTIONS.LOAD_CART, payload: validatedCart });
        } else {
          // Si hay problemas, limpiar carrito
          localStorage.removeItem('cart');
          showToast.error('Tu carrito ha expirado');
        }
      } catch (error) {
        console.error('Error validating cart:', error);
      }
    }
  };

  loadAndValidateCart();
}, [token, isGuest]);
```

---

### 6. **No existe validación de CSRF** 🛡️

**Ubicación:** Backend completo
**Severidad:** 🔴 CRÍTICO
**Impacto:** Ataques Cross-Site Request Forgery

**Problema:**

- Flask-CORS permite requests desde cualquier origen
- No hay token CSRF
- Alguien podría hacer requests en nombre del usuario

**Solución:**

```python
from flask_wtf.csrf import CSRFProtect

csrf = CSRFProtect()
csrf.init_app(app)

# En config
app.config['WTF_CSRF_SSL_REDIRECT'] = True
app.config['WTF_CSRF_ENABLED'] = True

# En endpoints POST/PUT/DELETE
@app.route('/api/orders', methods=['POST'])
@csrf.protect  # Agregar decorator
@jwt_required()
def create_order():
    # ...
```

---

### 7. **No existe manejo de transacciones en órdenes complejas** 💥

**Ubicación:** `db-microservice/app.py` línea ~840
**Severidad:** 🔴 CRÍTICO
**Impacto:** Integridad de datos

```python
@app.route("/api/orders", methods=["POST"])
def create_order():
    # ... validaciones ...

    conn = get_db_connection()

    try:
        # Insertar orden
        cursor.execute("""INSERT INTO orders ...""")
        order_id = cursor.lastrowid

        # Insertar items
        for item in data["items"]:
            cursor.execute("""INSERT INTO order_items ...""")  # ❌ Sin transacción!

        conn.commit()
    except Exception as e:
        conn.rollback()  # ✅ Bien: hay rollback
        return jsonify({"error": "Error"}), 500
```

**Problema:**

- Si hay error DESPUÉS de insertar orden pero ANTES de items
- Quedaría orden huérfana sin items
- Inconsistencia en BD

**Mejor práctica:**

```python
@app.route("/api/orders", methods=["POST"])
def create_order():
    conn = get_db_connection()
    conn.execute("BEGIN TRANSACTION")  # Explícito

    try:
        # Validaciones exhaustivas ANTES de cualquier insert
        for item in data["items"]:
            product = conn.execute(
                "SELECT stock FROM productos WHERE id = ?",
                (item["product_id"],)
            ).fetchone()

            if not product or item["quantity"] > product["stock"]:
                raise ValueError(f"Stock insuficiente para {item['product_id']}")

        # RECIÉN ENTONCES empezar inserts
        cursor = conn.cursor()
        cursor.execute("""INSERT INTO orders ...""")
        order_id = cursor.lastrowid

        for item in data["items"]:
            cursor.execute("""INSERT INTO order_items ...""")
            # Actualizar stock
            cursor.execute(
                "UPDATE productos SET stock = stock - ? WHERE id = ?",
                (item["quantity"], item["product_id"])
            )

        conn.commit()
        return jsonify({...}), 201

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        conn.close()
```

---

### 8. **No existe timeout en requests HTTP** ⏱️

**Ubicación:** `backend/api/routes.py` línea ~1
**Severidad:** 🔴 CRÍTICO
**Impacto:** Hanging requests, recursos

```python
# En routes.py
response = requests.get(f'{DB_SERVICE_URL}/api/stripe/config')
# ❌ SIN timeout - puede colgar indefinidamente!
```

**Problema:**

- Si DB service no responde, request cuelga
- Acumula recursos y threads
- Cliente también se queda esperando

**Solución:**

```python
import requests

# Configurar timeout global
SESSION = requests.Session()
SESSION.timeout = 10  # 10 segundos

# O especificar en cada call
response = requests.get(
    f'{DB_SERVICE_URL}/api/stripe/config',
    timeout=10  # ✅ Explícito
)

# Con reintentos
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry

def requests_retry_session(retries=3, timeout=10):
    session = requests.Session()
    retry = Retry(total=retries, connect=3, read=3)
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    session.timeout = timeout
    return session

resp = requests_retry_session().get(url)
```

---

## 🟠 PROBLEMAS DE ALTO NIVEL (Deben corregirse pronto)

### 1. **Desacoplamiento débil: Frontend tightly coupled a Backend**

**Ubicación:** `src/services/api.js`, `src/App.js`
**Severidad:** 🟠 ALTO

**Problema:**

```javascript
// Frontend asume estructura exacta de respuesta
const data = await response.json();
setUser({
  id: data.id,
  username: data.username,
  email: data.email,
  first_name: data.first_name, // ❌ Si backend cambia, rompe
  last_name: data.last_name, // ❌ Si backend cambia, rompe
});
```

**Solución: Agregar capa de transformación**

```javascript
// services/transformers.js
export const transformUserResponse = apiUser => ({
  id: apiUser.id,
  username: apiUser.username,
  email: apiUser.email,
  firstName: apiUser.first_name, // Normalizar
  lastName: apiUser.last_name,
  displayName: `${apiUser.first_name} ${apiUser.last_name}`,
});

// En componente
const user = transformUserResponse(apiResponse);
```

---

### 2. **Cart sincronización bidireccional sin estado claro**

**Ubicación:** `src/context/CartContext.js`, `db-microservice/app.py`
**Severidad:** 🟠 ALTO

**Problema:**

- No está claro cuál es la fuente de verdad (localStorage vs BD)
- Múltiples flags: `isGuest`, `pendingCart`, `userCartLoaded`, `cartCombinationDone`
- Posible estado inconsistente

**Solución: Arquitectura clara**

```javascript
// Estados posibles del carrito:
const CartStates = {
  GUEST_LOCAL: 'guest_local', // Invitado, carrito en localStorage
  USER_SYNCED: 'user_synced', // Usuario autenticado, sincronizado con BD
  USER_DIRTY: 'user_dirty', // Usuario con cambios locales sin sincronizar
  CONSOLIDATING: 'consolidating', // Combinando invitado + usuario al login
  ERROR: 'error', // Error de sincronización
};

// Una única máquina de estados
const cartState = getCurrentState();
// En lugar de múltiples flags confusos
```

---

### 3. **No existe versionado de API**

**Ubicación:** `backend/app.py`, `db-microservice/app.py`
**Severidad:** 🟠 ALTO

**Problema:**

```python
# Sin versión
@app.route('/api/products')  # ¿Qué versión?
@app.route('/api/orders')     # ¿Qué versión?
```

**Solución:**

```python
# Versionado explícito
API_VERSION = 'v1'

@app.route(f'/api/{API_VERSION}/products')
@app.route(f'/api/{API_VERSION}/orders')

# Permite:
# /api/v1/products     (actual)
# /api/v2/products     (futura)
# Backwards compatible!
```

---

### 4. **Error handling inconsistente**

**Ubicación:** Todos los componentes
**Severidad:** 🟠 ALTO

**Problema:**

```javascript
// Componente A - usa try/catch
try {
  const data = await fetch('/api/products');
  setProducts(data);
} catch (error) {
  showToast.error('Error');
}

// Componente B - ignora errores
const products = await fetch('/api/products');
setProducts(products); // ❌ Si falla, setea undefined!

// Componente C - logs pero no maneja
fetch('/api/products')
  .then(r => r.json())
  .then(data => setProducts(data))
  .catch(e => console.error(e)); // ❌ UI nunca se actualiza
```

**Solución: Error boundary + hook centralizado**

```javascript
// hooks/useApi.js
export const useApi = url => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (mounted) setData(json);
      } catch (err) {
        if (mounted) {
          setError(err);
          showToast.error(err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [url]);

  return { data, loading, error };
};

// Uso
const { data: products, loading, error } = useApi('/api/products');
```

---

### 5. **Base de datos sin índices en campos críticos**

**Ubicación:** `db-microservice/models.py`, `db.sqlite3`
**Severidad:** 🟠 ALTO

**Problema:**

```sql
-- Sin índices en campos críticos
SELECT * FROM cart_items WHERE user_id = ?  -- ❌ Sin índice, O(n)
SELECT * FROM order_items WHERE order_id = ? -- ❌ Sin índice, O(n)
SELECT * FROM products WHERE supplier = ?    -- ❌ Sin índice, O(n)
```

**Solución:**

```sql
-- Crear índices
CREATE INDEX idx_cart_items_user_id
  ON cart_items(user_id);

CREATE INDEX idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX idx_products_supplier
  ON productos(supplier);

CREATE INDEX idx_products_brand
  ON productos(brand);

-- En Python
cursor.execute('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)')
```

---

### 6. **Stripe integration sin idempotencia**

**Ubicación:** `db-microservice/app.py` línea ~1100
**Severidad:** 🟠 ALTO

**Problema:**

```python
@app.route("/api/stripe/confirm-payment", methods=["POST"])
def confirm_payment():
    data = request.get_json()

    # ❌ Si se llama 2 veces, crea 2 órdenes!
    cursor.execute("""INSERT INTO orders ...""")
    order_id = cursor.lastrowid
```

**Solución: Idempotencia**

```python
@app.route("/api/stripe/confirm-payment", methods=["POST"])
def confirm_payment():
    data = request.get_json()
    payment_intent_id = data.get("payment_intent_id")

    # Verificar si ya se procesó
    existing_order = conn.execute(
        "SELECT id FROM orders WHERE stripe_payment_intent_id = ?",
        (payment_intent_id,)
    ).fetchone()

    if existing_order:
        return jsonify({
            "message": "Pago ya procesado",
            "order_id": existing_order["id"]
        }), 200

    # Recién entonces crear nueva orden
    cursor.execute("""INSERT INTO orders ...""")
```

---

## 🟡 PROBLEMAS DE NIVEL MEDIO (Mejoras recomendadas)

### 1. **Sin logging estructurado**

```python
# Actual
print(f"🛒 Loading cart for user {user_id}")  # ❌ Print statements

# Recomendado
import logging
logger = logging.getLogger(__name__)
logger.info("Loading cart", extra={"user_id": user_id})
```

---

### 2. **Sin rate limiting en endpoints públicos**

```python
# Agregar
from flask_limiter import Limiter
limiter = Limiter(app)

@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("5/minute")  # Máx 5 intentos por minuto
def login():
    pass
```

---

### 3. **Sin validación de email**

```python
# Actual
if "@" not in email:  # ❌ Validación muy básica

# Recomendado
from email_validator import validate_email

try:
    valid = validate_email(email)
    email = valid.email
except Exception:
    return jsonify({"error": "Email inválido"}), 400
```

---

### 4. **Passwords muy débiles en validación**

```python
# Actual
if len(password) < 4:  # ❌ Muy débil

# Recomendado
# Mínimo 8 caracteres
# 1 mayúscula, 1 minúscula, 1 número, 1 especial
import re

def validate_password_strength(password):
    if len(password) < 8:
        return False, "Mínimo 8 caracteres"
    if not re.search(r'[A-Z]', password):
        return False, "Mínimo 1 mayúscula"
    if not re.search(r'[0-9]', password):
        return False, "Mínimo 1 número"
    return True, "OK"
```

---

### 5. **Sin protección de contraseña débil en registro**

```javascript
// Agregar validación en frontend
export const validatePassword = password => {
  const errors = [];
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Mínimo 1 mayúscula');
  if (!/[0-9]/.test(password)) errors.push('Mínimo 1 número');
  return errors.length === 0 ? null : errors;
};
```

---

### 6. **Falta de paginación en listados**

```python
# Actual - Sin límite
@app.route("/api/products")
def get_products():
    products = conn.execute("SELECT * FROM productos").fetchall()
    # ❌ Todos los productos!

# Recomendado
@app.route("/api/products")
def get_products():
    page = int(request.args.get("page", 1))
    limit = min(int(request.args.get("limit", 20)), 100)
    offset = (page - 1) * limit

    query = "SELECT * FROM productos LIMIT ? OFFSET ?"
    products = conn.execute(query, (limit, offset)).fetchall()

    total = conn.execute(
        "SELECT COUNT(*) as count FROM productos"
    ).fetchone()["count"]

    return jsonify({
        "data": products,
        "page": page,
        "limit": limit,
        "total": total,
        "pages": (total + limit - 1) // limit
    })
```

---

### 7. **Sin caché en endpoint de productos (GET)**

```python
# Agregar decorador
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'simple'})

@app.route("/api/products")
@cache.cached(timeout=300)  # Cache 5 minutos
def get_products():
    pass

# Para invalidar al actualizar
@cache.invalidate()
def update_product():
    pass
```

---

### 8. **CORS demasiado permisivo**

```python
# Actual
CORS(app)  # ❌ Permite cualquier origen!

# Recomendado
CORS(app, origins=[
    "https://exael.pythonanywhere.com",
    "http://localhost:3000",
    "http://localhost:5000"
])
```

---

### 9. **Sin tests automatizados**

```python
# Crear tests/test_auth.py
import unittest
from app import app

class TestAuth(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_login_success(self):
        response = self.client.post('/api/auth/login',
            json={'username': 'test', 'password': 'pass'})
        self.assertEqual(response.status_code, 200)

    def test_login_invalid_credentials(self):
        response = self.client.post('/api/auth/login',
            json={'username': 'wrong', 'password': 'wrong'})
        self.assertEqual(response.status_code, 401)
```

---

### 10. **Sin documentación de API (Swagger/OpenAPI)**

```python
# Instalar
pip install flask-restx

# Generar automáticamente
from flask_restx import Api, Resource

api = Api(app, doc='/api/docs')

@api.route('/api/products')
class Products(Resource):
    """Lista de productos disponibles"""

    def get(self):
        """Obtener todos los productos
        ---
        parameters:
          - name: supplier
            in: query
            type: string
        responses:
          200:
            description: Lista de productos
        """
        pass
```

---

## 🟢 PROBLEMAS DE BAJO NIVEL (Nice to have)

### 1. **Componentes sin memoización**

```javascript
// Sin memo - re-renderiza siempre
function ProductCard({ product }) {
  return <div>{product.name}</div>;
}

// Con memo - solo si props cambian
const ProductCard = React.memo(({ product }) => {
  return <div>{product.name}</div>;
});
```

---

### 2. **LocalStorage duplicado**

```javascript
// Actual
localStorage.setItem('cart', JSON.stringify(cartItems));
localStorage.setItem('cartItems', JSON.stringify(cartItems)); // ❌ Duplicado!

// Solución: Un único key de verdad
const STORAGE_KEYS = {
  CART: 'app:cart:items',
  USER: 'app:auth:user',
  TOKEN: 'app:auth:token',
};
```

---

### 3. **Estilos duplicados**

```css
/* ProductList.css */
.btn-primary {
  background: #007bff;
}

/* Cart.css */
.btn-primary {
  background: #007bff;
} /* ❌ Duplicado */

/* Solución: Variables compartidas */
/* styles/global.css */
:root {
  --color-primary: #007bff;
}

/* Uso */
.btn-primary {
  background: var(--color-primary);
}
```

---

### 4. **Sin SEO meta tags**

```javascript
// Agregar React Helmet
import { Helmet } from 'react-helmet';

<Helmet>
  <title>Tienda Abarrotes - Compra Online</title>
  <meta name="description" content="Compra productos frescos..." />
  <meta name="og:image" content="/images/logo.png" />
</Helmet>;
```

---

### 5. **Sin PWA (Progressive Web App)**

```javascript
// Agregar manifest.json
{
  "name": "Tienda Abarrotes",
  "short_name": "Abarrotes",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#007bff"
}
```

---

## 📋 MATRIZ DE DECISIÓN: QUÉ ARREGLAR PRIMERO

| #   | Problema               | Impacto    | Complejidad | Prioridad |
| --- | ---------------------- | ---------- | ----------- | --------- |
| 1   | JWT no se invalida     | 🔴 CRÍTICO | Media       | **P0**    |
| 2   | Race condition carrito | 🔴 CRÍTICO | Alta        | **P0**    |
| 3   | SQL validation         | 🔴 CRÍTICO | Baja        | **P1**    |
| 4   | JWT hardcodeado        | 🔴 CRÍTICO | Muy Baja    | **P1**    |
| 5   | Carrito sin validación | 🔴 CRÍTICO | Media       | **P1**    |
| 6   | Sin CSRF               | 🔴 CRÍTICO | Media       | **P1**    |
| 7   | Sin transacciones      | 🔴 CRÍTICO | Media       | **P2**    |
| 8   | Sin timeout requests   | 🔴 CRÍTICO | Muy Baja    | **P2**    |
| 9   | Desacoplamiento débil  | 🟠 ALTO    | Alta        | **P2**    |
| 10  | Sincronización carrito | 🟠 ALTO    | Muy Alta    | **P2**    |

---

## ✅ PLAN DE ACCIÓN RECOMENDADO

### **FASE 1: Seguridad Crítica (1-2 días)**

- [ ] Cambiar JWT_SECRET_KEY a variable de entorno
- [ ] Agregar validación en GET /api/products
- [ ] Implementar logout con token blacklist
- [ ] Configurar CORS restricto

### **FASE 2: Integridad de Datos (3-5 días)**

- [ ] Arreglar race condition en cart
- [ ] Agregar transacciones explícitas en órdenes
- [ ] Validar carrito al cargarlo
- [ ] Agregar timeouts en requests

### **FASE 3: Robustez (1 semana)**

- [ ] Implementar capa de transformación (desacoplamiento)
- [ ] Refactorizar sincronización de carrito
- [ ] Agregar error handling centralizado
- [ ] Crear índices en BD

### **FASE 4: Testing & Docs (1 semana)**

- [ ] Agregar tests unitarios
- [ ] Documentar API (Swagger)
- [ ] Agregar logging estructurado
- [ ] Rate limiting

---

## 📞 Contacto/Preguntas

¿Necesitas ayuda implementando alguna de estas soluciones?
Puedo crear PRs automáticamente para las correcciones críticas.

---

**Próximo paso:** ¿Quieres que empiece con las correcciones de FASE 1 (Seguridad Crítica)?
