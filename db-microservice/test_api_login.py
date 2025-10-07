import requests
import json

# URL del servidor
url = 'http://localhost:5000/api/auth/login'

# Datos de login
data = {
    'username': 'exael',
    'password': 'exael'
}

# Hacer la petición
try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except requests.exceptions.ConnectionError:
    print("Error: No se puede conectar al servidor. ¿Está ejecutándose en localhost:5000?")
except Exception as e:
    print(f"Error: {e}")