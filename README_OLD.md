# 🛒 Tienda de Abarrotes React

Una aplicación completa de tienda de abarrotes desarrollada con React, Flask y SQLite, utilizando arquitectura de microservicios.

## 📋 Características

- **34 productos** organizados por proveedores (Bimbo, Gamesa, Sabritas, La Costeña, Barcel)
- **Arquitectura de microservicios** con Flask
- **Frontend React** moderno y responsivo
- **Base de datos SQLite** con información detallada de productos
- **Imágenes de productos** incluidas
- **API REST** completa con filtros
- **Preparado para deploy** en PythonAnywhere

## 🏗️ Arquitectura

```
Frontend (React) → Backend (Flask) → DB Microservice (Flask + SQLite)
```

- **Frontend**: React 19.2.0 con Axios para API calls
- **Backend**: Flask API que actúa como gateway
- **DB Microservice**: Flask + SQLite con todos los productos
- **Imágenes**: Servidas desde `/public/images/products/`

## 🚀 Instalación y Uso Local

### 1. Clonar el repositorio
```bash
git clone <tu-repo-url>
cd tienda-abarrotes-react
```

### 2. Instalar dependencias de React
```bash
npm install
```

### 3. Configurar el entorno Python
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate
```

### 4. Instalar dependencias Python
```bash
pip install -r db-microservice/requirements.txt
pip install -r backend/requirements.txt
```

### 5. Inicializar la base de datos
```bash
cd db-microservice
python update_products.py
```

### 6. Ejecutar los servicios

#### Terminal 1 - DB Microservice (Puerto 5001)
```bash
cd db-microservice
python app.py
```

#### Terminal 2 - Backend API (Puerto 5000)
```bash
cd backend
python app.py
```

#### Terminal 3 - Frontend React (Puerto 3000)
```bash
npm start
```

### 7. Acceder a la aplicación
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/products
- **DB Microservice**: http://localhost:5001/api/products

## 📊 Productos Incluidos

### Proveedores y Marcas:
- **Bimbo** (7 productos): Mantecadas, Pan, Donas, Roles, Panqué
- **Gamesa** (7 productos): Galletas Marías, Emperador, Chokis, etc.
- **Sabritas** (7 productos): Papas, Cheetos, Doritos, Ruffles, etc.
- **La Costeña** (7 productos): Chiles, Frijoles, Salsas, etc.
- **Barcel** (6 productos): Takis, Chips, Hot Nuts, etc.

## 🔧 API Endpoints

### Productos
- `GET /api/products` - Listar todos los productos
- `GET /api/products?supplier=bimbo` - Filtrar por proveedor
- `GET /api/products?brand=Sabritas` - Filtrar por marca
- `GET /api/products/:id` - Obtener producto específico

### Información adicional
- `GET /api/suppliers` - Listar proveedores
- `GET /api/brands` - Listar marcas

## 🌐 Deploy en PythonAnywhere

### 1. Subir archivos
Subir la carpeta `db-microservice/` completa a tu cuenta de PythonAnywhere.

### 2. Configurar Web App
- Framework: Manual configuration
- Python: 3.10
- Source code: `/home/tuusuario/tienda-abarrotes/db-microservice`

### 3. Configurar WSGI
Editar `/var/www/tuusuario_pythonanywhere_com_wsgi.py` con el contenido de `wsgi.py`

### 4. Instalar dependencias
```bash
pip3.10 install --user -r requirements.txt
```

### 5. Inicializar BD
```bash
python3.10 update_products.py
```

### 6. Actualizar frontend
Cambiar `API_URL` en `src/services/api.js`:
```javascript
const API_URL = 'https://tuusuario.pythonanywhere.com/api';
```

## 📁 Estructura del Proyecto

```
tienda-abarrotes-react/
├── public/
│   └── images/products/          # Imágenes de productos
├── src/
│   ├── components/               # Componentes React
│   └── services/                 # API services
├── backend/                      # Backend Flask
├── db-microservice/             # Microservicio de BD
│   ├── app.py                   # API principal
│   ├── wsgi.py                  # Para PythonAnywhere
│   ├── update_products.py       # Script de población
│   └── requirements.txt         # Dependencias Python
├── DEPLOY_GUIDE.md              # Guía de despliegue
└── deploy_instructions.sh       # Script de instalación
```

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React, Axios, CSS3
- **Backend**: Flask, Flask-CORS
- **Base de Datos**: SQLite
- **Deploy**: PythonAnywhere
- **Control de Versiones**: Git

## 👨‍💻 Desarrollo

Para continuar el desarrollo:

1. **Carrito funcional**: Implementar agregar/quitar productos
2. **Checkout**: Integración con Stripe
3. **Autenticación**: Sistema de usuarios
4. **Admin Panel**: Gestión de productos
5. **Búsqueda**: Filtros avanzados

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
