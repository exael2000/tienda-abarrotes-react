# 🚀 Comandos para Instalar en PythonAnywhere

## 📁 1. Clonar el Repositorio

```bash
cd ~
git clone https://github.com/exael2000/tienda-abarrotes-react.git
cd tienda-abarrotes-react
```

## 📦 2. Instalar Dependencias del Backend

```bash
cd db-microservice
pip3.10 install --user -r requirements.txt
```

**Dependencias que se instalarán:**
- Flask==2.3.3
- Flask-CORS==4.0.0  
- Flask-JWT-Extended==4.5.3
- bcrypt==4.0.1
- requests==2.31.0

## 🗄️ 3. Inicializar Base de Datos

```bash
# Crear tablas de usuarios y carritos
python3.10 init_users.py

# Poblar con productos
python3.10 update_products.py
```

## 🧪 4. Probar el Backend

```bash
# Probar que funciona localmente
python3.10 app.py
```

Deberías ver:
```
* Serving Flask app 'app'
* Debug mode: on
* Running on all addresses (0.0.0.0)
* Running on http://127.0.0.1:5001
```

## ⚙️ 5. Configurar WSGI File

Edita el archivo WSGI de tu web app en PythonAnywhere con este contenido:

```python
import sys
import os

# Cambiar 'exael2000' por tu nombre de usuario real de PythonAnywhere
path = '/home/exael2000/tienda-abarrotes-react/db-microservice'
if path not in sys.path:
    sys.path.append(path)

from app import app as application

if __name__ == "__main__":
    application.run()
```

## 🌐 6. Configurar Web App

En el panel de PythonAnywhere:

1. **Source code**: `/home/TUUSUARIO/tienda-abarrotes-react/db-microservice`
2. **Working directory**: `/home/TUUSUARIO/tienda-abarrotes-react/db-microservice`
3. **Python version**: Python 3.10

## 🔄 7. Frontend (Build)

El frontend ya está compilado en la carpeta `build/`. Para servirlo desde PythonAnywhere:

1. Ve a la pestaña **"Static files"**
2. Agrega mapping:
   - **URL**: `/`
   - **Directory**: `/home/TUUSUARIO/tienda-abarrotes-react/build`

## ✅ Verificación Final

Una vez configurado todo:

1. Ve a `https://TUUSUARIO.pythonanywhere.com`
2. Deberías ver la tienda funcionando
3. Prueba registro/login
4. Prueba agregar productos al carrito

## 🐛 Debug

Si hay problemas, revisa los logs:
- **Error logs**: En la pestaña Web de PythonAnywhere
- **Access logs**: También en la pestaña Web

---

**🚨 RECUERDA:** Cambiar `TUUSUARIO` por tu nombre de usuario real en todos los paths.