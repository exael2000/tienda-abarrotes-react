# 🚀 Guía de Deploy en PythonAnywhere

Esta guía te ayudará a desplegar el microservicio de base de datos en PythonAnywhere paso a paso.

## 📋 Archivos para Subir

Los siguientes archivos de la carpeta `db-microservice/` deben subirse a PythonAnywhere:

```
db-microservice/
├── app.py                 # ✅ API principal
├── wsgi.py               # ✅ Configuración WSGI
├── requirements.txt      # ✅ Dependencias Python
├── update_products.py    # ✅ Script de población de BD
├── db.sqlite3           # ✅ Base de datos (opcional, se puede regenerar)
└── models.py            # ✅ Archivo de modelos (vacío por ahora)
```

## 🔧 Pasos en PythonAnywhere

### 1. Crear Web App

1. Ve a tu **Dashboard** en PythonAnywhere
2. Haz clic en **"Web"** en la barra superior
3. Haz clic en **"Add a new web app"**
4. Selecciona tu dominio gratuito: `tuusuario.pythonanywhere.com`
5. Selecciona **"Manual configuration"**
6. Elige **Python 3.10**

### 2. Subir Archivos

1. Ve a la pestaña **"Files"**
2. Crea la carpeta: `/home/tuusuario/tienda-abarrotes/`
3. Dentro crea: `/home/tuusuario/tienda-abarrotes/db-microservice/`
4. Sube todos los archivos de `db-microservice/` a esta carpeta

### 3. Configurar Web App

1. Ve a la pestaña **"Web"**
2. En la sección **"Code"**, configura:
   - **Source code**: `/home/tuusuario/tienda-abarrotes/db-microservice`
   - **Working directory**: `/home/tuusuario/tienda-abarrotes/db-microservice`

### 4. Configurar WSGI

1. En la pestaña **"Web"**, busca **"WSGI configuration file"**
2. Haz clic en el enlace del archivo (algo como `/var/www/tuusuario_pythonanywhere_com_wsgi.py`)
3. **Reemplaza todo el contenido** con esto:

```python
import sys
import os

# Cambiar 'tuusuario' por tu nombre de usuario real de PythonAnywhere
path = '/home/tuusuario/tienda-abarrotes/db-microservice'
if path not in sys.path:
    sys.path.append(path)

from app import app as application

if __name__ == "__main__":
    application.run()
```

**⚠️ IMPORTANTE**: Cambia `tuusuario` por tu nombre de usuario real en PythonAnywhere.

### 5. Instalar Dependencias

1. Ve a la pestaña **"Consoles"**
2. Abre una **"Bash console"**
3. Ejecuta estos comandos:

```bash
cd ~/tienda-abarrotes/db-microservice
pip3.10 install --user -r requirements.txt
```

### 6. Poblar la Base de Datos

En la misma consola Bash, ejecuta:

```bash
python3.10 update_products.py
```

Deberías ver:
```
Base de datos actualizada con 34 productos organizados por proveedores:
- Bimbo: 7 productos
- Gamesa: 7 productos
- Sabritas: 7 productos
- La Costeña: 7 productos
- Barcel: 6 productos

Total: 34 productos en la base de datos
```

### 7. Habilitar Web App

1. Ve a la pestaña **"Web"**
2. Haz clic en el botón verde **"Reload tuusuario.pythonanywhere.com"**
3. Espera a que aparezca "Your web app is now reloaded"

### 8. Probar la API

Abre estas URLs en tu navegador:

- **Todos los productos**: `https://tuusuario.pythonanywhere.com/api/products`
- **Por proveedor**: `https://tuusuario.pythonanywhere.com/api/products?supplier=bimbo`
- **Proveedores**: `https://tuusuario.pythonanywhere.com/api/suppliers`
- **Marcas**: `https://tuusuario.pythonanywhere.com/api/brands`

## 🔧 Actualizar el Frontend

Una vez que tu API esté funcionando en PythonAnywhere, actualiza tu frontend:

### Archivo: `src/services/api.js`

```javascript
// Cambiar de:
const API_URL = 'http://localhost:5000/api';

// A (reemplaza 'tuusuario' por tu usuario real):
const API_URL = 'https://tuusuario.pythonanywhere.com/api';
```

## 🐛 Solución de Problemas

### Error 500 - Internal Server Error
1. Revisa los **Error logs** en la pestaña "Web" de PythonAnywhere
2. Verifica que el archivo WSGI tenga la ruta correcta
3. Asegúrate de que todas las dependencias estén instaladas

### Error 404 - Not Found
1. Verifica que la URL termine en `/api/products`
2. Comprueba que el Web App esté habilitado (botón "Reload")

### No se conecta desde el frontend
1. Verifica la URL en `api.js`
2. Asegúrate de que CORS esté configurado (ya incluido en `app.py`)
3. Comprueba que el frontend use HTTPS si PythonAnywhere usa HTTPS

### Base de datos vacía
1. Ejecuta nuevamente: `python3.10 update_products.py`
2. Verifica que el archivo `db.sqlite3` se haya creado
3. Comprueba los permisos de la carpeta

## ✅ Verificación Final

Si todo está funcionando correctamente, deberías poder:

1. ✅ Ver la lista de productos en formato JSON
2. ✅ Filtrar productos por proveedor o marca
3. ✅ Obtener información de un producto específico
4. ✅ Ver tu frontend conectándose correctamente a la API

## 🎉 ¡Listo!

Tu microservicio de base de datos ya está funcionando en PythonAnywhere. El frontend puede conectarse desde cualquier lugar para obtener los datos de productos.

### URLs importantes:
- **Tu API**: `https://tuusuario.pythonanywhere.com/api/products`
- **Panel de control**: `https://www.pythonanywhere.com/user/tuusuario/`