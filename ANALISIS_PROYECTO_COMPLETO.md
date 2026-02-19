# 📊 ANÁLISIS COMPLETO DEL PROYECTO: Tienda de Abarrotes

**Última actualización:** Febrero 19, 2026

---

## 📋 Índice

1. [Stack Tecnológico](#stack-tecnológico)
2. [Arquitectura General](#arquitectura-general)
3. [Flujo de la Aplicación](#flujo-de-la-aplicación)
4. [Estructura de Carpetas](#estructura-de-carpetas)
5. [Componentes Clave](#componentes-clave)
6. [Endpoints API](#endpoints-api)
7. [Flujo de Datos](#flujo-de-datos)
8. [Autenticación y Seguridad](#autenticación-y-seguridad)
9. [Sistema de Carrito](#sistema-de-carrito)
10. [Proceso de Checkout](#proceso-de-checkout)
11. [Integración Stripe](#integración-stripe)
12. [Deployment](#deployment)

---

## 🛠️ Stack Tecnológico

### Frontend

```
├── React 19.2.0
│   ├── React Router DOM 7.9.3 (Navegación SPA)
│   ├── Context API (Estado global)
│   ├── Hooks (Estado local y efectos)
│   └── Framer Motion 12.29.0 (Animaciones)
├── Axios 1.12.2 (Cliente HTTP)
├── Stripe
│   ├── @stripe/react-stripe-js 5.2.0
│   ├── @stripe/stripe-js 8.0.0
│   └── Elements (Formularios de pago)
├── React Hot Toast 2.6.0 (Notificaciones)
├── CSS3 (Styles)
│   ├── Critical CSS (Core)
│   ├── E-commerce Styles
│   ├── Global Styles
│   └── Theme Variables
└── Testing Library (Jest, React Testing)
```

**Dependencias clave:**

- **react**: Framework principal
- **react-dom**: Renderizado DOM
- **react-router-dom**: Enrutamiento SPA
- **axios**: Cliente HTTP con interceptores
- **@stripe/react-stripe-js**: Pagos con tarjeta
- **framer-motion**: Animaciones suaves
- **react-hot-toast**: Sistema de toasts/notificaciones

### Backend

```
├── Flask 3.0.3 (Framework Web)
├── Flask-CORS 6.0.1 (Control de orígenes)
├── Flask-JWT-Extended 4.7.1 (Autenticación JWT)
├── BCrypt 4.2.1 (Hash de contraseñas)
├── Stripe 5.1.1 (API de pagos)
├── python-dotenv (Configuración)
└── SQLite 3 (Base de datos)
```

**Dependencias Python:**

- **flask**: Framework web
- **flask-cors**: CORS headers
- **flask-jwt-extended**: JWT tokens
- **bcrypt**: Password hashing
- **stripe**: Stripe API client
- **requests**: HTTP client
- **dotenv**: Environment variables

### Base de Datos

```
SQLite3
├── Usuarios (users)
├── Productos (products)
├── Carrito (cart_items)
└── Órdenes (orders, order_items)
```

### Infraestructura

- **Desarrollo**: Node.js dev server + Flask dev server
- **Producción**: PythonAnywhere (WSGI)
- **Versionado**: Git + GitHub (exael2000/tienda-abarrotes-react)

---

## 🏗️ Arquitectura General

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     NAVEGADOR DEL USUARIO                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND (React 19.2)                 │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐     │   │
│  │  │              React App.js                       │     │   │
│  │  │  - Router (React Router DOM)                    │     │   │
│  │  │  - Providers (Auth, Cart, Toast)                │     │   │
│  │  └─────────────────────────────────────────────────┘     │   │
│  │                       │                                  │   │
│  │      ┌────────────────┼────────────────┐                 │   │
│  │      │                │                │                 │   │
│  │      ▼                ▼                ▼                 │   │
│  │  ┌────────┐      ┌─────────┐      ┌─────────┐            │   │
│  │  │Pages:  │      │Context  │      │Services │            │   │
│  │  │        │      │         │      │         │            │   │
│  │  │- Login │      │- Auth   │      │- api.js │            │   │
│  │  │- Reg   │      │- Cart   │      │- payment│            │   │
│  │  │- Shop  │      │- Toast  │      │         │            │   │
│  │  │- Cart  │      │         │      │         │            │   │
│  │  │- Check │      │         │      │         │            │   │
│  │  │-  Out  │      │         │      │         │            │   │
│  │  └────────┘      └─────────┘      └─────────┘            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                           │                                     │
│                           │ HTTP (Axios)                        │
└───────────────────────────┼─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐        ┌──────────┐
    │ Proxy   │         │DB       │        │Stripe    │
    │ API     │         │Micro    │        │ API      │
    │(5000)   │         │(5001)   │        │ (External)
    │Flask    │         │Flask    │        │          │
    └─────────┘         └─────────┘        └──────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                        ┌───┴────┐
                        │         │
                        ▼         ▼
                    ┌────────┐┌──────────┐
                    │SQLite  ││Cache/    │
                    │ DB     ││Session   │
                    └────────┘└──────────┘
```

### Capas Arquitectónicas

#### 1. **Presentation Layer (Frontend - React)**

- Componentes React con JSX
- CSS3 Responsive
- Context API para estado global
- LocalStorage para persistencia

#### 2. **API Layer (Axios + HTTP)**

- Cliente Axios con interceptores
- Manejo de tokens JWT
- Reintentos y timeouts
- Manejo de CORS

#### 3. **Application Layer (Flask Backends)**

- **Proxy API** (app.py, puerto 5000)
  - Enrutador central
  - Middleware de CORS
  - Headers de seguridad

- **DB Microservice** (db-microservice/app.py, puerto 5001)
  - Lógica de negocio principal
  - Autenticación JWT
  - Gestión de órdenes
  - Integración Stripe

#### 4. **Data Layer (SQLite)**

- Tablas relacionales
- Índices para performance
- Foreign keys para integridad

#### 5. **External Services**

- Stripe (Pagos)
- PythonAnywhere (Hosting)

---

## 🔄 Flujo de la Aplicación

### 1. **Inicio de la Aplicación**

```
Usuario abre navegador
         │
         ▼
  Carga index.html
         │
         ▼
  Carga React App.js
         │
  ┌──────┴──────┐
  │             │
  ▼             ▼
Providers:   Componentes
- Auth       - Navbar
- Cart       - Router
- Toast      - ScrollTop
  │             │
  └──────┬──────┘
         │
         ▼
AuthContext verifica:
  ├─ ¿Token guardado?
  ├─ ¿Es válido?
  └─ Restaura sesión
         │
         ▼
CartContext carga:
  ├─ Carrito local
  └─ Carrito del usuario (si autenticado)
         │
         ▼
Renderiza página inicial
(ProductList o Navbar según estado)
```

### 2. **Flujo de Autenticación (No Autenticado → Autenticado)**

```
Usuario en página de Login
         │
         ▼
Completa formulario
(username, password)
         │
         ▼
Click en "Entrar"
         │
         ▼
Login.jsx submite datos
         │
         ▼
Axios POST → /api/auth/login
         │
         ▼
DB Microservice (5001):
  ├─ Verifica credenciales
  ├─ Hash contraseña con bcrypt
  ├─ Genera JWT token
  └─ Retorna {access_token, user}
         │
         ▼
Frontend almacena:
  ├─ localStorage['access_token']
  ├─ localStorage['user']
  └─ localStorage['isGuest'] = false
         │
         ▼
AuthContext.setIsAuthenticated(true)
         │
         ▼
Carrito se sincroniza:
  ├─ Carga items previos del usuario
  ├─ Combina con carrito local
  └─ Sincroniza con servidor
         │
         ▼
Redirige a ProductList
```

### 3. **Flujo de Compra (Producto → Carrito → Checkout → Pago)**

```
Usuario visualiza ProductList
         │
         ▼
Click en un producto
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Selecciona  Click en
cantidad    "Agregar al
    │        carrito"
    └────┬────┘
         │
         ▼
ProductList.jsx maneja:
  ├─ Obtiene producto + cantidad
  └─ Llama CartContext.addToCart()
         │
         ▼
CartContext (reducer):
  ├─ Verifica si existe
  ├─ Si existe: incrementa cantidad
  ├─ Si no: agregar nuevo item
  └─ Actualiza cartItems[] state
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Si autenticado:  Si invitado:
  │              │
  ▼              ▼
POST a BD     Guardar en
/api/         localStorage
cart/add      (pendingCart)
         │
         ▼
Toast: "✅ Agregado al carrito"
         │
         ▼
Usuario navega a /cart
         │
         ▼
Cart.jsx:
  ├─ Muestra items del carrito
  ├─ Permite modificar cantidades
  ├─ Calcula total
  └─ Botón "Proceder al checkout"
         │
         ▼
Click en "Proceder a pagar"
         │
         ▼
Validar carrito:
  ├─ ¿Hay items?
  ├─ ¿Stock disponible?
  └─ ¿Precios válidos?
         │
         ▼
Redirige a /checkout
         │
         ▼
Checkout.jsx - Step 1/3:
  ├─ Formulario de cliente
  │  ├─ Nombre
  │  ├─ Email
  │  ├─ Teléfono
  │  ├─ Dirección (opcional)
  │  └─ Notas (opcional)
  │
  └─ Click "Continuar"
         │
         ▼
Checkout.jsx - Step 2/3:
  ├─ Selector de método pago:
  │  ├─ Efectivo (opción 1)
  │  ├─ Tarjeta de crédito (opción 2)
  │  └─ Transferencia (opción 3)
  │
  └─ Click "Continuar"
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Efectivo    Tarjeta
    │          │
    ▼          ▼
Step 3:    Stripe
Confirmación  Payment
Efectivo      Intent
    │          │
    ▼          ▼
Click        Elemento
"Confirmar"  Stripe
    │        incrustado
    ▼        en formulario
Guardar      │
orden en     ▼
BD       Usuario
    │     ingresa datos
    ▼     tarjeta
Email      │
confirma   ▼
    │     POST a Stripe
    ▼     /payment-intents
Redirige    │
a success   ▼
            Stripe
            confirma
            pago
            │
            ▼
            POST
            /confirm-
            payment
            │
            ▼
            Guardar orden
            en BD
            │
            ▼
            Redirige a
            /checkout/success
```

### 4. **Flujo de Sincronización de Carrito**

#### Para Usuarios Invitados:

```
Usuario navega sin login
         │
         ▼
LocalStorage['isGuest'] = true
CartContext usa localStorage
         │
         ▼
Agregar al carrito
  ├─ Actualiza cartItems en state
  └─ NO sincroniza con BD
         │
         ▼
Usuario decide hacer login
         │
         ▼
Carrito pendiente guardado en:
  localStorage['pendingCart']
         │
         ▼
Después de login exitoso:
  CartContext.combineCartWithGuest()
         │
    ┌────┴────┐
    │          │
    ▼          ▼
Items    Items
del      de
usuario  invitado
(BD)     (local)
    │          │
    └────┬─────┘
         │
         ▼
Combina de forma inteligente:
  ├─ Mismos productos → suma cantidad
  ├─ Productos nuevos → agrega
  └─ Sincroniza con BD
         │
         ▼
Limpia localStorage['pendingCart']
```

#### Para Usuarios Autenticados:

```
Usuario login
         │
         ▼
Verificar token en BD
         │
         ▼
Si válido:
  ├─ GET /api/cart
  ├─ Obtiene cartItems del usuario
  └─ Carga en CartContext
         │
         ▼
Cualquier cambio en carrito:
  ├─ Actualiza state local
  ├─ POST /api/cart/update
  └─ Sincroniza con BD (opcional)
         │
         ▼
Si cierra sesión:
  ├─ Carrito guardado en BD
  ├─ localStorage limpio
  └─ Invitado comienza carrito nuevo
```

---

## 📁 Estructura de Carpetas

### Raíz del Proyecto

```
tienda-abarrotes-react/
│
├── 📄 package.json                 # Configuración Node.js/npm
├── 📄 requirements.txt             # Dependencias Python raíz
├── 📄 config.py                    # Configuración general
├── 📄 README.md                    # Documentación principal
├── 📄 ANALISIS_PROYECTO_COMPLETO.md  # Este archivo
│
├── 🗂️ src/                          # CÓDIGO REACT (Frontend)
│   │
│   ├── 📄 App.js                   # Componente raíz
│   ├── 📄 index.js                 # Punto de entrada
│   ├── 📄 App.css                  # Estilos del App
│   ├── 📄 index.css                # Estilos globales
│   │
│   ├── 🗂️ components/              # Componentes React
│   │   ├── Login.jsx               # Formulario de login
│   │   ├── Register.jsx            # Formulario de registro
│   │   ├── ProductList.jsx         # Listado de productos
│   │   ├── Cart.jsx                # Página del carrito
│   │   ├── Navbar.jsx              # Barra de navegación
│   │   ├── Checkout_new.jsx        # Flujo de checkout (v2)
│   │   ├── CheckoutSuccess.jsx     # Página de éxito
│   │   ├── CheckoutCancel.jsx      # Página de cancelación
│   │   ├── AddToCartNotification.jsx # Toast de "agregado"
│   │   ├── LoadingSkeleton.jsx     # Skeleton loading
│   │   ├── ScrollToTop.jsx         # Scroll automático
│   │   ├── ThemeToggle.jsx         # Selector de tema
│   │   ├── ToastProvider.jsx       # Proveedor de notificaciones
│   │   │
│   │   ├── 🗂️ checkout/            # Componentes de checkout
│   │   │   ├── CustomerInfoForm.jsx
│   │   │   ├── PaymentMethodSelector.jsx
│   │   │   ├── CashConfirmation.jsx
│   │   │   ├── StripePayment.jsx
│   │   │   └── OrderConfirmation.jsx
│   │   │
│   │   ├── 📄 *.css                # Estilos de componentes
│   │   └── 📄 *.module.css         # CSS Modules (si aplica)
│   │
│   ├── 🗂️ context/                 # Context API (Estado Global)
│   │   ├── AuthContext.js          # Autenticación y usuario
│   │   └── CartContext.js          # Carrito de compras
│   │
│   ├── 🗂️ hooks/                   # Custom Hooks React
│   │   ├── useCheckoutFlow.js      # Lógica de checkout
│   │   └── [otros hooks]
│   │
│   ├── 🗂️ services/                # Servicios HTTP/API
│   │   ├── api.js                  # Cliente Axios configurado
│   │   ├── paymentService.js       # Servicio de pagos Stripe
│   │   └── [otros servicios]
│   │
│   ├── 🗂️ utils/                   # Funciones utilitarias
│   │   ├── currency.js             # Formateo de moneda
│   │   ├── checkoutValidation.js   # Validaciones de checkout
│   │   └── [otras utilidades]
│   │
│   └── 🗂️ styles/                  # CSS global
│       ├── critical.css            # CSS crítico (Core)
│       ├── ecommerce.css           # Estilos e-commerce
│       ├── global.css              # Estilos globales
│       └── theme.css               # Variables de tema
│
├── 🗂️ backend/                      # PROXY API (Flask - Puerto 5000)
│   ├── 📄 app.py                   # Aplicación Flask proxy
│   ├── 📄 requirements.txt         # Dependencias Python
│   │
│   └── 🗂️ api/                     # Rutas API proxy
│       ├── routes.py               # Enrutador central
│       └── __init__.py             # Inicialización módulo
│
├── 🗂️ db-microservice/             # MICROSERVICIO BD (Flask - Puerto 5001)
│   ├── 📄 app.py                   # Aplicación BD principal (1226 líneas)
│   ├── 📄 app_pythonanywhere.py    # Versión para producción
│   ├── 📄 models.py                # Modelos de BD
│   ├── 📄 db.sqlite3               # Base de datos SQLite
│   ├── 📄 requirements.txt         # Dependencias Python
│   │
│   ├── 📄 init_db.py               # Inicialización BD
│   ├── 📄 init_db_simple.py        # Init simplificado
│   ├── 📄 init_complete_db.py      # Init completo
│   ├── 📄 init_users.py            # Crear usuarios de prueba
│   ├── 📄 init_pythonanywhere_db.py # Init para PythonAnywhere
│   │
│   ├── 📄 test_*.py                # Archivos de prueba
│   ├── 📄 check_*.py               # Scripts de diagnóstico
│   ├── 📄 update_products.py       # Script de actualización
│   └── 📄 wsgi.py                  # Configuración WSGI
│
├── 🗂️ public/                       # Archivos estáticos (index.html, etc)
│   ├── 📄 index.html               # HTML template
│   ├── 📄 manifest.json            # PWA manifest
│   ├── 📄 robots.txt               # SEO
│   └── 🗂️ images/
│       └── 🗂️ products/            # Imágenes de productos
│
├── 🗂️ build/                        # Build de producción (generado)
│   ├── 📄 index.html
│   ├── 📄 manifest.json
│   ├── 📄 robots.txt
│   ├── 🗂️ static/
│   │   ├── 🗂️ css/
│   │   └── 🗂️ js/
│   └── 🗂️ images/
│       └── 🗂️ products/
│
├── 🗂️ __pycache__/                 # Cache Python
│
├── 📄 levantar_tienda.bat          # Script de inicio (Windows)
├── 📄 levantar_tienda.sh           # Script de inicio (Linux/Mac)
├── 📄 app_pythonanywhere.py        # App para deployment
├── 📄 deploy_*.py/.sh              # Scripts de deployment
│
└── 📄 [DOCUMENTACIÓN]
    ├── DEPLOYMENT_GUIDE.md
    ├── PYTHONANYWHERE_DEPLOY.md
    ├── GUIA_EJECUCION_LOCAL.md
    ├── CHECKPOINT_22NOV2025.md
    ├── RESUMEN_FIXES_CHECKOUT.md
    └── [otros documentos...]
```

### Estructura Detallada: `/src/components`

```
src/components/
│
├── 📄 Login.jsx                    # 200 líneas - Autenticación
│   └── 📄 Login.css
│
├── 📄 Register.jsx                 # 250 líneas - Registro usuario
│   └── 📄 Register.css
│
├── 📄 ProductList.jsx              # 610 líneas - Catálogo productos
│   ├── Componente QuantitySelector  # Selector de cantidad
│   ├── Componente SupplierCarousel  # Carrusel por proveedor
│   └── 📄 ProductList.css           # Estilos responsivos
│
├── 📄 Cart.jsx                     # 443 líneas - Carrito compras
│   ├── Componente ProductBottomSheet # Detalles de producto
│   ├── Componente CartItemRow       # Fila de item
│   └── 📄 Cart.css
│
├── 📄 Navbar.jsx                   # Barra de navegación
│   ├── Logo
│   ├── Menú de navegación
│   ├── Carrito badge
│   └── 📄 Navbar.css
│
├── 📄 Checkout_new.jsx             # 333 líneas - Flujo checkout
│   ├── Step 1: Información cliente
│   ├── Step 2: Método de pago
│   ├── Step 3: Confirmación
│   └── Integración Stripe
│   └── 📄 Checkout.css
│
├── 🗂️ checkout/                    # Componentes modulares checkout
│   ├── CustomerInfoForm.jsx        # Formulario cliente
│   ├── PaymentMethodSelector.jsx   # Selector de método pago
│   ├── CashConfirmation.jsx        # Confirmación pago efectivo
│   ├── StripePayment.jsx           # Elemento Stripe
│   ├── OrderConfirmation.jsx       # Confirmación orden
│   ├── 📄 CustomerInfoForm.css
│   ├── 📄 PaymentMethodSelector.css
│   ├── 📄 CashConfirmation.css
│   ├── 📄 StripePayment.css
│   └── 📄 OrderConfirmation.css
│
├── 📄 CheckoutSuccess.jsx          # Página de éxito de compra
│   └── 📄 CheckoutSuccess.css
│
├── 📄 CheckoutCancel.jsx           # Página de cancelación
│   └── 📄 CheckoutCancel.css
│
├── 📄 AddToCartNotification.jsx     # Toast de confirmación
│   └── 📄 AddToCartNotification.css
│
├── 📄 LoadingSkeleton.jsx          # Skeleton loading
│   └── 📄 LoadingSkeleton.css
│
├── 📄 ScrollToTop.jsx              # Auto-scroll al cambiar ruta
│
├── 📄 ThemeToggle.jsx              # Selector de tema (dark/light)
│   └── 📄 ThemeToggle.css
│
└── 📄 ToastProvider.jsx            # Gestor de notificaciones
    └── 📄 ToastProvider.css
```

### Estructura Detallada: `/db-microservice`

```
db-microservice/
│
├── 📄 app.py                       # ⭐ Aplicación principal (1226 líneas)
│   ├── 🔧 Configuración Flask/JWT
│   ├── 🔐 Endpoints autenticación (/api/auth/*)
│   ├── 📦 Endpoints productos (/api/products)
│   ├── 🛒 Endpoints carrito (/api/cart/*)
│   ├── 📋 Endpoints órdenes (/api/orders/*)
│   └── 💳 Endpoints Stripe (/api/stripe/*)
│
├── 📄 models.py                    # Esquema de BD y funciones
│   ├── Tabla users
│   ├── Tabla products
│   ├── Tabla cart_items
│   ├── Tabla orders
│   └── Tabla order_items
│
├── 📄 app_pythonanywhere.py        # Versión productiva
│   └── Configuraciones específicas para PythonAnywhere
│
├── 📄 requirements.txt             # Dependencias mínimas
│   ├── flask
│   ├── flask-cors
│   ├── flask-jwt-extended
│   ├── bcrypt
│   ├── stripe
│   └── python-dotenv
│
├── 📄 wsgi.py                      # Interfaz WSGI para PythonAnywhere
│
├── 🗂️ Inicializadores BD
│   ├── 📄 init_db.py               # Crear tablas básicas
│   ├── 📄 init_db_simple.py        # Versión simplificada
│   ├── 📄 init_complete_db.py      # Con datos de prueba
│   ├── 📄 init_users.py            # Crear usuarios demo
│   └── 📄 init_pythonanywhere_db.py # Configuración remota
│
├── 🗂️ Testing y Diagnóstico
│   ├── 📄 test_login.py
│   ├── 📄 test_login_simple.py
│   ├── 📄 test_api_login.py
│   ├── 📄 test_cart.py
│   ├── 📄 test_puertos.py
│   ├── 📄 check_db.py
│   ├── 📄 check_db_status.py
│   ├── 📄 check_orders_table.py
│   ├── 📄 check_structure.py
│   ├── 📄 verify_db.py
│   ├── 📄 diagnose_files.py
│   └── 📄 diagnose_paths.py
│
├── 📄 update_products.py           # Script actualizar productos
│
├── 📄 db.sqlite3                   # Base de datos SQLite
│
└── 🗂️ __pycache__/                 # Cache compilado
```

---

## 🧩 Componentes Clave

### Frontend: React

#### 1. **Login.jsx** (Autenticación)

```javascript
Funciones:
  - formulario de login (username, password)
  - validación de campos
  - POST a /api/auth/login
  - almacena token y usuario en localStorage
  - redirige a página principal

Estado:
  - username, password
  - isLoading
  - errors

Props:
  - ninguno (redirige automáticamente)
```

#### 2. **Register.jsx** (Registro)

```javascript
Funciones:
  - formulario de registro completo
  - validación de campos
  - verificación de contraseña
  - POST a /api/auth/register
  - automático login después de registro

Campos:
  - username
  - email
  - password
  - first_name
  - last_name
```

#### 3. **ProductList.jsx** (Catálogo - 610 líneas)

```javascript
Función:
  - GET /api/products
  - agrupa productos por proveedor
  - carrusel de proveedores
  - selector inteligente de cantidad
  - búsqueda/filtrado
  - lazy loading de imágenes

Subcomponentes:
  - QuantitySelector: selector desplegable cantidad
  - SupplierCarousel: carrusel de productos
  - ProductCard: tarjeta individual producto

Características:
  - scroll horizontal en mobile
  - botones prev/next carrusel
  - notificaciones de agregado
  - skeleton loading
```

#### 4. **Cart.jsx** (Carrito - 443 líneas)

```javascript
Función:
  - visualizar cartItems
  - modificar cantidades
  - eliminar productos
  - calcular total
  - ver detalles en bottom sheet

Acciones:
  - removeFromCart
  - updateQuantity
  - clearCart
  - proceder a checkout

Subcomponentes:
  - ProductBottomSheet: detalles expandidos
  - CartItemRow: fila de item
  - CartSummary: resumen y total
```

#### 5. **Checkout_new.jsx** (Flujo de Checkout - 333 líneas)

```javascript
Función:
  - flujo de 3 pasos
  - validación en cada paso
  - integración Stripe
  - manejo de errores

Steps:
  1. Información del cliente
  2. Método de pago
  3. Confirmación y pago

Métodos de pago:
  - Efectivo (confirmación)
  - Tarjeta (Stripe)
  - Transferencia
```

#### 6. **Navbar.jsx** (Navegación)

```javascript
Función:
  - logo y brand
  - menú principal
  - carrito badge
  - usuario autenticado
  - logout

Links:
  - /
  - /cart
  - /profile (si autenticado)
```

### Context API (Estado Global)

#### 1. **AuthContext.js**

```javascript
Estado:
  - user: { id, username, email, first_name, last_name }
  - token: JWT access_token
  - isAuthenticated: boolean
  - isLoading: boolean

Funciones:
  - login(username, password)
  - register(datos)
  - logout()
  - refreshToken()
  - validateToken()

Hooks:
  - useAuth(): acceder a contexto
```

#### 2. **CartContext.js** (512 líneas)

```javascript
Estado:
  - cartItems: []
  - { id, name, price_cents, quantity, stock, ... }

Acciones (Reducer):
  - ADD_TO_CART
  - REMOVE_FROM_CART
  - UPDATE_QUANTITY
  - CLEAR_CART
  - LOAD_CART

Funciones:
  - addToCart(producto, cantidad)
  - removeFromCart(id)
  - updateQuantity(id, cantidad)
  - clearCart()
  - loadCartFromDB()
  - combineCartWithGuest()
  - syncCartWithDB()

Características:
  - persistencia en localStorage
  - sincronización con BD
  - soporte modo invitado
  - consolidación al login
```

### Servicios HTTP

#### 1. **api.js** (Cliente Axios)

```javascript
Configuración:
  - URL_API según entorno
  - timeout: 10000ms
  - headers default

Interceptores:
  - request: agregar token JWT
  - response: manejar 401/timeout

Funciones:
  - get()
  - post()
  - put()
  - delete()
```

#### 2. **paymentService.js** (Pagos Stripe)

```javascript
Funciones:
  - createPaymentIntent(monto)
  - confirmPayment(clientSecret)
  - createCheckoutSession(items)
  - getStripeConfig()

Métodos:
  - PAYMENT_METHODS enum
  - processPayment()
```

---

## 🌐 Endpoints API

### Estructura General

```
Frontend → Proxy (5000) → DB Microservice (5001)
```

### Autenticación (`/api/auth/*`)

```
POST /api/auth/register
  Body: {
    username: string (3+ chars)
    email: string (válido)
    password: string (4+ chars)
    first_name: string
    last_name: string
  }
  Response: {
    message: string
    access_token: JWT
    user: { id, username, email, first_name, last_name }
  }
  Status: 201

POST /api/auth/login
  Body: {
    username: string
    password: string
  }
  Response: {
    message: string
    access_token: JWT
    user: { id, username, email, ... }
  }
  Status: 200

GET /api/auth/profile
  Headers: { Authorization: "Bearer <token>" }
  Response: { id, username, email, first_name, last_name, created_at }
  Status: 200

POST /api/auth/logout
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: "Logout exitoso" }
  Status: 200
```

### Productos (`/api/products/*`)

```
GET /api/products
  Response: [
    {
      id: int
      name: string
      description: string
      price_cents: int (en centavos)
      stock: int
      supplier: string
      brand: string
      weight: string
      image: string (nombre archivo)
      ingredients: string (opcional)
    }
  ]
  Status: 200

GET /api/products/<id>
  Response: { ... }
  Status: 200
```

### Carrito (`/api/cart/*`)

```
GET /api/cart
  Headers: { Authorization: "Bearer <token>" }
  Response: [
    { id, name, price_cents, quantity, stock, ... }
  ]
  Status: 200

POST /api/cart/add
  Headers: { Authorization: "Bearer <token>" }
  Body: {
    product_id: int
    quantity: int
  }
  Response: { message: string, cartItems: [...] }
  Status: 200

POST /api/cart/update
  Headers: { Authorization: "Bearer <token>" }
  Body: {
    items: [{ product_id, quantity }, ...]
  }
  Response: { success: bool }
  Status: 200

POST /api/cart/remove/<product_id>
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: string }
  Status: 200

POST /api/cart/clear
  Headers: { Authorization: "Bearer <token>" }
  Response: { message: string }
  Status: 200
```

### Órdenes (`/api/orders/*`)

```
POST /api/orders
  Headers: { Authorization: "Bearer <token>" }
  Body: {
    items: [{ product_id, quantity, price }, ...]
    customer_name: string
    customer_email: string
    customer_phone: string
    delivery_address: string (opcional)
    payment_method: 'cash'|'card'|'transfer'
    payment_intent_id: string (si stripe)
    total_amount: float
  }
  Response: {
    order_id: int
    order_number: string (ORD-timestamp)
    status: string
    total_amount: float
  }
  Status: 201

GET /api/orders/<order_id>
  Headers: { Authorization: "Bearer <token>" }
  Response: { order details }
  Status: 200

GET /api/orders
  Headers: { Authorization: "Bearer <token>" }
  Response: [ list of orders ]
  Status: 200
```

### Stripe (`/api/stripe/*`)

```
GET /api/stripe/config
  Response: {
    publishable_key: string
  }
  Status: 200

POST /api/stripe/create-payment-intent
  Body: {
    amount: int (en centavos)
    currency: string
    metadata: { ... }
  }
  Response: {
    client_secret: string
  }
  Status: 200

POST /api/stripe/confirm-payment
  Body: {
    payment_intent_id: string
    customer_name: string
    customer_email: string
  }
  Response: {
    status: 'succeeded'|'failed'
    message: string
  }
  Status: 200
```

---

## 🔄 Flujo de Datos

### Flujo de Datos General

```
LocalStorage → React Component
     ↕              ↕
AuthContext ← → CartContext
     ↕              ↕
    API (Axios)
     ↕
 Backend (5000)
     ↕
DB Service (5001)
     ↕
SQLite Database
     ↕
(Stripe API)
```

### Ejemplo: Agregar Producto al Carrito

```
ProductList Component:
  ├─ onClick handler "Agregar"
  │
  └─ CartContext.dispatch({
       type: 'ADD_TO_CART',
       payload: {
         id: 5,
         name: "Galletas Gamesa",
         price_cents: 2500,
         quantity: 2,
         stock: 50,
         ...
       }
     })

CartContext Reducer:
  ├─ Verifica si producto existe
  ├─ Si existe:
  │   └─ Incrementa quantity
  ├─ Si no:
  │   ├─ Asigna order
  │   └─ Agrega nuevo item
  │
  └─ Actualiza state.cartItems

useEffect (CartContext):
  ├─ Si autenticado:
  │   ├─ POST /api/cart/update
  │   └─ Sincroniza con BD
  ├─ Si invitado:
  │   └─ localStorage['cartItems'] = JSON

Component re-render:
  ├─ Actualiza UI carrito
  ├─ Toast: "✅ Agregado al carrito"
  └─ Badge del carrito se incrementa
```

### Ejemplo: Completar Compra

```
Checkout Component:
  ├─ Paso 1: Valida info cliente
  ├─ Paso 2: Selecciona método pago
  └─ Paso 3: Procesa pago
     │
     ├─ Si efectivo:
     │   ├─ POST /api/orders
     │   │   └─ Crea orden en BD
     │   └─ Redirige a /checkout/success
     │
     ├─ Si tarjeta:
     │   ├─ POST /api/stripe/create-payment-intent
     │   │   └─ Retorna client_secret
     │   │
     │   ├─ Stripe Elements procesa tarjeta
     │   │
     │   ├─ POST /api/stripe/confirm-payment
     │   │   └─ Confirma pago en Stripe
     │   │
     │   └─ Si exitoso:
     │       ├─ POST /api/orders
     │       ├─ Limpia carrito
     │       └─ Redirige a /checkout/success
     │
     └─ Si falla:
         ├─ Muestra error
         └─ Redirige a /checkout/cancel

DB Microservice:
  ├─ Crea orden_id
  ├─ Genera order_number (ORD-timestamp)
  ├─ Inserta en tabla orders
  ├─ Inserta items en order_items
  ├─ Actualiza stock de productos
  └─ Envía confirmación (email opcional)

Frontend:
  ├─ CartContext.clearCart()
  ├─ localStorage.clear()
  └─ Redirige a /checkout/success
```

---

## 🔐 Autenticación y Seguridad

### Flujo de Autenticación JWT

```
1. Usuario Login
   ├─ Username + Password
   └─ POST /api/auth/login

2. Backend valida
   ├─ Busca usuario en BD
   ├─ Verifica contraseña con bcrypt
   └─ Si válido:
       ├─ Genera JWT token
       │   {
       │     payload: { user_id },
       │     secret: "secret-key",
       │     expiresIn: 24h
       │   }
       └─ Retorna access_token

3. Frontend almacena
   ├─ localStorage['access_token']
   ├─ localStorage['user']
   └─ AuthContext.setIsAuthenticated(true)

4. Requests posteriores
   ├─ Axios interceptor agrega header:
   │   Authorization: Bearer {access_token}
   └─ Backend verifica:
       ├─ Extrae token del header
       ├─ Valida firma con secret
       ├─ Verifica expiración
       └─ Si válido: procesa request

5. Si token inválido/expirado
   ├─ Backend retorna 401
   ├─ Frontend limpia localStorage
   ├─ Redirige a /login
   └─ Usuario debe reautenticarse
```

### Seguridad de Contraseñas

```
Backend (bcrypt):
  ├─ Generación:
  │   password + salt → hash
  │   salt rounds: 12
  │
  ├─ Verificación:
  │   password + hash → match boolean
  │
  └─ NO se almacenan contraseñas en plano

Frontend:
  ├─ Validación básica:
  │   ├─ 4+ caracteres
  │   ├─ No empty
  │   └─ Confirmación (registro)
  │
  └─ HTTPS en producción
```

### Protección CORS

```
Backend Headers:
  ├─ Access-Control-Allow-Origin: *
  ├─ Access-Control-Allow-Methods: GET, POST, PUT, DELETE
  ├─ Access-Control-Allow-Headers: Content-Type, Authorization
  └─ Cache-Control: no-cache, no-store, must-revalidate

Frontend:
  ├─ Axios CORS automático
  └─ Proxy en desarrollo (5000 → 5001)
```

### Tokens JWT

```
Estructura:
  Header: {
    alg: "HS256"
    typ: "JWT"
  }

  Payload: {
    user_id: int,
    iat: timestamp creación,
    exp: timestamp expiración (24h después)
  }

  Signature: HMACSHA256(
    base64(header) + "." + base64(payload),
    secret
  )

Almacenamiento:
  ├─ localStorage['access_token'] ✅ (simple pero no ideal)
  ├─ sessionStorage[] (más seguro, se pierde al cerrar)
  └─ HttpOnly cookies (mejor, no accesible desde JS)
```

---

## 🛒 Sistema de Carrito

### Estado del Carrito

```
CartContext.state:
  {
    cartItems: [
      {
        id: 1,
        name: "Producto X",
        price_cents: 5000,  // $50.00
        quantity: 2,
        stock: 10,
        supplier: "bimbo",
        image: "producto.jpg",
        order: 1,  // Orden visual
        addedAt: 1708300000000  // Timestamp
      },
      ...
    ],
    subtotal: 50000 (centavos),
    tax: 0 (opcional),
    total: 50000
  }
```

### Ciclo de Vida del Carrito

```
1. Inicialización
   ├─ AuthContext carga token/usuario
   │
   └─ useEffect en CartContext:
       ├─ Si autenticado:
       │   ├─ GET /api/cart
       │   └─ loadCartFromDB()
       │
       └─ Si invitado:
           ├─ localStorage['cartItems']
           └─ setState(cartItems)

2. Agregar Producto
   ├─ dispatch(ADD_TO_CART, producto)
   │
   ├─ Reducer actualiza state
   │
   └─ useEffect sincroniza:
       ├─ Si autenticado: POST /api/cart/update
       └─ Si invitado: localStorage update

3. Modificar Cantidad
   ├─ dispatch(UPDATE_QUANTITY, id, cantidad)
   │
   └─ Sincroniza con BD/localStorage

4. Eliminar Producto
   ├─ dispatch(REMOVE_FROM_CART, id)
   │
   └─ Sincroniza

5. Limpiar Carrito
   ├─ dispatch(CLEAR_CART)
   │
   └─ Sincroniza

6. Consolidación (Invitado → Autenticado)
   ├─ Usuario login
   │
   ├─ PendingCartLoader:
   │   ├─ Obtiene cartItems BD
   │   ├─ Obtiene pendingCart localStorage
   │   │
   │   └─ combineCartWithGuest():
   │       ├─ Mezcla ambos
   │       ├─ Suma cantidades de mismo producto
   │       └─ Sincroniza con BD
   │
   └─ localStorage['pendingCart'] = null
```

### Persistencia

```
LocalStorage (Invitado):
  {
    "cartItems": [{ id, name, quantity, ... }],
    "isGuest": true,
    "pendingCart": null  // se rellena si login
  }

Base de Datos (Autenticado):
  Table: cart_items
  {
    id: int (PK)
    user_id: int (FK)
    product_id: int (FK)
    quantity: int
    added_at: timestamp
  }
```

### Validación de Carrito

```
Antes de checkout:
  ├─ ¿Hay items? → error si vacío
  │
  ├─ Para cada item:
  │   ├─ ¿Existe en BD?
  │   ├─ ¿Tiene stock suficiente?
  │   ├─ ¿Precio válido?
  │   └─ ¿Cantidad > 0?
  │
  └─ Si hay error:
      ├─ Toast error
      └─ Bloquea checkout
```

---

## 💳 Proceso de Checkout

### Flujo de 3 Pasos

```
PASO 1: Información del Cliente
┌──────────────────────────────┐
│ - Nombre completo            │
│ - Email                      │
│ - Teléfono                   │
│ - Dirección entrega          │
│ - Notas adicionales (opt)    │
│                              │
│ [Validar] [Siguiente]        │
└──────────────────────────────┘
         │
         ▼ (Siguiente)

PASO 2: Seleccionar Método de Pago
┌──────────────────────────────┐
│ ◉ Efectivo                   │
│ ○ Tarjeta de Crédito         │
│ ○ Transferencia Bancaria     │
│                              │
│ [Anterior] [Siguiente]       │
└──────────────────────────────┘
         │
         ▼ (Siguiente)

PASO 3: Confirmación y Pago
┌──────────────────────────────┐
│ Resumen de Orden             │
│ - Items x cantidad           │
│ - Subtotal: $500.00          │
│ - Total: $500.00             │
│                              │
│ Si Efectivo:                 │
│ [Confirmar Compra]           │
│                              │
│ Si Tarjeta:                  │
│ [Stripe Payment Form]        │
│ [Procesar Pago]              │
│                              │
│ [Anterior] [Completar]       │
└──────────────────────────────┘
         │
         ▼ (Completar)

┌──────────────────────────────┐
│ Procesando...                │
└──────────────────────────────┘
         │
    ┌────┴────┐
    │          │
    ▼          ▼
 Éxito      Error
    │          │
    ▼          ▼
/checkout/ /checkout/
success    cancel
```

### Validaciones en Cada Paso

#### Paso 1 Validaciones

```javascript
- nombre: required, min 3 chars
- email: required, email válido (regex)
- teléfono: required, formato válido
- dirección: opcional
- Si no autenticado:
  └─ todo requerido
```

#### Paso 2 Validaciones

```javascript
- método de pago seleccionado
  ├─ 'cash'
  ├─ 'card'
  └─ 'transfer'
```

#### Paso 3 Validaciones

```javascript
Cartesianos:
  ├─ cartItems no vacío
  ├─ total > 0
  └─ Cada item con stock

Método 'cash':
  └─ Solo confirmación

Método 'card':
  ├─ Tarjeta válida (Stripe validation)
  ├─ Nombre titular
  ├─ CVC válido
  └─ Fecha expiración válida
```

### Estados del Checkout

```
CartContext.checkoutState:
  {
    currentStep: 1|2|3|4,
    formData: {
      customerName: string,
      customerEmail: string,
      customerPhone: string,
      deliveryAddress: string,
      orderNotes: string,
      paymentMethod: 'cash'|'card'|'transfer',
      cardToken: string (si tarjeta)
    },
    errors: {
      customerName: string?,
      customerEmail: string?,
      ...
    },
    loading: false,
    orderNumber: null,
    orderComplete: false,
    isGuest: boolean
  }
```

### Manejo de Errores en Checkout

```
Errores de Validación:
  ├─ Campo vacío
  │   └─ Toast: "El campo X es requerido"
  │
  ├─ Formato inválido
  │   └─ Toast: "Formato no válido"
  │
  └─ Carrito inválido
      └─ Redirige a /cart

Errores de Pago (Tarjeta):
  ├─ Tarjeta rechazada
  │   └─ Toast: "Tu tarjeta fue rechazada"
  │
  ├─ Fondos insuficientes
  │   └─ Toast: "Fondos insuficientes"
  │
  ├─ Expirada
  │   └─ Toast: "Tu tarjeta está vencida"
  │
  └─ Error de conectividad
      └─ Toast: "Error al conectar con Stripe"

Errores de Base de Datos:
  ├─ No se puede crear orden
  │   └─ Toast: "Error al procesar compra"
  │
  └─ Conflicto de stock
      └─ Toast: "Stock insuficiente para producto X"

Manejo de Errores:
  ├─ Log en consola
  ├─ Toast de error para usuario
  ├─ Mantiene carrito
  └─ Permite reintentar
```

---

## 💳 Integración Stripe

### Flujo de Pago con Stripe

```
1. Frontend obtiene config
   ├─ GET /api/stripe/config
   └─ Retorna: { publishable_key }

2. Usuario inicia pago
   ├─ Valor total del carrito
   └─ POST /api/stripe/create-payment-intent
       Response: { client_secret }

3. Frontend carga Stripe Elements
   ├─ card element (input de tarjeta)
   ├─ billing element (datos facturación)
   └─ confirmPayment(client_secret, card)

4. Stripe procesa pago
   ├─ Valida tarjeta
   ├─ Contacta a banco
   ├─ Retorna status: 'succeeded' | 'failed'
   └─ Envía confirmación

5. Frontend recibe resultado
   ├─ Si exitoso:
   │   ├─ POST /api/stripe/confirm-payment
   │   ├─ Crea orden en BD
   │   └─ Redirige a /checkout/success
   │
   └─ Si falló:
       ├─ Muestra error
       └─ Permite reintentar
```

### Montos en Centavos

```
Frontend:
  price_cents: 5000  // $50.00

  Mostrar usuario:
    formatPrice(5000) → "$50.00"

  Enviar a Stripe:
    POST {
      amount: 5000,  // cents
      currency: 'MXN'
    }

Backend:
  Almacenar:
    price_cents: 5000

  Crear payment_intent:
    amount: 5000  // Stripe espera cents
```

### Configuración Stripe

```
Claves:
  ├─ STRIPE_PUBLIC_KEY (frontend)
  │   └─ Accesible desde navegador
  │   └─ @stripe/react-stripe-js la usa
  │
  └─ STRIPE_SECRET_KEY (backend)
      └─ Nunca exponerla
      └─ Solo en backend (5001)

Métodos de Pago Soportados:
  ├─ card (tarjeta)
  ├─ apple_pay
  ├─ google_pay
  └─ klarna (buy now pay later)

Ambiente:
  ├─ Desarrollo: test keys
  │   └─ pk_test_*
  │   └─ sk_test_*
  │
  └─ Producción: live keys
      └─ pk_live_*
      └─ sk_live_*
```

### Estados de Payment Intent

```
Creación:
  POST /api/stripe/create-payment-intent
  ├─ amount: int (centavos)
  ├─ currency: 'MXN'
  ├─ metadata: { order_id, user_id }
  └─ Receipt email (opcional)

Estados:
  ├─ requires_payment_method
  │   └─ Esperando método de pago
  │
  ├─ requires_confirmation
  │   └─ Esperando confirmación del cliente
  │
  ├─ processing
  │   └─ Procesando pago
  │
  ├─ succeeded
  │   └─ ✅ Pago completado
  │
  ├─ requires_action
  │   └─ Necesita autenticación 3D Secure
  │
  ├─ canceled
  │   └─ ❌ Cancelado por usuario
  │
  └─ processing
      └─ Último intento antes de fallar
```

### Webhooks (Opcional)

```
Stripe envía eventos a:
  POST https://[dominio]/webhooks/stripe

Eventos manejados:
  ├─ payment_intent.succeeded
  │   └─ Confirmar pago en BD
  │
  ├─ payment_intent.payment_failed
  │   └─ Registrar fallo
  │
  ├─ charge.refunded
  │   └─ Procesar reembolso
  │
  └─ invoice.payment_succeeded
      └─ Confirmación
```

---

## 🚀 Deployment

### Desarrollo Local

```bash
# 1. Clonar repo
git clone https://github.com/exael2000/tienda-abarrotes-react.git
cd tienda-abarrotes-react

# 2. Backend DB Microservice (Puerto 5001)
cd db-microservice
python -m venv venv
source venv/bin/activate  # Linux/Mac
.venv\Scripts\activate    # Windows
pip install -r requirements.txt
python init_db.py
python app.py
# Escucha en http://localhost:5001

# 3. Backend Proxy (Puerto 5000) - en otra terminal
cd ..
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
# Escucha en http://localhost:5000

# 4. Frontend React
npm install
npm start
# Abre http://localhost:3000
```

### Windows (Script Automático)

```batch
# levantar_tienda.bat (Ejecutar con doble click)
```

### Estructura de Puertos

```
┌─────────────────┐
│ Frontend React  │
│  :3000          │
└────────┬────────┘
         │
         ▼ (proxy)
┌─────────────────┐
│ Backend Proxy   │ api.js
│  :5000          │ /api → :5000
└────────┬────────┘
         │
         ▼ (requests)
┌─────────────────┐
│ DB Microservice │
│  :5001          │
└────────┬────────┘
         │
         ▼
    ┌─────────┐
    │ SQLite  │
    └─────────┘
```

### Build de Producción

```bash
# Frontend
npm run build
# Genera: ./build/
# Archivos estáticos en ./build/static/

# Backend (sin cambios necesarios)
# app_pythonanywhere.py es la versión productiva
```

### Deployment en PythonAnywhere

```
1. Configurar en PythonAnywhere:
   ├─ Crear cuenta
   ├─ Subir código vía Git
   ├─ Crear WSGI file
   └─ Configurar módulos Python

2. WSGI Configuration:
   ├─ Usar app_pythonanywhere.py
   ├─ Configurar path
   └─ Recargar sitio web

3. Variables de Entorno:
   ├─ STRIPE_KEY
   ├─ JWT_SECRET
   └─ FLASK_ENV = production

4. Static Files:
   ├─ /static/css/
   ├─ /static/js/
   └─ /images/products/

5. URL:
   └─ https://exael.pythonanywhere.com
```

---

## 📊 Diagrama de Flujo Completo

```
                    ┌─────────────────────────┐
                    │   USUARIO FINAL         │
                    │   (Navegador)           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                         ┌─────────────────┐
                         │  React App.js   │
                         │  :3000          │
                         └────────┬────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
                 ▼                ▼                ▼
            ┌─────────┐      ┌─────────┐      ┌─────────┐
            │ Routes  │      │Context  │      │Services │
            │- /      │      │- Auth   │      │- Axios  │
            │- /cart  │      │- Cart   │      │- Stripe │
            │- /check │      │- Toast  │      │- API    │
            │- /login │      │         │      │- Payment│
            └────┬────┘      └────┬────┘      └────┬────┘
                 │                │                │
                 └────────────────┼────────────────┘
                                  │
                                  ▼ HTTP (JSON)
                         ┌─────────────────────┐
                         │ Backend Proxy:5000  │
                         │  Flask              │
                         │ api/routes.py       │
                         └────────────┬────────┘
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                         ▼            ▼            ▼
                    ┌─────────┐  ┌─────────┐  ┌──────────┐
                    │ Auth    │  │Products │  │ Stripe   │
                    │ Routes  │  │Routes   │  │ Routes   │
                    └────┬────┘  └────┬────┘  └────┬─────┘
                         │            │            │
                         └────────────┼────────────┘
                                      │
                                      ▼ HTTP (JSON)
                   ┌────────────────────────────────────┐
                   │ DB Microservice:5001               │
                   │  Flask + JWT + Stripe API          │
                   │  db-microservice/app.py            │
                   │  - 1226 líneas                      │
                   │  - Endpoints completos             │
                   └──────────────┬─────────────────────┘
                                  │
                    ┌─────────────┼──────────────┐
                    │             │              │
                    ▼             ▼              ▼
                ┌─────────┐  ┌─────────┐  ┌──────────────┐
                │SQLite   │  │JWT      │  │Stripe API    │
                │Database │  │Tokens   │  │(External)    │
                │db.sqlite│  │(verify) │  │(Production)  │
                └─────────┘  └─────────┘  └──────────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
         ▼                     ▼
    ┌────────────┐        ┌────────────┐
    │ users      │        │ products   │
    │ cart_items │        │ orders     │
    │ orders     │        │ order_items│
    └────────────┘        └────────────┘
```

---

## 📝 Resumen Ejecutivo

### Tecnologías Principales

- **Frontend**: React 19.2 + Context API + Axios
- **Backend**: Flask 3.0 + JWT + SQLite
- **Pagos**: Stripe API
- **Hosting**: PythonAnywhere

### Características Clave

- ✅ Autenticación JWT completa
- ✅ Carrito persistente (localStorage + BD)
- ✅ Modo invitado sin registro
- ✅ Checkout de 3 pasos
- ✅ Múltiples métodos de pago
- ✅ Integración Stripe
- ✅ Responsive design
- ✅ SPA con React Router

### Entidades Principales

1. **Usuarios** - Registro, login, perfil
2. **Productos** - Catálogo, proveedores
3. **Carrito** - Items, cantidades, sincronización
4. **Órdenes** - Creación, seguimiento, pagos
5. **Métodos de Pago** - Efectivo, tarjeta, transferencia

### Flujo Principal

Usuario → Navega productos → Agrega al carrito → Checkout → Pago → Orden confirmada

### Archivos Clave

- `src/App.js` - App raíz
- `src/context/AuthContext.js` - Autenticación
- `src/context/CartContext.js` - Carrito (512 líneas)
- `src/components/ProductList.jsx` - Catálogo (610 líneas)
- `src/components/Checkout_new.jsx` - Checkout (333 líneas)
- `db-microservice/app.py` - Backend principal (1226 líneas)

### Endpoints Principales

- `/api/auth/*` - Autenticación
- `/api/products` - Productos
- `/api/cart/*` - Carrito
- `/api/orders/*` - Órdenes
- `/api/stripe/*` - Pagos Stripe

---

## 🔗 GitHub

- **Repositorio**: https://github.com/exael2000/tienda-abarrotes-react
- **Owner**: exael2000
- **Rama activa**: main
- **Status**: Conectado y sincronizado

---

**Documentación generada**: Febrero 19, 2026
**Versión del proyecto**: 1.0.0
**Estado**: En producción (PythonAnywhere)
