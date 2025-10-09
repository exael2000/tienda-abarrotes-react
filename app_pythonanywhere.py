from flask import Flask, jsonify, request, send_from_directory, send_file, render_template_string
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import sqlite3
import bcrypt
from datetime import datetime, timedelta
import os
import stripe
import json
from decimal import Decimal
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app, origins=["*"], allow_headers=["*"], methods=["*"])

# Headers de seguridad HTTP
@app.after_request
def after_request(response):
    """Añadir headers de seguridad a todas las respuestas"""
    # Solo aplicar Content-Type JSON a rutas API, no a archivos estáticos
    if request.path.startswith('/api/'):
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
    
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response

# Configuración JWT
app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-super-segura'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

# Configuración Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')

# Validar que las claves de Stripe estén configuradas
if not stripe.api_key:
    raise ValueError("STRIPE_SECRET_KEY environment variable is required")
if not STRIPE_PUBLISHABLE_KEY:
    raise ValueError("STRIPE_PUBLISHABLE_KEY environment variable is required")

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        conn.close()
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    conn.close()
    
    access_token = create_access_token(identity=str(user['id']))
    
    return jsonify({
        'message': 'Login exitoso',
        'access_token': access_token,
        'user': {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name']
        }
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    first_name = data['first_name'].strip()
    last_name = data['last_name'].strip()
    
    if len(username) < 3:
        return jsonify({'error': 'El usuario debe tener al menos 3 caracteres'}), 400
    
    if len(password) < 4:
        return jsonify({'error': 'La contraseña debe tener al menos 4 caracteres'}), 400
    
    if '@' not in email:
        return jsonify({'error': 'Email inválido'}), 400
    
    conn = get_db_connection()
    
    existing_user = conn.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email)).fetchone()
    
    if existing_user:
        conn.close()
        return jsonify({'error': 'El usuario o email ya existe'}), 400
    
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        cursor = conn.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, email, password_hash, first_name, last_name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'message': 'Usuario registrado exitosamente',
            'access_token': access_token,
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'first_name': first_name,
                'last_name': last_name
            }
        }), 201
        
    except Exception as e:
        conn.close()
        return jsonify({'error': 'Error al registrar usuario'}), 500

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario autenticado"""
    user_id = int(get_jwt_identity())
    
    conn = get_db_connection()
    user = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,)).fetchone()
    conn.close()
    
    if not user:
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    return jsonify(dict(user))

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Cerrar sesión (invalidar token)"""
    # En una implementación completa, aquí invalidarías el token
    # Por simplicidad, solo retornamos un mensaje
    return jsonify({'message': 'Sesión cerrada exitosamente'})

@app.route('/api/products')
def get_products():
    conn = get_db_connection()
    
    # Obtener parámetros de filtrado opcionales
    supplier = request.args.get('supplier')
    brand = request.args.get('brand')
    min_price = request.args.get('min_price')
    max_price = request.args.get('max_price')
    
    query = 'SELECT * FROM productos WHERE 1=1'
    params = []
    
    if supplier:
        query += ' AND supplier = ?'
        params.append(supplier)
    
    if brand:
        query += ' AND brand = ?'
        params.append(brand)
    
    if min_price:
        query += ' AND price_cents >= ?'
        params.append(int(min_price))
    
    if max_price:
        query += ' AND price_cents <= ?'
        params.append(int(max_price))
    
    query += ' ORDER BY name'
    
    products = conn.execute(query, params).fetchall()
    conn.close()
    return jsonify([dict(row) for row in products])

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    conn = get_db_connection()
    product = conn.execute('SELECT * FROM productos WHERE id = ?', (product_id,)).fetchone()
    conn.close()
    
    if product is None:
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    return jsonify(dict(product))

@app.route('/api/suppliers')
def get_suppliers():
    conn = get_db_connection()
    suppliers = conn.execute('SELECT DISTINCT supplier FROM productos ORDER BY supplier').fetchall()
    conn.close()
    return jsonify([row['supplier'] for row in suppliers])

