import sys
import os

# Agregar la ruta del proyecto (cambiar 'tuusuario' por tu nombre de usuario)
path = '/home/tuusuario/tienda-abarrotes/db-microservice'
if path not in sys.path:
    sys.path.append(path)

# Importar la aplicación Flask
from app import app as application

if __name__ == "__main__":
    application.run()