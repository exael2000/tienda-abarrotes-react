# 🚀 Configuración de Stripe en PythonAnywhere

## ⚡ Variables de Entorno Requeridas

Para que la integración de Stripe funcione correctamente, debes configurar las siguientes variables de entorno en PythonAnywhere:

### 🔑 Claves de Stripe

```bash
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_aqui
```

## 📋 Pasos para Configurar

### 1. Acceder a la Consola de PythonAnywhere
- Ve a tu dashboard en PythonAnywhere
- Haz clic en "Consoles" → "Bash"

### 2. Editar el archivo WSGI
```bash
nano /var/www/exael_pythonanywhere_com_wsgi.py
```

### 3. Añadir las Variables de Entorno
Añade estas líneas al inicio del archivo WSGI, antes de las importaciones:

```python
import os
import sys

# Configurar variables de entorno para Stripe
os.environ['STRIPE_SECRET_KEY'] = 'sk_test_tu_clave_secreta_aqui'
os.environ['STRIPE_PUBLIC_KEY'] = 'pk_test_tu_clave_publica_aqui'

# Resto de la configuración...
```

### 4. Alternativa: Archivo .env (Más Seguro)
Si prefieres usar un archivo .env:

```bash
cd /home/exael/mysite
nano .env
```

Añade el contenido:
```
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui
STRIPE_PUBLIC_KEY=pk_test_tu_clave_publica_aqui
```

Y modifica tu aplicación para cargar este archivo.

## 🔧 Verificar la Configuración

### 1. Probar en Consola Python
```python
import os
print("STRIPE_SECRET_KEY:", os.environ.get('STRIPE_SECRET_KEY'))
print("STRIPE_PUBLIC_KEY:", os.environ.get('STRIPE_PUBLIC_KEY'))
```

### 2. Reiniciar la Aplicación Web
- Ve a "Web" en el dashboard
- Haz clic en "Reload exael.pythonanywhere.com"

## 🌐 URLs de Producción Configuradas

El sistema está configurado para usar estas URLs en producción:
- **Success URL**: `https://exael.pythonanywhere.com/checkout/success?session_id={CHECKOUT_SESSION_ID}`
- **Cancel URL**: `https://exael.pythonanywhere.com/checkout/cancel`

## 🔒 Obtener Claves de Stripe

### Claves de Prueba (Test)
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Activa "Test Mode" (interruptor en la parte superior)
3. Ve a "Developers" → "API keys"
4. Copia las claves que empiezan con:
   - `sk_test_...` (Secret key)
   - `pk_test_...` (Publishable key)

### Claves de Producción (Live) - Solo cuando estés listo
1. Completa la verificación de tu cuenta Stripe
2. Desactiva "Test Mode"
3. Usa las claves que empiezan con:
   - `sk_live_...` (Secret key)
   - `pk_live_...` (Publishable key)

## ✅ Verificación Final

Una vez configurado, prueba:
1. Ir a tu sitio: `https://exael.pythonanywhere.com`
2. Añadir productos al carrito
3. Proceder al checkout
4. Usar tarjeta de prueba: `4242 4242 4242 4242`
5. Verificar que se redirija correctamente a Stripe y de vuelta

## 🚨 Importante

- **NUNCA** hardcodees las claves en el código
- Usa **solo claves de prueba** hasta estar listo para producción
- Las claves de prueba comienzan con `sk_test_` y `pk_test_`
- Las claves de producción comienzan con `sk_live_` y `pk_live_`

## 🎯 Tarjetas de Prueba de Stripe

```
Visa: 4242 4242 4242 4242
Visa (debit): 4000 0566 5566 5556
Mastercard: 5555 5555 5555 4444
American Express: 3782 822463 10005

Cualquier CVC: 123
Cualquier fecha futura: 12/34
```

¡Con esto tu integración de Stripe estará completamente funcional en PythonAnywhere! 🎉