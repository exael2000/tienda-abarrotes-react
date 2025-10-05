# Configuración para PythonAnywhere

## Archivos necesarios para el deploy:

### 1. wsgi.py para el microservicio de BD
```python
import sys
import os

# Agregar la ruta del proyecto
path = '/home/tuusuario/tienda-abarrotes/db-microservice'
if path not in sys.path:
    sys.path.append(path)

# Importar la aplicación Flask
from app import app as application

if __name__ == "__main__":
    application.run()
```

### 2. requirements.txt (ya tienes este archivo)
Flask==2.3.3
Flask-CORS==4.0.0
requests==2.31.0

### 3. Estructura en PythonAnywhere:
```
/home/tuusuario/tienda-abarrotes/
├── db-microservice/
│   ├── app.py
│   ├── db.sqlite3
│   ├── requirements.txt
│   ├── wsgi.py
│   └── update_products.py
└── static/
    └── images/
        └── products/
            ├── mantecadas_vainilla_625g.jpg
            ├── pan_blanco_680g.jpg
            ├── donas_azucaradas_6p.jpg
            └── ... (todas tus imágenes)
```

### 4. Configuración Web App en PythonAnywhere:
- Framework: Manual configuration
- Python version: 3.10
- Source code: /home/tuusuario/tienda-abarrotes/db-microservice
- Working directory: /home/tuusuario/tienda-abarrotes/db-microservice
- WSGI configuration file: /var/www/tuusuario_pythonanywhere_com_wsgi.py

### 5. Modificaciones necesarias en app.py para producción:
```python
# Cambiar la configuración para producción
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

### 6. Variables de entorno (en PythonAnywhere):
- FLASK_ENV=production
- DATABASE_URL=/home/tuusuario/tienda-abarrotes/db-microservice/db.sqlite3

### 7. URL de tu API en PythonAnywhere:
https://tuusuario.pythonanywhere.com/api/products