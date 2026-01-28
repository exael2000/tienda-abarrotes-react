# 📊 Análisis Completo del Flujo de Checkout

## 🔄 Flujo General

### Paso 1: Cart → Checkout (Navegación)
**Ubicación**: [Cart.jsx](src/components/Cart.jsx#L230-L240)

**Datos que se llevan**:
- `cartItems` (desde CartContext)
- Usuario autenticado o invitado (desde AuthContext)

---

## 💵 PAGO EN EFECTIVO (CASH)

### Paso 2: Checkout - Formulario de Información
**Componente**: [Checkout_new.jsx](src/components/Checkout_new.jsx) - Step 1

**Datos del formulario recolectados**:
```javascript
{
  customerName: string,
  customerPhone: string,
  customerEmail: string,      // Opcional para invitados
  deliveryAddress: string,
  orderNotes: string
}
```

**Validación**: [checkoutValidation.js](src/utils/checkoutValidation.js)
- Valida campos requeridos según si es invitado o registrado
- Email solo requerido para usuarios registrados

### Paso 3: Selección de Método de Pago
**Componente**: [Checkout_new.jsx](src/components/Checkout_new.jsx) - Step 2

**Dato seleccionado**:
```javascript
paymentMethod: 'cash' | 'card'
```

### Paso 4: Confirmación de Orden
**Componente**: [Checkout_new.jsx](src/components/Checkout_new.jsx) - Step 3

**Datos mostrados**:
- Resumen de productos
- Información del cliente
- Método de pago
- Total

### Paso 5: Procesamiento (Cash Payment)
**Función**: [paymentService.js](src/services/paymentService.js#L60-L110) - `processCashPayment()`

**Datos ENVIADOS al backend** (`/api/orders`):
```javascript
{
  customer_name: string,
  customer_phone: string,
  customer_email: string,
  delivery_address: string,
  order_notes: string,
  payment_method: 'cash',
  payment_status: 'pending',
  items: [
    {
      product_id: number,
      quantity: number,
      unit_price: number  // En pesos (price_cents / 100)
    }
  ],
  total_amount: number  // En pesos
}
```

**Backend - Proxy**: [backend/api/routes.py](backend/api/routes.py#L131-L154)
- Recibe la petición
- Agrega headers de autorización si existen
- Redirige a DB microservice

**DB Microservice**: [db-microservice/app.py](db-microservice/app.py#L505-L585)

**Validaciones en backend**:
1. Campos requeridos: `customer_name`, `customer_phone`, `payment_method`, `total_amount`, `items`
2. Items no vacío (mínimo 1 producto)
3. Método de pago válido: 'cash' o 'card'

**Procesamiento en DB**:
```python
# Genera número de orden
order_number = f"ORD-{timestamp}-{random_num}"

# Inserta en tabla orders
INSERT INTO orders (
  order_number,
  payment_method,
  payment_status,  # 'completed' para cash
  total_amount,
  customer_name,
  customer_phone,
  customer_email,
  delivery_address,
  order_notes
)

# Inserta items en order_items
for item in items:
  INSERT INTO order_items (
    order_id,
    product_id,
    quantity,
    unit_price,
    total_price  # unit_price * quantity
  )
```

**Datos RECIBIDOS del backend** (Response):
```javascript
{
  message: 'Orden creada exitosamente',
  order_id: number,
  order_number: string,  // "ORD-1234567890-123"
  status: 'completed'
}
```

### Paso 6: Confirmación Final
**Componente**: [CashConfirmation.jsx](src/components/checkout/CashConfirmation.jsx)

**Datos mostrados**:
- ✅ Número de orden (`orderNumber`)
- Información del cliente del formulario
- Items del carrito guardados
- Total

**Acciones**:
- `clearCart()` - Limpia el carrito
- Muestra botón para volver a la tienda

---

## 💳 PAGO CON TARJETA (STRIPE)

### Pasos 1-4: Iguales que Cash Payment

### Paso 5: Procesamiento (Card Payment)
**Función**: [paymentService.js](src/services/paymentService.js#L115-L220) - `processCardPayment()`

**⚠️ IMPORTANTE**: En pago con tarjeta, NO se crea la orden inmediatamente.

**Datos ENVIADOS** al backend (`/api/stripe/create-checkout-session`):
```javascript
{
  items: [
    {
      product_id: number,
      name: string,
      price_cents: number,  // En centavos para Stripe
      quantity: number,
      image: string | null
    }
  ],
  customer_info: {
    name: string,
    phone: string,
    email: string,
    address: string,
    notes: string
  },
  metadata: {  // ⭐ DATOS DE ORDEN PARA CREAR DESPUÉS
    customer_name: string,
    customer_phone: string,
    customer_email: string,
    delivery_address: string,
    order_notes: string,
    items: [
      {
        product_id: number,
        name: string,
        quantity: number,
        unit_price: number  // En pesos
      }
    ],
    total_amount: number  // En pesos
  },
  total_cents: number  // Total en centavos
}
```

**Backend Flow**:
1. **Proxy Backend**: [backend/api/routes.py](backend/api/routes.py#L19-L30)
2. **DB Microservice**: Crea sesión de Stripe ([db-microservice/app.py](db-microservice/app.py))

**Datos RECIBIDOS** (Response):
```javascript
{
  url: string,        // URL de Stripe Checkout
  session_id: string  // ID de sesión de Stripe
}
```

### Paso 6: Redirección a Stripe
**Acción**: `window.location.href = redirectUrl`

Usuario es redirigido a la página de Stripe para completar el pago.

### Paso 7: Stripe Callback
**URL de retorno**: `/checkout/success?session_id=xxx`

### Paso 8: Verificación y Creación de Orden
**Componente**: [CheckoutSuccess.jsx](src/components/CheckoutSuccess.jsx)

**Función**: [paymentService.js](src/services/paymentService.js#L250-L291) - `verifyStripePayment()`

**Datos ENVIADOS** (`/api/verify-payment`):
```javascript
{
  session_id: string  // Del query parameter
}
```

**Backend - DB Microservice**: [db-microservice/app.py](db-microservice/app.py#L809-L900)

**Procesamiento**:
```python
# 1. Verificar sesión con Stripe
session = stripe.checkout.Session.retrieve(session_id)

# 2. Verificar que el pago fue exitoso
if session.payment_status == 'paid':

  # 3. Extraer metadata
  metadata = session.metadata

  # 4. Generar número de orden
  order_number = f"ORD-{timestamp}-{random_num}"

  # 5. Crear orden en DB
  INSERT INTO orders (
    order_number,
    payment_method: 'card',
    payment_status: 'completed',
    total_amount: session.amount_total / 100,
    customer_name: metadata.customer_name,
    customer_phone: metadata.customer_phone,
    customer_email: session.customer_details.email,
    stripe_payment_intent_id: session.payment_intent
  )

  # 6. Insertar items desde metadata
  items = json.loads(metadata['items'])
  for item in items:
    INSERT INTO order_items (...)
```

**⚠️ PROBLEMAS DETECTADOS**:

#### 🔴 Problema 1: Metadata no se está guardando correctamente
**Ubicación**: DB Microservice - crear sesión de Stripe

**Consecuencia**: Cuando se verifica el pago, no hay items en metadata, solo se guarda la orden sin items.

**Log actual**:
```
⚠️ No se encontraron items en metadata
```

#### 🔴 Problema 2: Datos de orden incompletos en respuesta
**Ubicación**: [db-microservice/app.py](db-microservice/app.py#L880-L895)

**Datos que DEBERÍA retornar**:
```python
{
  'success': True,
  'order_id': order_id,
  'order_number': order_number,
  'payment_status': 'completed',
  'message': '...',
  # ❌ FALTAN ESTOS DATOS:
  'customer_name': ...,
  'customer_phone': ...,
  'customer_email': ...,
  'delivery_address': ...,
  'items': [...],
  'total_amount': ...
}
```

**Datos que SÍ retorna actualmente**:
```python
{
  'success': True,
  'order_id': order_id,
  'order_number': order_number,
  'payment_status': 'completed',
  'message': '...'
}
```

#### 🔴 Problema 3: Frontend espera datos que no llegan
**Ubicación**: [CheckoutSuccess.jsx](src/components/CheckoutSuccess.jsx#L40-L50)

```javascript
setOrderDetails({
  order_number: result.orderNumber,
  order_id: result.orderId,
  session_id: sessionId,
  status: PAYMENT_STATUS.COMPLETED,
  payment_method: 'card',
  message: result.message,
  // ❌ ESTOS DATOS SON UNDEFINED:
  customer_name: result.customer_name,
  customer_phone: result.customer_phone,
  customer_email: result.customer_email,
  delivery_address: result.delivery_address,
  items: result.items || [],
  total_amount: result.total_amount
});
```

---

## 🎯 RESUMEN DE PROBLEMAS

### 1. **Metadata de Stripe no incluye items**
- **Archivo**: DB Microservice (crear sesión de Stripe)
- **Problema**: Los items no se están serializando correctamente en metadata
- **Impacto**: Las órdenes de tarjeta se crean sin productos

### 2. **Response incompleto de verify-payment**
- **Archivo**: [db-microservice/app.py](db-microservice/app.py#L880-L895)
- **Problema**: No se retornan los datos completos de la orden
- **Impacto**: La página de éxito no puede mostrar detalles completos

### 3. **Inconsistencia en formato de precios**
- **Frontend**: Convierte `price_cents` a pesos (`price_cents / 100`)
- **Backend**: Espera `unit_price` en pesos
- **Stripe**: Requiere centavos
- **Estado**: ✅ Parece estar bien manejado, pero revisar

---

## ✅ RECOMENDACIONES

### Fix 1: Corregir metadata de Stripe
```python
# En create-checkout-session endpoint
metadata = {
    'customer_name': customer_info['name'],
    'customer_phone': customer_info['phone'],
    'customer_email': customer_info['email'],
    'delivery_address': customer_info['address'],
    'order_notes': customer_info['notes'],
    'items': json.dumps(request_data.get('metadata', {}).get('items', []))
}
```

### Fix 2: Retornar datos completos en verify-payment
```python
# Después de crear la orden
return jsonify({
    'success': True,
    'order_id': order_id,
    'order_number': order_number,
    'payment_status': 'completed',
    'message': 'Pago verificado y orden creada exitosamente',
    'customer_name': metadata.get('customer_name'),
    'customer_phone': metadata.get('customer_phone'),
    'customer_email': session.customer_details.email,
    'delivery_address': metadata.get('delivery_address'),
    'items': items,  # Lista de items procesados
    'total_amount': session.amount_total / 100
}), 200
```

### Fix 3: Agregar validación de metadata
```python
# Antes de crear items
if not metadata or 'items' not in metadata:
    print("⚠️ Warning: No items in metadata, order will be created without items")
```

---

## ✅ FIXES APLICADOS

### ✅ Fix 1: Corregir extracción de datos en create-checkout-session
**Archivo**: [db-microservice/app.py](db-microservice/app.py#L644)

**Problema**: El backend esperaba datos en el root (`customer_name`) pero el frontend los enviaba en `customer_info.name`

**Solución**:
```python
# Ahora soporta ambos formatos
customer_info = data.get('customer_info', {})

# Fallback para compatibilidad
if not customer_info.get('name'):
    customer_info = {
        'name': data.get('customer_name', ''),
        'email': data.get('customer_email', ''),
        ...
    }
```

**Cambios adicionales**:
- ✅ Agregados logs detallados para debugging
- ✅ Manejo correcto de `price_cents` vs `unit_price`
- ✅ Metadata incluye items completos del request
- ✅ Retorna `session_id` además de `id` para consistencia

### ✅ Fix 2: Retornar datos completos en verify-payment
**Archivo**: [db-microservice/app.py](db-microservice/app.py#L809)

**Problema**: La respuesta solo incluía `order_id` y `order_number`, pero el frontend esperaba datos completos

**Solución**: Ahora retorna objeto completo:
```python
return jsonify({
    'success': True,
    'order_id': order_id,
    'order_number': order_number,
    'payment_status': 'completed',
    'message': 'Pago verificado y orden creada exitosamente',
    # ✅ NUEVOS DATOS:
    'customer_name': customer_name,
    'customer_phone': customer_phone,
    'customer_email': customer_email,
    'delivery_address': delivery_address,
    'order_notes': order_notes,
    'items': processed_items,  # Lista con detalles de cada item
    'total_amount': total_amount,
    'payment_method': 'card'
}), 200
```

**Cambios adicionales**:
- ✅ Parseo robusto de items desde metadata (maneja string y array)
- ✅ Logs detallados de cada paso del proceso
- ✅ Manejo mejorado de errores con traceback
- ✅ Cierre apropiado de conexión a BD en finally
- ✅ Items procesados incluyen nombre, precio unitario y total

### ✅ Fix 3: Logs mejorados para debugging
**Ubicación**: Ambos endpoints

**Agregado**:
- 📋 Log de datos recibidos
- 🧑 Log de información del cliente procesada
- 📦 Log de cada item agregado
- ✅ Confirmación de operaciones exitosas
- ❌ Logs de errores con detalles

**Ejemplo de salida**:
```
📋 Datos recibidos para crear sesión de Stripe:
Items: 3
Customer info: {'name': 'Juan Pérez', ...}
🧑 Información del cliente procesada: Juan Pérez
📦 Item agregado: Coca Cola - $18.5 x 2
✅ Sesión de Stripe creada: cs_test_...
```

---

## 🧪 PRUEBAS RECOMENDADAS

### Prueba 1: Pago en Efectivo
1. Agregar productos al carrito
2. Ir a checkout
3. Llenar formulario
4. Seleccionar "Pago en efectivo"
5. Confirmar orden

**Resultado esperado**:
- ✅ Orden creada inmediatamente
- ✅ Número de orden mostrado
- ✅ Items guardados en BD
- ✅ Status: `completed`

### Prueba 2: Pago con Tarjeta
1. Agregar productos al carrito
2. Ir a checkout
3. Llenar formulario
4. Seleccionar "Pago con tarjeta"
5. Confirmar y completar pago en Stripe (usar tarjeta de prueba: 4242 4242 4242 4242)

**Resultado esperado**:
- ✅ Redirección a Stripe
- ✅ Pago exitoso
- ✅ Redirección a /checkout/success
- ✅ Orden creada DESPUÉS del pago
- ✅ Todos los datos del cliente mostrados
- ✅ Items mostrados en página de éxito
- ✅ Total correcto
- ✅ Número de orden mostrado

### Prueba 3: Datos en Base de Datos
Verificar que las tablas tengan:

**Tabla `orders`**:
```sql
SELECT * FROM orders WHERE order_number = 'ORD-XXX';
```
Debe contener:
- ✅ order_number
- ✅ customer_name
- ✅ customer_phone
- ✅ customer_email
- ✅ delivery_address
- ✅ order_notes
- ✅ payment_method ('cash' o 'card')
- ✅ payment_status ('completed')
- ✅ total_amount

**Tabla `order_items`**:
```sql
SELECT * FROM order_items WHERE order_id = XXX;
```
Debe contener:
- ✅ Todos los productos del pedido
- ✅ Cantidades correctas
- ✅ Precios correctos

---

## 📝 DATOS DE PRUEBA RECOMENDADOS

### Para Cash Payment
```json
{
  "customer_name": "Juan Pérez",
  "customer_phone": "5551234567",
  "customer_email": "juan@example.com",
  "delivery_address": "Calle 123, Ciudad",
  "order_notes": "Tocar timbre",
  "payment_method": "cash",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "unit_price": 25.50
    }
  ],
  "total_amount": 51.00
}
```

### Para Card Payment - Session Response
Debe incluir:
```json
{
  "session_id": "cs_test_...",
  "payment_status": "paid",
  "metadata": {
    "customer_name": "Juan Pérez",
    "customer_phone": "5551234567",
    "items": "[{\"product_id\":1,\"quantity\":2,\"unit_price\":25.50}]"
  }
}
```
