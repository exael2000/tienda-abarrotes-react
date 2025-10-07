# 🛒 Tienda de Abarrotes React

Una aplicación web completa de e-commerce para tienda de abarrotes, desarrollada con React y Flask. Incluye autenticación de usuarios, carrito de compras persistente, modo invitado y diseño responsive.

## 🌟 Características Principales

- **🛍️ Catálogo de Productos**: Navegación intuitiva con imágenes y detalles
- **👤 Sistema de Usuarios**: Registro, login y perfil de usuario
- **🛒 Carrito de Compras**: Persistente entre sesiones con sincronización
- **👥 Modo Invitado**: Funcionalidad completa sin necesidad de registro
- **📱 Diseño Responsive**: Optimizado para móviles y escritorio
- **🔒 Autenticación JWT**: Sistema seguro de tokens
- **💾 Base de Datos**: SQLite con migraciones automáticas
- **🚀 Deployment**: Configurado para PythonAnywhere

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19.2.0** - Framework principal
- **React Router DOM** - Navegación SPA
- **Axios** - Cliente HTTP
- **CSS3** - Estilos responsive

### Backend
- **Flask 3.0.3** - Framework web
- **Flask-CORS 6.0.1** - Manejo de CORS
- **Flask-JWT-Extended 4.7.1** - Autenticación JWT
- **bcrypt 4.2.1** - Hash de contraseñas
- **SQLite** - Base de datos

## 📁 Estructura del Proyecto

```
tienda-abarrotes-react/
├── src/                          # Código fuente React
│   ├── components/               # Componentes React
│   │   ├── Login.jsx            # Formulario de login
│   │   ├── Register.jsx         # Formulario de registro
│   │   ├── ProductList.jsx      # Lista de productos
│   │   ├── Cart.jsx             # Carrito de compras
│   │   └── Navbar.jsx           # Barra de navegación
│   ├── context/                 # Context API
│   │   ├── AuthContext.js       # Estado de autenticación
│   │   └── CartContext.js       # Estado del carrito
│   ├── services/                # Servicios HTTP
│   │   └── api.js               # Configuración de Axios
│   └── utils/                   # Utilidades
│       └── currency.js          # Formateo de moneda
├── db-microservice/             # Backend Flask
│   ├── app.py                   # Aplicación principal
│   ├── models.py                # Modelos de datos
│   ├── init_db.py               # Inicialización BD
│   └── requirements.txt         # Dependencias Python
├── build/                       # Build de producción
├── public/                      # Archivos públicos
│   └── images/                  # Imágenes de productos
├── app_pythonanywhere.py        # Aplicación para deployment
├── package.json                 # Dependencias Node.js
└── requirements.txt             # Dependencias Python raíz
```

## ⚡ Instalación y Configuración

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.10+
- Git

### 1. Clonar el Repositorio
```bash
git clone https://github.com/exael2000/tienda-abarrotes-react.git
cd tienda-abarrotes-react
```

### 2. Configurar el Backend
```bash
# Instalar dependencias Python
pip install -r requirements.txt

# Configurar base de datos
cd db-microservice
python init_db.py
python init_users.py

# Iniciar servidor backend
python app.py
```
El backend estará disponible en `http://localhost:5001`

### 3. Configurar el Frontend
```bash
# Instalar dependencias Node.js
npm install

# Iniciar servidor de desarrollo
npm start
```
El frontend estará disponible en `http://localhost:3000`

### 4. Build de Producción
```bash
npm run build
```

## 🚀 Deployment en PythonAnywhere

### Preparación
1. Crea una cuenta en [PythonAnywhere](https://www.pythonanywhere.com/)
2. Abre una consola Bash

### Pasos de Deployment
```bash
# 1. Clonar el repositorio
git clone https://github.com/exael2000/tienda-abarrotes-react.git
cd tienda-abarrotes-react

# 2. Instalar dependencias Python
pip3.10 install --user -r requirements.txt

# 3. Configurar base de datos
cd db-microservice
python3 init_db.py
python3 init_users.py
cd ..

# 4. Build del frontend
npm install
npm run build

# 5. Configurar aplicación web
# Ir al Web tab de PythonAnywhere
# Source code: /home/TUUSUARIO/tienda-abarrotes-react
# Working directory: /home/TUUSUARIO/tienda-abarrotes-react
```

### Configuración WSGI
Edita el archivo WSGI de tu aplicación web:
```python
import os
import sys

path = '/home/TUUSUARIO/tienda-abarrotes-react'
if path not in sys.path:
    sys.path.append(path)

os.chdir(path)

from app_pythonanywhere import app as application

if __name__ == "__main__":
    application.run()
```

### Archivos Estáticos
En el Web tab, configura:
- URL: `/static/` → Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/static/`
- URL: `/images/` → Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/images/`

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil (requiere JWT)

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products/<id>` - Obtener producto específico
- `GET /api/suppliers` - Listar proveedores
- `GET /api/brands` - Listar marcas

### Carrito (requiere JWT)
- `GET /api/cart` - Obtener carrito del usuario
- `POST /api/cart/add` - Agregar producto al carrito
- `PUT /api/cart/update` - Actualizar cantidad
- `DELETE /api/cart/remove` - Eliminar producto
- `POST /api/cart/sync` - Sincronizar carrito local

### Utilidades
- `GET /api/health` - Verificar estado del API

## 👤 Usuarios de Prueba

```
Usuario: exael
Contraseña: exael
```

## 🔧 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:
```env
# Configuración Flask
FLASK_ENV=development
SECRET_KEY=tu-clave-secreta-super-segura

# Base de datos
DATABASE_URL=sqlite:///db-microservice/db.sqlite3

# JWT
JWT_SECRET_KEY=tu-clave-jwt-super-segura
JWT_ACCESS_TOKEN_EXPIRES=24
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📜 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📧 Contacto

**Desarrollador**: Exael  
**GitHub**: [@exael2000](https://github.com/exael2000)  
**Demo**: [https://exael.pythonanywhere.com](https://exael.pythonanywhere.com)

## 🙏 Agradecimientos

- React team por el excelente framework
- Flask community por la simplicidad y flexibilidad
- PythonAnywhere por el hosting gratuito

---

⭐ ¡Si te gusta este proyecto, dale una estrella en GitHub!