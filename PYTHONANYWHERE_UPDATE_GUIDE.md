# 🚀 Guía de Actualización en PythonAnywhere

## 📋 Resumen de cambios a desplegar:
- ✅ **Integración completa de Stripe Checkout**
- ✅ **Creación automática de órdenes en base de datos**
- ✅ **Páginas de checkout optimizadas (loading y cancelación)**
- ✅ **Nuevas tablas: orders y order_items**
- ✅ **Endpoint /api/verify-payment para validar pagos**

---

## 🎯 Pasos para actualizar en PythonAnywhere:

### 1. 🔐 Conectarse a PythonAnywhere
```bash
# Abrir una consola Bash en PythonAnywhere
# Dashboard → Tasks → New console → Bash
```

### 2. 📁 Navegar al directorio del proyecto
```bash
cd ~/tienda-abarrotes-react
pwd  # Verificar que estás en el directorio correcto
```

### 3. 📥 Hacer pull de los cambios
```bash
git pull origin main
```

### 4. 🗄️ Inicializar base de datos con nuevas tablas
```bash
python3.10 init_complete_db.py
```

### 5. 🔍 Verificar que todo esté correcto
```bash
# Verificar tablas de órdenes
python3.10 check_orders_table.py

# Verificar configuración
python3.10 -c "from app_pythonanywhere import app; print('✅ App OK')"
```

### 6. 🔄 Reiniciar la aplicación web
```
1. Ve al Dashboard de PythonAnywhere
2. Sección "Web" 
3. Click en "Reload exael.pythonanywhere.com"
4. Esperar a que aparezca "✓ Reloaded"
```

### 7. 🧪 Probar la aplicación
```
1. Visita: https://exael.pythonanywhere.com
2. Agrega productos al carrito
3. Haz un checkout con Stripe (usar tarjeta de prueba)
4. Verifica que se cree la orden correctamente
```

---

## 🛠️ Script automático (Opcional):

Si prefieres ejecutar todo automáticamente:

```bash
# Desde la consola de PythonAnywhere:
cd ~/tienda-abarrotes-react
bash pythonanywhere_update.sh
```

---

## 🔧 Verificaciones importantes:

### ✅ Variables de entorno:
- `STRIPE_SECRET_KEY` debe estar configurada
- `STRIPE_PUBLISHABLE_KEY` debe estar configurada

### ✅ Base de datos:
- Tabla `orders` debe existir
- Tabla `order_items` debe existir
- Productos deben estar cargados

### ✅ Endpoints:
- `/api/products` → Lista productos
- `/api/stripe/create-checkout-session` → Crea sesión de pago
- `/api/verify-payment` → Verifica pago y crea orden

---

## 🚨 Solución de problemas:

### Si el pull falla:
```bash
git status
git stash  # Si hay cambios locales
git pull origin main
```

### Si las tablas no se crean:
```bash
python3.10 -c "
import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute('DROP TABLE IF EXISTS orders')
cursor.execute('DROP TABLE IF EXISTS order_items')
conn.commit()
conn.close()
"
python3.10 init_complete_db.py
```

### Si Stripe no funciona:
- Verificar las keys en el dashboard de PythonAnywhere
- Asegurar que sean las keys de LIVE (no test) para producción

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará actualizada con:
- 💳 Pagos con Stripe completamente funcionales
- 📊 Historial de órdenes en base de datos  
- 🎨 UI optimizada para mejor experiencia de usuario
- 🚀 Performance mejorado en páginas de checkout