@app.route('/api/brands')
def get_brands():
    conn = get_db_connection()
    brands = conn.execute('SELECT DISTINCT brand FROM productos ORDER BY brand').fetchall()
    conn.close()
    return jsonify([row['brand'] for row in brands])

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    
    conn = get_db_connection()
    cart_items = conn.execute('''
        SELECT c.product_id, c.quantity, c.updated_at,
               p.name, p.description, p.price_cents, p.image, 
               p.brand, p.weight, p.stock
        FROM cart_items c
        JOIN productos p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.updated_at DESC
    ''', (user_id,)).fetchall()
    conn.close()
    
    cart_data = []
    for item in cart_items:
        cart_data.append({
            'id': item['product_id'],
            'name': item['name'],
            'description': item['description'],
            'price_cents': item['price_cents'],
            'image': item['image'],
            'brand': item['brand'],
            'weight': item['weight'],
            'stock': item['stock'],
            'quantity': item['quantity']
        })
    
    return jsonify(cart_data)

@app.route('/api/cart/add', methods=['POST'])
@jwt_required()
def add_to_cart():
    """Agregar item al carrito"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({'error': 'product_id es requerido'}), 400
    
    conn = get_db_connection()
    
    # Verificar que el producto existe
    product = conn.execute('SELECT id, stock FROM productos WHERE id = ?', (product_id,)).fetchone()
    if not product:
        conn.close()
        return jsonify({'error': 'Producto no encontrado'}), 404
    
    # Verificar stock disponible
    existing_item = conn.execute('SELECT quantity FROM cart_items WHERE user_id = ? AND product_id = ?', 
                                (user_id, product_id)).fetchone()
    current_quantity = existing_item['quantity'] if existing_item else 0
    new_total_quantity = current_quantity + quantity
    
    if new_total_quantity > product['stock']:
        conn.close()
        return jsonify({'error': 'Stock insuficiente'}), 400
    
    # Insertar o actualizar item en carrito
    if existing_item:
        # Si ya existe, solo actualizar cantidad
        conn.execute('''
            UPDATE cart_items 
            SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ? AND product_id = ?
        ''', (quantity, user_id, product_id))
    else:
        # Si es nuevo, obtener el próximo order_position
        max_order = conn.execute('''
            SELECT COALESCE(MAX(order_position), 0) + 1 as next_order
            FROM cart_items WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        next_order = max_order['next_order'] if max_order else 1
        
        conn.execute('''
            INSERT INTO cart_items (user_id, product_id, quantity, order_position, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, product_id, quantity, next_order))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Producto agregado al carrito'}), 200

@app.route('/api/cart/sync', methods=['POST'])
@jwt_required()
def sync_cart():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    local_cart = data.get('cart_items', [])
    
    conn = get_db_connection()
    
    db_cart = conn.execute('''
        SELECT product_id, quantity 
        FROM cart_items 
        WHERE user_id = ?
    ''', (user_id,)).fetchall()
    
    db_cart_dict = {item['product_id']: item['quantity'] for item in db_cart}
    
    for item in local_cart:
        product_id = item.get('id')
        quantity = item.get('quantity', 0)
        
        if product_id and quantity > 0:
            product = conn.execute('SELECT stock FROM productos WHERE id = ?', (product_id,)).fetchone()
            if product and quantity <= product['stock']:
                if product_id in db_cart_dict:
                    new_quantity = min(db_cart_dict[product_id] + quantity, product['stock'])
                    conn.execute('''
                        UPDATE cart_items 
                        SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE user_id = ? AND product_id = ?
                    ''', (new_quantity, user_id, product_id))
                else:
                    conn.execute('''
                        INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ''', (user_id, product_id, quantity))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Carrito sincronizado exitosamente'}), 200

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'OK', 'message': 'API funcionando correctamente'})

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('build/static', filename)

@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('build/images', filename)

# Funciones de utilidad para órdenes
def generate_order_number():
    """Generar número único de orden"""
    import time
    timestamp = int(time.time())
    return f"ORD-{timestamp}"

def calculate_cart_total(cart_items):
    """Calcular total del carrito"""
    total = 0
    for item in cart_items:
        total += item['price'] * item['quantity']
    return round(total, 2)

# ENDPOINTS DE ÓRDENES Y PAGOS

@app.route('/api/cart/clear', methods=['DELETE'])
@jwt_required()
def clear_cart():
    """Limpiar todo el carrito del usuario"""
    user_id = int(get_jwt_identity())
    
    print(f"🗑️ Backend: Clearing all cart items for user {user_id}")
    
    conn = get_db_connection()
    
    # Eliminar todos los items del carrito del usuario
    cursor = conn.execute('DELETE FROM cart_items WHERE user_id = ?', (user_id,))
    deleted_count = cursor.rowcount
    conn.commit()
    conn.close()
    
    print(f"🗑️ Backend: Cleared {deleted_count} items from cart for user {user_id}")
    
    return jsonify({'message': f'Carrito limpiado - {deleted_count} productos eliminados'}), 200

@app.route('/api/stripe/config', methods=['GET'])
def get_stripe_config():
    """Obtener clave pública de Stripe"""
    return jsonify({
        'publicKey': STRIPE_PUBLISHABLE_KEY
    })

@app.route('/api/stripe/create-checkout-session', methods=['POST'])
def create_checkout_session():
    """Crear sesión de Stripe Checkout"""
    data = request.get_json()
    
    try:
        # Extraer datos del pedido
        items = data.get('items', [])
        customer_info = {
            'name': data.get('customer_name', ''),
            'email': data.get('customer_email', ''),
            'phone': data.get('customer_phone', ''),
            'address': data.get('delivery_address', ''),
            'notes': data.get('order_notes', '')
        }
        
        # Preparar line_items para Stripe
        line_items = []
        items_metadata = []
        
        for item in items:
            line_items.append({
                'price_data': {
                    'currency': 'mxn',
                    'product_data': {
                        'name': item.get('name', ''),
                        'images': [item.get('image_url', '')] if item.get('image_url') else [],
                        'metadata': {
                            'product_id': str(item.get('product_id', item.get('id', 0)))
                        }
                    },
                    'unit_amount': int((item.get('unit_price', 0)) * 100),  # Convertir a centavos
                },
                'quantity': item.get('quantity', 1),
            })
            
            # Guardar metadata de productos para después
            items_metadata.append({
                'product_id': item.get('product_id', item.get('id', 0)),
                'name': item.get('name', ''),
                'quantity': item.get('quantity', 1),
                'unit_price': item.get('unit_price', 0)
            })
        
        # Crear sesión de Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='https://exael.pythonanywhere.com/checkout/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='https://exael.pythonanywhere.com/checkout/cancel',
            metadata={
                'customer_name': customer_info['name'],
                'customer_email': customer_info['email'],
                'customer_phone': customer_info['phone'],
                'delivery_address': customer_info['address'],
                'order_notes': customer_info['notes'],
                'items_data': json.dumps(items_metadata)  # Guardar información de productos
            }
        )
        
        return jsonify({
            'id': checkout_session.id,
            'url': checkout_session.url
        }), 200
        
    except stripe.error.StripeError as e:
        print(f"Error de Stripe: {e}")
        return jsonify({'error': f'Error de Stripe: {str(e)}'}), 400
    except Exception as e:
        print(f"Error al crear sesión de Checkout: {e}")
        return jsonify({'error': 'Error al crear sesión de Checkout'}), 500

@app.route('/api/verify-payment', methods=['POST'])
def verify_stripe_payment():
    """Verificar pago de Stripe y crear orden"""
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'session_id requerido'}), 400
        
        print(f"🔍 Verificando sesión de Stripe: {session_id}")
        
        # Obtener sesión de Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        
        if session.payment_status != 'paid':
            return jsonify({'error': 'Pago no completado'}), 400
        
        # Extraer metadata
        metadata = session.metadata
        
        # Extraer información de productos desde metadata
        items_data = []
        if 'items_data' in metadata:
            try:
                items_data = json.loads(metadata['items_data'])
            except json.JSONDecodeError:
                print("⚠️ Error al parsear items_data de metadata")
        
        # Obtener line items para verificar
        line_items = stripe.checkout.Session.list_line_items(session_id)
        
        # Crear la orden en la base de datos
        conn = get_db_connection()
        
        # Generar número de orden
        import time
        order_number = f"ORD-{int(time.time())}"
        
        # Calcular total
        total_amount = session.amount_total / 100  # Convertir de centavos
        
        # Insertar orden
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO orders (
                order_number, payment_method, payment_status, total_amount,
                stripe_session_id, customer_name, customer_phone, customer_email,
                delivery_address, order_notes, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            order_number,
            'stripe',
            'completed',
            total_amount,
            session_id,
            metadata.get('customer_name', ''),
            metadata.get('customer_phone', ''),
            metadata.get('customer_email', ''),
            metadata.get('delivery_address', ''),
            metadata.get('order_notes', ''),
            'confirmed'
        ))
        
        order_id = cursor.lastrowid
        
        # Insertar items de la orden usando metadata
        if items_data:
            for item_info in items_data:
                cursor.execute('''
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, total_price
                    ) VALUES (?, ?, ?, ?, ?)
                ''', (
                    order_id,
                    item_info.get('product_id', 1),
                    item_info.get('quantity', 1),
                    item_info.get('unit_price', 0),
                    item_info.get('unit_price', 0) * item_info.get('quantity', 1)
                ))
        else:
            # Fallback: usar line_items de Stripe
            for item in line_items.data:
                price_data = item.price
                cursor.execute('''
                    INSERT INTO order_items (
                        order_id, product_id, quantity, unit_price, total_price
                    ) VALUES (?, ?, ?, ?, ?)
                ''', (
                    order_id,
                    1,  # ID genérico
                    item.quantity,
                    price_data.unit_amount / 100,
                    (price_data.unit_amount * item.quantity) / 100
                ))
        
        conn.commit()
        conn.close()
        
        print(f"✅ Orden creada exitosamente: {order_number}")
        
        return jsonify({
            'success': True,
            'order_number': order_number,
            'order_id': order_id,
            'total_amount': total_amount,
            'message': 'Pago verificado y orden creada exitosamente'
        })
        
    except stripe.error.StripeError as e:
        print(f"❌ Error de Stripe: {e}")
        return jsonify({'error': f'Error de Stripe: {str(e)}'}), 500
    except Exception as e:
        print(f"❌ Error al verificar pago: {e}")
        return jsonify({'error': 'Error interno del servidor'}), 500

@app.route('/checkout/success')
def checkout_success():
    """Página de éxito del pago"""
    session_id = request.args.get('session_id')
    
    if not session_id:
        return "Error: No se proporcionó session_id", 400
    
    # HTML simple para la página de éxito
    html_template = '''
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Exitoso - Tienda de Abarrotes</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
                background-color: #f8f9fa;
            }
            .success-container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .success-icon {
                font-size: 60px;
                color: #28a745;
                margin-bottom: 20px;
            }
            .session-id {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 5px;
                font-family: monospace;
                margin: 20px 0;
                word-break: break-all;
            }
            .btn {
                background: #007bff;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }
            .btn:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="success-container">
            <div class="success-icon">✅</div>
            <h1>¡Pago Exitoso!</h1>
            <p>Tu pago ha sido procesado correctamente.</p>
            <p><strong>ID de Sesión:</strong></p>
            <div class="session-id">{{ session_id }}</div>
            <p>Recibirás un correo de confirmación con los detalles de tu pedido.</p>
            <a href="/" class="btn">Volver a la Tienda</a>
        </div>
        
        <script>
            // Verificar el pago automáticamente
            fetch('/api/verify-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    session_id: '{{ session_id }}'
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('✅ Orden creada:', data.order_number);
                } else {
                    console.error('❌ Error al crear orden:', data.error);
                }
            })
            .catch(error => {
                console.error('❌ Error al verificar pago:', error);
            });
        </script>
    </body>
    </html>
    '''
    
    return render_template_string(html_template, session_id=session_id)

@app.route('/checkout/cancel')
def checkout_cancel():
    """Página de cancelación del pago"""
    html_template = '''
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Cancelado - Tienda de Abarrotes</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                text-align: center;
                background-color: #f8f9fa;
            }
            .cancel-container {
                background: white;
                padding: 40px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .cancel-icon {
                font-size: 60px;
                color: #dc3545;
                margin-bottom: 20px;
            }
            .btn {
                background: #007bff;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin-top: 20px;
            }
            .btn:hover {
                background: #0056b3;
            }
        </style>
    </head>
    <body>
        <div class="cancel-container">
            <div class="cancel-icon">❌</div>
            <h1>Pago Cancelado</h1>
            <p>Has cancelado el proceso de pago.</p>
            <p>Tus productos siguen en el carrito y puedes intentar de nuevo cuando lo desees.</p>
            <a href="/" class="btn">Volver a la Tienda</a>
        </div>
    </body>
    </html>
    '''
    
    return render_template_string(html_template)

@app.route('/api/orders/create-payment-intent', methods=['POST'])
@jwt_required()
def create_payment_intent():
    """Crear Payment Intent para Stripe"""
    try:
        data = request.get_json()
        amount = data.get('amount')  # En centavos
        currency = data.get('currency', 'mxn')
        
        if not amount or amount <= 0:
            return jsonify({'error': 'Monto inválido'}), 400
            
        # Crear Payment Intent
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),  # Stripe maneja centavos
            currency=currency,
            metadata={
                'user_id': get_jwt_identity(),
                'integration_check': 'accept_a_payment'
            }
        )
        
        return jsonify({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders', methods=['POST'])
@jwt_required(optional=True)
def create_order():
    """Crear nueva orden"""
    try:
        data = request.get_json()
        user_id = get_jwt_identity()  # Será None si no hay token
        
        # Validar datos requeridos
        required_fields = ['items', 'payment_method', 'customer_name', 'customer_phone', 'total_amount']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo requerido: {field}'}), 400
        
        cart_items = data['items']
        payment_method = data['payment_method']
        customer_name = data['customer_name']
        customer_phone = data['customer_phone']
        customer_email = data.get('customer_email', '')
        delivery_address = data.get('delivery_address', '')
        order_notes = data.get('order_notes', '')
        stripe_payment_intent_id = data.get('stripe_payment_intent_id')
        
        if not cart_items:
            return jsonify({'error': 'El carrito está vacío'}), 400
            
        # Usar el total que viene del frontend
        total_amount = data['total_amount']
        order_number = generate_order_number()
        
        conn = get_db_connection()
        
        # Crear orden
        payment_status = 'completed' if payment_method in ['cash', 'transfer'] else 'pending'
        
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO orders (
                user_id, order_number, payment_method, payment_status, 
                total_amount, stripe_payment_intent_id, customer_name, 
                customer_phone, customer_email, delivery_address, order_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id, order_number, payment_method, payment_status,
            total_amount, stripe_payment_intent_id, customer_name,
            customer_phone, customer_email, delivery_address, order_notes
        ))
        
        order_id = cursor.lastrowid
        
        # Agregar items de la orden
        for item in cart_items:
            cursor.execute('''
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, total_price
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                order_id, item['product_id'], item['quantity'], 
                item['unit_price'], item['unit_price'] * item['quantity']
            ))
        
        # Limpiar carrito del usuario
        if user_id and user_id != 'null':
            cursor.execute('DELETE FROM cart_items WHERE user_id = ?', (user_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Orden creada exitosamente',
            'order_id': order_id,
            'order_number': order_number,
            'total_amount': total_amount,
            'payment_status': payment_status
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/confirm-payment', methods=['POST'])
@jwt_required()
def confirm_payment():
    """Confirmar pago de Stripe"""
    try:
        data = request.get_json()
        payment_intent_id = data.get('payment_intent_id')
        order_id = data.get('order_id')
        
        if not payment_intent_id or not order_id:
            return jsonify({'error': 'Datos de pago faltantes'}), 400
            
        # Verificar el pago con Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        if intent.status == 'succeeded':
            # Actualizar estado de la orden
            conn = get_db_connection()
            conn.execute('''
                UPDATE orders 
                SET payment_status = 'completed', updated_at = CURRENT_TIMESTAMP
                WHERE id = ? AND stripe_payment_intent_id = ?
            ''', (order_id, payment_intent_id))
            conn.commit()
            conn.close()
            
            return jsonify({
                'message': 'Pago confirmado exitosamente',
                'payment_status': 'completed'
            })
        else:
            return jsonify({'error': 'El pago no fue completado'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/orders/my-orders', methods=['GET'])
@jwt_required()
def get_user_orders():
    """Obtener órdenes del usuario"""
    try:
        user_id = get_jwt_identity()
        
        conn = get_db_connection()
        orders = conn.execute('''
            SELECT * FROM orders 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user_id,)).fetchall()
        
        orders_list = []
        for order in orders:
            # Obtener items de la orden
            items = conn.execute('''
                SELECT oi.*, p.name, p.image_url 
                FROM order_items oi
                JOIN products p ON oi.product_id = p.id
                WHERE oi.order_id = ?
            ''', (order['id'],)).fetchall()
            
            orders_list.append({
                'id': order['id'],
                'order_number': order['order_number'],
                'payment_method': order['payment_method'],
                'payment_status': order['payment_status'],
                'total_amount': order['total_amount'],
                'customer_name': order['customer_name'],
                'created_at': order['created_at'],
                'items': [dict(item) for item in items]
            })
        
        conn.close()
        return jsonify(orders_list)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join('build', path)):
        return send_from_directory('build', path)
    else:
        return send_file('build/index.html')

if __name__ == '__main__':
    app.run(debug=True)