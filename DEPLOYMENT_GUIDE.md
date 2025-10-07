# 🚀 Guía de Deployment en PythonAnywhere

Esta guía te llevará paso a paso para desplegar tu aplicación Tienda de Abarrotes React en PythonAnywhere desde cero.

## 📋 Prerrequisitos

- Cuenta en [PythonAnywhere](https://www.pythonanywhere.com/) (gratuita está bien)
- Repositorio en GitHub con tu código
- Conocimientos básicos de línea de comandos

## 🔧 Paso 1: Configuración Inicial

### 1.1 Acceder a PythonAnywhere
1. Inicia sesión en tu cuenta de PythonAnywhere
2. Ve al **Dashboard**
3. Abre una **consola Bash**

### 1.2 Verificar Python y pip
```bash
# Verificar versión de Python
python3 --version
which python3

# Debería mostrar Python 3.10+ o superior
```

## 📥 Paso 2: Clonar el Repositorio

```bash
# Ir al directorio home
cd ~

# Clonar el repositorio
git clone https://github.com/exael2000/tienda-abarrotes-react.git

# Entrar al directorio
cd tienda-abarrotes-react

# Verificar contenido
ls -la
```

## 🐍 Paso 3: Configurar el Entorno Python

### 3.1 Instalar Dependencias
```bash
# Instalar dependencias con la versión correcta de Python
python3 -m pip install --user flask-cors flask-jwt-extended bcrypt

# Verificar instalación
python3 -c "import flask_cors, flask_jwt_extended, bcrypt; print('Dependencias instaladas correctamente')"
```

### 3.2 Configurar la Base de Datos
```bash
# Entrar al directorio del microservicio
cd db-microservice

# Inicializar la base de datos
python3 init_db.py

# Crear usuarios de prueba
python3 init_users.py

# Verificar que se creó la base de datos
ls -la *.sqlite3

# Volver al directorio raíz
cd ..
```

## 🌐 Paso 4: Configurar Node.js y Build

### 4.1 Instalar Node.js (si no está disponible)
```bash
# Verificar si Node.js está instalado
node --version
npm --version

# Si no está instalado, usar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node
```

### 4.2 Build de la Aplicación
```bash
# Instalar dependencias de Node.js
npm install

# Crear build de producción
npm run build

# Verificar que se creó el directorio build
ls -la build/
```

## 🌍 Paso 5: Configurar la Aplicación Web

### 5.1 Crear Nueva Aplicación Web
1. Ve al **Web tab** en tu dashboard de PythonAnywhere
2. Haz clic en **"Add a new web app"**
3. Selecciona tu dominio (ej: `exael.pythonanywhere.com`)
4. Selecciona **"Manual configuration"**
5. Selecciona **Python 3.10**

### 5.2 Configurar Rutas
En el Web tab, configura:

**Source code:**
```
/home/TUUSUARIO/tienda-abarrotes-react
```

**Working directory:**
```
/home/TUUSUARIO/tienda-abarrotes-react
```

### 5.3 Configurar el Archivo WSGI
1. En el Web tab, haz clic en el enlace del archivo WSGI
2. Reemplaza TODO el contenido con:

```python
import os
import sys

# Agregar el directorio del proyecto al path
path = '/home/TUUSUARIO/tienda-abarrotes-react'  # Cambiar TUUSUARIO por tu username
if path not in sys.path:
    sys.path.append(path)

# Cambiar al directorio del proyecto
os.chdir(path)

# Importar la aplicación Flask
from app_pythonanywhere import app as application

if __name__ == "__main__":
    application.run()
```

3. **¡IMPORTANTE!** Cambia `TUUSUARIO` por tu nombre de usuario real
4. Guarda el archivo

### 5.4 Configurar Archivos Estáticos
En el Web tab, ve a la sección **"Static files"** y agrega:

**Primera entrada:**
- URL: `/static/`
- Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/static/`

**Segunda entrada:**
- URL: `/images/`
- Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/images/`

**¡IMPORTANTE!** Cambia `TUUSUARIO` por tu nombre de usuario real

## 🚀 Paso 6: Probar y Lanzar

### 6.1 Verificar la Aplicación
```bash
# Probar que el archivo Python se importa correctamente
cd ~/tienda-abarrotes-react
python3 -c "import app_pythonanywhere; print('OK')"

# Probar la API
curl http://localhost:8000/api/health
```

### 6.2 Lanzar la Aplicación
1. En el Web tab, haz clic en **"Reload exael.pythonanywhere.com"**
2. Espera a que aparezca "✓ Your web app is now reloaded"
3. Visita tu sitio: `https://TUUSUARIO.pythonanywhere.com`

## 🔍 Paso 7: Verificación y Testing

### 7.1 Probar Funcionalidades
1. **Página principal**: Debe cargar el catálogo de productos
2. **Login**: Usar `exael` / `exael`
3. **Registro**: Crear un nuevo usuario
4. **Carrito**: Agregar productos y verificar persistencia
5. **Modo invitado**: Probar sin iniciar sesión

### 7.2 Verificar API Endpoints
```bash
# Desde la consola de PythonAnywhere
curl https://TUUSUARIO.pythonanywhere.com/api/health
curl https://TUUSUARIO.pythonanywhere.com/api/products
```

## 🐛 Troubleshooting

### Error: "ModuleNotFoundError"
```bash
# Reinstalar dependencias
python3 -m pip install --user --force-reinstall flask-cors flask-jwt-extended bcrypt
```

### Error: "No such file or directory"
```bash
# Verificar rutas en el archivo WSGI
ls -la /home/TUUSUARIO/tienda-abarrotes-react/
```

### Error: "SyntaxError"
```bash
# Verificar que app_pythonanywhere.py tiene código Python válido
python3 -c "import app_pythonanywhere"
```

### Build no se encuentra
```bash
# Reconstruir la aplicación
cd ~/tienda-abarrotes-react
npm run build
ls -la build/
```

## 📊 Logs y Monitoreo

### Ver Logs de Error
1. Ve al Web tab
2. Busca la sección **"Log files"**
3. Haz clic en **"error log"** para ver errores
4. Haz clic en **"access log"** para ver accesos

### Logs en Consola
```bash
# Ver logs del servidor
tail -f /var/log/TUUSUARIO.pythonanywhere.com.error.log
```

## 🔄 Actualizaciones

### Actualizar Código
```bash
cd ~/tienda-abarrotes-react
git pull
npm run build
# Ir al Web tab y hacer "Reload"
```

### Actualizar Base de Datos
```bash
cd ~/tienda-abarrotes-react/db-microservice
python3 init_db.py
python3 init_users.py
```

## ✅ Checklist Final

- [ ] Repositorio clonado en PythonAnywhere
- [ ] Dependencias Python instaladas
- [ ] Base de datos inicializada
- [ ] Build de React creado
- [ ] Aplicación web configurada en Web tab
- [ ] Archivo WSGI configurado correctamente
- [ ] Archivos estáticos configurados
- [ ] Aplicación reiniciada (Reload)
- [ ] API funcionando (endpoint /api/health)
- [ ] Frontend cargando correctamente
- [ ] Login funcionando con usuario de prueba

## 🎉 ¡Éxito!

Si todos los pasos se completaron correctamente, tu aplicación debería estar funcionando en:
`https://TUUSUARIO.pythonanywhere.com`

**Usuario de prueba:**
- Usuario: `exael`
- Contraseña: `exael`

---

💡 **Tip**: Guarda esta guía como referencia para futuros deployments o actualizaciones.