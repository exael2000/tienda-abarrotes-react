import requests
import json

# Probar con diferentes puertos
puertos = [5000, 5001, 3000]

for puerto in puertos:
    try:
        url = f'http://localhost:{puerto}/api/productos'
        response = requests.get(url, timeout=2)
        print(f"Puerto {puerto}: Status {response.status_code}")
        if response.status_code == 200:
            print(f"✅ Servidor encontrado en puerto {puerto}")
            
            # Probar login en este puerto
            login_url = f'http://localhost:{puerto}/api/auth/login'
            data = {
                'username': 'exael',
                'password': 'exael'
            }
            
            print(f"Probando login en puerto {puerto}...")
            login_response = requests.post(login_url, json=data, timeout=5)
            print(f"Login Status: {login_response.status_code}")
            
            if login_response.status_code == 200:
                result = login_response.json()
                print(f"✅ Login exitoso: {result.get('message', 'Success')}")
                print(f"Usuario: {result.get('user', {}).get('username', 'N/A')}")
            else:
                try:
                    error = login_response.json()
                    print(f"❌ Error en login: {error}")
                except:
                    print(f"❌ Error sin JSON: {login_response.text[:100]}")
            break
            
    except requests.exceptions.ConnectionError:
        print(f"Puerto {puerto}: No disponible")
    except Exception as e:
        print(f"Puerto {puerto}: Error - {e}")

print("\nFin de pruebas")