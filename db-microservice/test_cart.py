import requests
import json

# Primero hacer login para obtener token
login_data = {'username': 'exael', 'password': 'exael'}
login_response = requests.post('http://localhost:5001/api/auth/login', json=login_data)
print('Login response:', login_response.status_code)

if login_response.status_code == 200:
    token = login_response.json()['access_token']
    print('Token obtenido')
    
    # Probar endpoint de carrito
    headers = {'Authorization': f'Bearer {token}'}
    cart_response = requests.get('http://localhost:5001/api/cart', headers=headers)
    print('Cart response:', cart_response.status_code)
    print('Cart data:', cart_response.json())
else:
    print('Login failed:', login_response.text)