# 🚀 Guía Completa de Deployment - PythonAnywhere

## 📋 Problemas Identificados y Soluciones

### ❌ Errores Encontrados:
1. **STRIPE_SECRET_KEY faltante** - Variable de entorno no configurada
2. **Ruta 404**: `/checkout/success` no existía 
3. **Tablas faltantes**: `users`, `cart_items`, `orders`, `order_items`
4. **Endpoints duplicados**: Error en `get_products`
5. **Variable incorrecta**: `STRIPE_PUBLIC_KEY` vs `STRIPE_PUBLISHABLE_KEY`

### ✅ Soluciones Implementadas:
1. ✅ Añadido soporte para archivo `.env`
2. ✅ Creadas rutas `/checkout/success` y `/checkout/cancel`
3. ✅ Añadida ruta `/api/verify-payment` para verificación de Stripe
4. ✅ Script de inicialización de base de datos
5. ✅ Corregidas variables de entorno de Stripe

---

## 🔧 Pasos de Deployment

### 1. 📤 Subir Cambios a Git

```bash
# En tu máquina local
git add .
git commit -m "Fix: Resolver errores de PythonAnywhere - Stripe routes, DB tables, env vars"
git push origin main
```

### 2. 🔄 Actualizar en PythonAnywhere

```bash
# En la consola de PythonAnywhere
cd ~/tienda-abarrotes-react
git pull origin main
```

### 3. 🗄️ Configurar Base de Datos

```bash
# Ejecutar script de inicialización
python3 init_pythonanywhere_db.py
```

### 4. 🔐 Configurar Variables de Entorno

1. **Obtener claves de Stripe:**
   - Ve a: https://dashboard.stripe.com/test/apikeys
   - Copia tu `Publishable key` (pk_test_...)
   - Copia tu `Secret key` (sk_test_...)

2. **Crear archivo .env:**
```bash
# En PythonAnywhere console
cd ~/tienda-abarrotes-react
nano .env
```

3. **Contenido del .env:**
```env
# Variables de entorno para PythonAnywhere
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
FLASK_ENV=production
SECRET_KEY=tu_super_secret_key_para_jwt_sessions_muy_segura
DATABASE_URL=sqlite:///db.sqlite3
```

4. **Guardar archivo:**
   - Presiona `Ctrl+X`
   - Presiona `Y`
   - Presiona `Enter`

### 5. 📦 Instalar Dependencias

```bash
# Instalar python-dotenv si no está instalado
pip3.10 install --user python-dotenv
```

### 6. 🔄 Reiniciar Aplicación Web

1. Ve al **Dashboard de PythonAnywhere**
2. Clic en **"Web"** en el menú superior
3. Encuentra tu aplicación `exael.pythonanywhere.com`
4. Clic en **"Reload"** (botón verde)

---

## 🧪 Verificar Funcionamiento

### ✅ Checklist de Verificación:

1. **🌐 Página principal:**
   - [ ] https://exael.pythonanywhere.com carga correctamente

2. **🔐 Autenticación:**
   - [ ] Login funciona
   - [ ] Registro funciona
   
3. **🛒 Carrito:**
   - [ ] Agregar productos al carrito
   - [ ] Ver carrito funciona

4. **💳 Pagos Stripe:**
   - [ ] Crear sesión de Stripe funciona
   - [ ] Redirección a Stripe Checkout
   - [ ] Página de éxito `/checkout/success` carga
   - [ ] Verificación de pago `/api/verify-payment` funciona
   - [ ] Orden se crea en base de datos

### 🔍 Rutas Agregadas:

```
✅ GET  /checkout/success?session_id=...  - Página de éxito
✅ GET  /checkout/cancel                  - Página de cancelación
✅ POST /api/verify-payment               - Verificar pago Stripe
✅ GET  /api/stripe/config               - Obtener clave pública
```

---

## 🚨 Solución de Problemas

### ❌ Error: "STRIPE_SECRET_KEY environment variable is required"
**Solución:**
1. Verificar que el archivo `.env` existe
2. Verificar que contiene las claves correctas
3. Reiniciar la aplicación web

### ❌ Error: "no such table: users"
**Solución:**
```bash
cd ~/tienda-abarrotes-react
python3 init_pythonanywhere_db.py
```

### ❌ Error 404 en /checkout/success
**Solución:**
- Ya resuelto ✅ - Ruta agregada en `app_pythonanywhere.py`

### ❌ Error: "AssertionError: View function mapping is overwriting"
**Solución:**
- Ya resuelto ✅ - Endpoints duplicados eliminados

---

## 📊 Estructura de Base de Datos

```sql
✅ users           - Usuarios del sistema
✅ productos       - Catálogo de productos  
✅ cart_items      - Items en carrito de usuarios
✅ orders          - Órdenes de compra
✅ order_items     - Items de cada orden
```

---

## 🔄 Flujo de Pago Completo

1. **Usuario agrega productos al carrito**
2. **Usuario procede al checkout**
3. **Se crea sesión de Stripe** (`/api/stripe/create-checkout-session`)
4. **Usuario es redirigido a Stripe Checkout**
5. **Usuario completa el pago**
6. **Stripe redirige a** `/checkout/success?session_id=...`
7. **Página ejecuta verificación automática** (`/api/verify-payment`)
8. **Se crea la orden en la base de datos**
9. **Usuario ve confirmación de pago**

---

## 📝 Logs para Monitoreo

### Ver logs de errores:
```bash
# En PythonAnywhere
tail -f /var/log/exael.pythonanywhere.com.error.log
```

### Ver logs de acceso:
```bash
# En PythonAnywhere  
tail -f /var/log/exael.pythonanywhere.com.access.log
```

---

## ✅ Deployment Completado

Una vez seguidos todos estos pasos:

1. ✅ **Variables de entorno configuradas**
2. ✅ **Base de datos inicializada** 
3. ✅ **Rutas de Stripe funcionando**
4. ✅ **Páginas de éxito/cancelación funcionando**
5. ✅ **Verificación de pagos funcionando**
6. ✅ **Órdenes creándose correctamente**

🎉 **¡Tu aplicación está lista en producción!**

---

## 📞 Soporte

Si encuentras algún problema:

1. **Revisar logs de error** en PythonAnywhere
2. **Verificar variables de entorno** en `.env`
3. **Confirmar que base de datos** tiene todas las tablas
4. **Reiniciar aplicación web** en dashboard

---

*Última actualización: Octubre 9, 2025*