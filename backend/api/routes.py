from flask import Blueprint, jsonify, request
import requests

api = Blueprint('api', __name__)

DB_SERVICE_URL = "http://localhost:5001"

# ===== ENDPOINTS DE STRIPE =====
@api.route('/api/stripe/config', methods=['GET'])
def get_stripe_config():
    """Proxy para obtener configuración de Stripe"""
    try:
        response = requests.get(f'{DB_SERVICE_URL}/api/stripe/config')
        return response.json(), response.status_code
    except Exception as e:
        print(f"Error en proxy stripe config: {e}")
        return {'error': 'Error al obtener configuración de Stripe'}, 500

@api.route('/api/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Proxy para crear sesión de Stripe Checkout"""
    try:
        data = request.get_json()
        response = requests.post(f'{DB_SERVICE_URL}/api/stripe/create-checkout-session',
                               json=data,
                               headers={'Content-Type': 'application/json'})
        return response.json(), response.status_code
    except Exception as e:
        print(f"Error en proxy create checkout session: {e}")
        return {'error': 'Error al crear sesión de Checkout'}, 500

@api.route('/api/stripe/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Proxy para crear Payment Intent en Stripe"""
    try:
        data = request.get_json()
        response = requests.post(f'{DB_SERVICE_URL}/api/stripe/create-payment-intent',
                               json=data,
                               headers={'Content-Type': 'application/json'})
        return response.json(), response.status_code
    except Exception as e:
        print(f"Error en proxy create payment intent: {e}")
        return {'error': 'Error al crear Payment Intent'}, 500

@api.route('/api/stripe/confirm-payment', methods=['POST'])
def confirm_payment():
    """Proxy para confirmar pago en Stripe"""
    try:
        data = request.get_json()
        response = requests.post(f'{DB_SERVICE_URL}/api/stripe/confirm-payment',
                               json=data,
                               headers={'Content-Type': 'application/json'})
        return response.json(), response.status_code
    except Exception as e:
        print(f"Error en proxy confirm payment: {e}")
        return {'error': 'Error al confirmar pago'}, 500

@api.route('/api/products')
def products():
    resp = requests.get(f"{DB_SERVICE_URL}/api/products")
    return jsonify(resp.json())

@api.route('/api/cart/add', methods=['POST'])
def add_to_cart():
    """Agregar producto al carrito"""
    data = request.get_json()
    
    try:
        # Pasar headers de autorización si existen
        headers = {'Content-Type': 'application/json'}
        if 'Authorization' in request.headers:
            headers['Authorization'] = request.headers['Authorization']
        
        resp = requests.post(f"{DB_SERVICE_URL}/api/cart/add", 
                           json=data,
                           headers=headers)
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de carrito'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/cart', methods=['GET'])
def get_cart():
    """Obtener carrito del usuario"""
    
    try:
        # Pasar headers de autorización si existen
        headers = {}
        if 'Authorization' in request.headers:
            headers['Authorization'] = request.headers['Authorization']
        
        resp = requests.get(f"{DB_SERVICE_URL}/api/cart", headers=headers)
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de carrito'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/cart/clear', methods=['DELETE'])
def clear_cart():
    """Limpiar todo el carrito del usuario"""
    
    try:
        # Pasar headers de autorización si existen
        headers = {}
        if 'Authorization' in request.headers:
            headers['Authorization'] = request.headers['Authorization']
        
        resp = requests.delete(f"{DB_SERVICE_URL}/api/cart/clear", headers=headers)
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de carrito'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/orders', methods=['POST'])
def create_order():
    """Crear nueva orden"""
    data = request.get_json()
    
    try:
        resp = requests.post(f"{DB_SERVICE_URL}/api/orders", 
                           json=data,
                           headers={'Content-Type': 'application/json'})
        
        if resp.status_code == 201:
            return jsonify(resp.json()), 201
        else:
            return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de base de datos'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/auth/login', methods=['POST'])
def login():
    """Login de usuario"""
    data = request.get_json()
    
    try:
        resp = requests.post(f"{DB_SERVICE_URL}/api/auth/login", 
                           json=data,
                           headers={'Content-Type': 'application/json'})
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de autenticación'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/auth/register', methods=['POST'])
def register():
    """Registro de usuario"""
    data = request.get_json()
    
    try:
        resp = requests.post(f"{DB_SERVICE_URL}/api/auth/register", 
                           json=data,
                           headers={'Content-Type': 'application/json'})
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de autenticación'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500

@api.route('/api/auth/profile', methods=['GET'])
def profile():
    """Obtener perfil de usuario"""
    
    try:
        # Pasar headers de autorización si existen
        headers = {}
        if 'Authorization' in request.headers:
            headers['Authorization'] = request.headers['Authorization']
        
        resp = requests.get(f"{DB_SERVICE_URL}/api/auth/profile", headers=headers)
        
        return jsonify(resp.json()), resp.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({'error': 'Error de conexión con el servicio de autenticación'}), 500
    except Exception as e:
        return jsonify({'error': 'Error interno del servidor'}), 500