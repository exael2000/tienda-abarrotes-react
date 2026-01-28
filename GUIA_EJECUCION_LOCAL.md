# 🚀 Guía de Ejecución Local - Tienda de Abarrotes React

## 📋 Opción Recomendada: FORMA SIMPLE (Todo en un solo comando)

### Paso 1: Preparación Inicial (una sola vez)
```bash
# 1. Instalar dependencias de Node.js
npm install

# 2. Instalar dependencias de Python
pip install -r requirements.txt

# 3. Compilar la aplicación React para producción
npm run build
```

### Paso 2: Ejecutar la Tienda (Comando Principal)
```bash
python app_pythonanywhere.py
```

✅ **¡Listo!** Accede a: **http://localhost:5000**

---

## 📊 Cómo Funciona Esta Configuración

```
┌─────────────────────────────────────────────────┐
│           http://localhost:5000                 │
│        (Un solo servidor Flask)                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ✓ Frontend React (build compilado)            │
│  ✓ Backend API (rutas /api/*)                  │
│  ✓ Archivos estáticos (/static/*, /images/*)  │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Un solo servidor Flask corriendo
- ✅ Todo en un puerto (5000)
- ✅ Funciona igual que en PythonAnywhere
- ✅ No necesitas cambiar URLs
- ✅ Fácil de debuggear

---

## 🔄 Opción Alternativa: Desarrollo con React en Vivo (Si necesitas cambiar el Frontend)

Si necesitas hacer cambios en React **en tiempo real**:

### Terminal 1: Backend
```bash
python app_pythonanywhere.py
```
(Corre en `http://localhost:5000`)

### Terminal 2: Frontend en Desarrollo
```bash
npm start
```
(Corre en `http://localhost:3000`)

⚠️ **Nota:** En esta configuración, React hará requests a `localhost:5000` (ver `proxy` en package.json)

---

## 📝 Archivo de Configuración: app_pythonanywhere.py

Este es el archivo principal que levanta todo. Contiene:

```python
from flask import Flask, ...

app = Flask(__name__, static_folder='build', static_url_path='')

# Rutas API (/api/*)
@app.route('/api/products')
@app.route('/api/auth/login')
# ... más rutas

# Archivos estáticos
@app.route('/static/<path:filename>')
@app.route('/images/<path:filename>')

# Aplicación React (catch-all)
@app.route('/')
@app.route('/<path:path>')
def serve_frontend(path):
    # Sirve build/index.html para React SPA routing
```

**¿Por qué funciona en local pero no en producción?**
- En local: Flask sirve todo (frontend + backend)
- En PythonAnywhere: El servidor web sirve estáticos, Flask sirve APIs

---

## 🗂️ Estructura de Carpetas Importante

```
tienda-abarrotes-react/
├── app_pythonanywhere.py      ← ARCHIVO PRINCIPAL (ejecutar esto)
├── build/                      ← Frontend compilado (generado por npm run build)
│   ├── index.html
│   ├── static/
│   │   ├── js/main.*.js
│   │   └── css/main.*.css
│   └── images/products/
├── src/                        ← Código fuente React (editar esto si cambias frontend)
│   ├── components/
│   ├── context/
│   └── services/
├── db.sqlite3                  ← Base de datos SQLite
├── db-microservice/            ← Código backend alternativo
└── package.json
```

---

## ⚙️ Variables de Entorno Necesarias

Crear archivo `.env` en la raíz:

```bash
STRIPE_SECRET_KEY=sk_test_tu_clave_aqui
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_aqui
FLASK_ENV=development
SECRET_KEY=tu_clave_super_secreta_para_jwt
```

Opcional (si no existe, usará valores por defecto):
- Sin `.env` funciona igual, solo sin funcionalidad de Stripe

---

## 🐛 Troubleshooting

### Problema: "Port 5000 already in use"
```bash
# Liberar puerto
taskkill /F /IM python.exe  # Windows
# o
lsof -ti:5000 | xargs kill -9  # Mac/Linux
```

### Problema: "404 Not Found" al abrir localhost:5000
```bash
# Verificar que el build existe
ls build/index.html

# Si no existe, compilar:
npm run build
```

### Problema: "Database locked"
```bash
# Reiniciar el servidor Flask
# A veces hay conflictos con SQLite
```

### Problema: Cambios en React no se reflejan
```bash
# Recompilar el build
npm run build

# Luego reiniciar Flask
```

---

## 📊 Comandos Rápidos (Copia y Pega)

### Instalar todo por primera vez:
```bash
npm install && pip install -r requirements.txt && npm run build
```

### Ejecutar la tienda:
```bash
python app_pythonanywhere.py
```

### Acceder a:
```
http://localhost:5000
```

### Usuario de prueba:
- Usuario: `exael`
- Contraseña: `exael`

---

## 🎯 Resumen: Lo que Necesitas Saber

| Acción | Comando |
|--------|---------|
| **Instalar dependencias (1ª vez)** | `npm install && pip install -r requirements.txt` |
| **Compilar React** | `npm run build` |
| **Ejecutar la tienda** | `python app_pythonanywhere.py` |
| **Acceder a la tienda** | `http://localhost:5000` |
| **Hacer cambios en React** | Editar `src/` → `npm run build` → Reiniciar Flask |
| **Ver logs del backend** | Consola de Flask (verás todos los requests) |

---

## ✅ Checklist Antes de Usar

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] Python 3.10+ instalado (`python --version`)
- [ ] npm install completado
- [ ] pip install -r requirements.txt completado
- [ ] npm run build completado
- [ ] `http://localhost:5000` abierto en navegador
- [ ] Ver "Tienda de Abarrotes" cargada

¡Listo para trabajar! 🎉
