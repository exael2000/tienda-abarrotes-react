import requests
import json

# Primero verificar que el servidor esté corriendo
try:
    # Probar el endpoint de productos
    response = requests.get('http://localhost:5001/api/productos')
    print(f"Productos endpoint - Status: {response.status_code}")
    
    # Ahora probar el login
    url = 'http://localhost:5001/api/auth/login'
    data = {
        'username': 'exael',
        'password': 'exael'
    }
    
    print(f"\nProbando login con: {data}")
    response = requests.post(url, json=data)
    print(f"Login - Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        print(f"Login exitoso: {result}")
    else:
        try:
            error = response.json()
            print(f"Error: {error}")
        except:
            print(f"Error sin JSON: {response.text}")
            
except requests.exceptions.ConnectionError:
    print("Error: No se puede conectar al servidor en localhost:5001")
except Exception as e:
    print(f"Error inesperado: {e}")