from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
import sqlite3
import bcrypt
from datetime import datetime, timedelta
import stripe
import os
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure proper headers
@app.after_request
def after_request(response):
    response.headers['Content-Type'] = 'application/json; charset=utf-8'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    return response

# Configuración JWT
app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-super-segura-cambiar-en-produccion'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

def get_db_connection():
    conn = sqlite3.connect('db.sqlite3')
    conn.row_factory = sqlite3.Row
    return conn

# ===== ENDPOINTS DE AUTENTICACIÓN =====

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registrar nuevo usuario"""
    data = request.get_json()
    
    # Validar datos requeridos
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    username = data['username'].strip()
    email = data['email'].strip().lower()
    password = data['password']
    first_name = data['first_name'].strip()
    last_name = data['last_name'].strip()
    
    # Validaciones básicas
    if len(username) < 3:
        return jsonify({'error': 'El usuario debe tener al menos 3 caracteres'}), 400
    
    if len(password) < 4:
        return jsonify({'error': 'La contraseña debe tener al menos 4 caracteres'}), 400
    
    if '@' not in email:
        return jsonify({'error': 'Email inválido'}), 400
    
    conn = get_db_connection()
    
    # Verificar si ya existe el usuario o email
    existing_user = conn.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        (username, email)
    ).fetchone()
    
    if existing_user:
        conn.close()
        return jsonify({'error': 'Usuario o email ya registrado'}), 409
    
    # Hash de la contraseña
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Insertar nuevo usuario
    try:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
        ''', (username, email, password_hash, first_name, last_name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Crear token de acceso
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

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Iniciar sesión"""
    data = request.get_json()
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Usuario y contraseña son requeridos'}), 400
    
    username = data['username'].strip()
    password = data['password']
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
        (username,)
    ).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    # Verificar contraseña
    if not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        conn.close()
        return jsonify({'error': 'Credenciales inválidas'}), 401
    
    conn.close()
    
    # Crear token de acceso
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
    })

@app.route('/api/auth/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Obtener perfil del usuario autenticado"""
    user_id = int(get_jwt_identity())
    
    conn = get_db_connection()
    user = conn.execute(
        'SELECT id, username, email, first_name, last_name, created_at FROM users WHERE id = ? AND is_active = TRUE',
        (user_id,)
    ).fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'Usuario no encontrado'}), 404
    
    conn.close()
    return jsonify(dict(user))

@app.route('/api/auth/logout', methods=['POST'])
@jwt_required()
def logout():
    """Cerrar sesión (invalidar token)"""
    # En una implementación completa, aquí invalidarías el token
    # Por simplicidad, solo retornamos un mensaje
    return jsonify({'message': 'Sesión cerrada exitosamente'})

# ===== ENDPOINTS DE PRODUCTOS =====

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

# ===== ENDPOINTS DE CARRITO =====

@app.route('/api/cart', methods=['GET'])
@jwt_required()
def get_cart():
    """Obtener carrito del usuario autenticado"""
    user_id = int(get_jwt_identity())
    
    print(f"🛒 Loading cart for user {user_id}")
    
    conn = get_db_connection()
    cart_items = conn.execute('''
        SELECT c.product_id, c.quantity, c.order_position, c.updated_at,
               p.name, p.description, p.price_cents, p.image, 
               p.brand, p.weight, p.stock
        FROM cart_items c
        JOIN productos p ON c.product_id = p.id
        WHERE c.user_id = ?
        ORDER BY c.order_position ASC, c.created_at ASC
    ''', (user_id,)).fetchall()
    conn.close()
    
    print(f"🛒 Found {len(cart_items)} items in cart for user {user_id}")
    
    # Convertir a formato compatible con el frontend
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
            'quantity': item['quantity'],
            'order': item['order_position'] or 0,
            'addedAt': item['updated_at']
        })
    
    print(f"🛒 Returning cart data: {[item['name'] for item in cart_data]}")
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

@app.route('/api/cart/update', methods=['PUT'])
@jwt_required()
def update_cart_quantity():
    """Actualizar cantidad de item en carrito"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    product_id = data.get('product_id')
    quantity = data.get('quantity')
    
    if not product_id or quantity is None:
        return jsonify({'error': 'product_id y quantity son requeridos'}), 400
    
    conn = get_db_connection()
    
    if quantity <= 0:
        # Eliminar item del carrito
        conn.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', 
                    (user_id, product_id))
    else:
        # Verificar stock
        product = conn.execute('SELECT stock FROM productos WHERE id = ?', (product_id,)).fetchone()
        if not product:
            conn.close()
            return jsonify({'error': 'Producto no encontrado'}), 404
        
        if quantity > product['stock']:
            conn.close()
            return jsonify({'error': 'Stock insuficiente'}), 400
        
        # Actualizar cantidad
        conn.execute('''
            UPDATE cart_items 
            SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE user_id = ? AND product_id = ?
        ''', (quantity, user_id, product_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Carrito actualizado'}), 200

@app.route('/api/cart/remove', methods=['DELETE'])
@jwt_required()
def remove_from_cart():
    """Eliminar item del carrito"""
    user_id = int(get_jwt_identity())
    product_id = request.args.get('product_id')
    
    print(f"🗑️ Backend: Removing product {product_id} for user {user_id}")
    
    if not product_id:
        return jsonify({'error': 'product_id es requerido'}), 400
    
    conn = get_db_connection()
    
    # Verificar si el item existe antes de eliminarlo
    cursor = conn.execute('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?', 
                         (user_id, product_id))
    existing_item = cursor.fetchone()
    
    if existing_item:
        print(f"🗑️ Backend: Found item to remove: {dict(existing_item)}")
        conn.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', 
                    (user_id, product_id))
        conn.commit()
        print(f"🗑️ Backend: Successfully removed product {product_id}")
    else:
        print(f"⚠️ Backend: Product {product_id} not found in cart for user {user_id}")
    
    conn.close()
    
    return jsonify({'message': 'Producto eliminado del carrito'}), 200

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

@app.route('/api/cart/sync', methods=['POST'])
@jwt_required()
def sync_cart():
    """Sincronizar carrito local con base de datos"""
    user_id = int(get_jwt_identity())
    data = request.get_json()
    
    local_cart = data.get('cart_items', [])
    
    conn = get_db_connection()
    
    # Obtener carrito actual de la BD
    db_cart = conn.execute('''
        SELECT product_id, quantity, order_position 
        FROM cart_items 
        WHERE user_id = ?
    ''', (user_id,)).fetchall()
    
    # Crear diccionario para fácil acceso
    db_cart_dict = {item['product_id']: {
        'quantity': item['quantity'], 
        'order': item['order_position']
    } for item in db_cart}
    
    # Obtener el máximo order_position actual
    max_order = conn.execute('''
        SELECT COALESCE(MAX(order_position), 0) as max_order
        FROM cart_items WHERE user_id = ?
    ''', (user_id,)).fetchone()['max_order']
    
    # Procesar items del carrito local
    for index, item in enumerate(local_cart):
        product_id = item.get('id')
        quantity = item.get('quantity', 0)
        item_order = item.get('order', max_order + index + 1)
        
        print(f"🔄 Syncing item {product_id}: quantity={quantity}, order={item_order}")
        
        if product_id and quantity > 0:
            # Verificar stock
            product = conn.execute('SELECT stock FROM productos WHERE id = ?', (product_id,)).fetchone()
            if product and quantity <= product['stock']:
                if product_id in db_cart_dict:
                    # Actualizar item existente (mantener cantidad total, actualizar orden si es necesario)
                    current_order = db_cart_dict[product_id]['order'] or item_order
                    conn.execute('''
                        UPDATE cart_items 
                        SET quantity = ?, order_position = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE user_id = ? AND product_id = ?
                    ''', (quantity, current_order, user_id, product_id))
                else:
                    # Agregar nuevo item con orden
                    conn.execute('''
                        INSERT INTO cart_items (user_id, product_id, quantity, order_position, updated_at)
                        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
                    ''', (user_id, product_id, quantity, item_order))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Carrito sincronizado exitosamente'}), 200

# ===== ENDPOINTS DE ÓRDENES =====

@app.route('/api/orders', methods=['POST'])
def create_order():
    """Crear nueva orden"""
    data = request.get_json()
    
    # Validar datos requeridos
    required_fields = ['customer_name', 'customer_phone', 'payment_method', 'total_amount', 'items']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'error': f'El campo {field} es requerido'}), 400
    
    # Validar que hay items
    if not data['items'] or len(data['items']) == 0:
        return jsonify({'error': 'La orden debe tener al menos un producto'}), 400
    
    # Validar método de pago
    if data['payment_method'] not in ['cash', 'card']:
        return jsonify({'error': 'Método de pago inválido'}), 400
    
    conn = get_db_connection()
    
    try:
        # Generar número de orden único
        import time
        import random
        timestamp = int(time.time())
        random_num = random.randint(100, 999)
        order_number = f"ORD-{timestamp}-{random_num}"
        
        # Insertar orden principal
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO orders (
                order_number, payment_method, payment_status, total_amount,
                customer_name, customer_phone, customer_email, delivery_address, order_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order_number,
            data['payment_method'],
            'completed' if data['payment_method'] == 'cash' else 'pending',
            data['total_amount'],
            data['customer_name'],
            data['customer_phone'],
            data.get('customer_email', ''),
            data.get('delivery_address', ''),
            data.get('order_notes', '')
        ))
        
        order_id = cursor.lastrowid
        
        # Insertar items de la orden
        for item in data['items']:
            cursor.execute('''
                INSERT INTO order_items (
                    order_id, product_id, quantity, unit_price, total_price
                ) VALUES (?, ?, ?, ?, ?)
            ''', (
                order_id,
                item['product_id'],
                item['quantity'],
                item['unit_price'],
                item['unit_price'] * item['quantity']
            ))
        
        conn.commit()
        
        return jsonify({
            'message': 'Orden creada exitosamente',
            'order_id': order_id,
            'order_number': order_number,
            'status': 'completed' if data['payment_method'] == 'cash' else 'pending'
        }), 201
        
    except Exception as e:
        conn.rollback()
        print(f"Error al crear orden: {e}")
        return jsonify({'error': 'Error al crear la orden'}), 500
    finally:
        conn.close()

@app.route('/api/orders/<order_number>', methods=['GET'])
def get_order(order_number):
    """Obtener detalles de una orden"""
    conn = get_db_connection()
    
    try:
        # Obtener orden
        order = conn.execute('''
            SELECT * FROM orders WHERE order_number = ?
        ''', (order_number,)).fetchone()
        
        if not order:
            return jsonify({'error': 'Orden no encontrada'}), 404
        
        # Obtener items de la orden
        items = conn.execute('''
            SELECT oi.*, p.name as product_name, p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
        ''', (order['id'],)).fetchall()
        
        return jsonify({
            'order': dict(order),
            'items': [dict(item) for item in items]
        }), 200
        
    except Exception as e:
        print(f"Error al obtener orden: {e}")
        return jsonify({'error': 'Error al obtener la orden'}), 500
    finally:
        conn.close()

# ===== ENDPOINTS DE STRIPE =====

# Configuración de Stripe desde variables de entorno
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY')
STRIPE_PUBLIC_KEY = os.getenv('STRIPE_PUBLIC_KEY')

if not STRIPE_SECRET_KEY or not STRIPE_PUBLIC_KEY:
    raise ValueError("Las claves de Stripe no están configuradas en las variables de entorno")

# Configurar Stripe
stripe.api_key = STRIPE_SECRET_KEY

@app.route('/api/stripe/config', methods=['GET'])
def get_stripe_config():
    """Obtener configuración pública de Stripe"""
    try:
        config = {
            'publishable_key': STRIPE_PUBLIC_KEY
        }
        
        return jsonify(config), 200
        
    except Exception as e:
        print(f"Error al obtener configuración de Stripe: {e}")
        return jsonify({'error': 'Error al obtener configuración de Stripe'}), 500

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
        for item in items:
            line_items.append({
                'price_data': {
                    'currency': 'mxn',
                    'product_data': {
                        'name': item.get('name', ''),
                        'images': [item.get('image_url', '')] if item.get('image_url') else [],
                    },
                    'unit_amount': int((item.get('unit_price', 0)) * 100),  # Convertir a centavos
                },
                'quantity': item.get('quantity', 1),
            })
        
        # Crear sesión de Checkout
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=line_items,
            mode='payment',
            success_url='http://localhost:3000/checkout/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/checkout/cancel',
            metadata={
                'customer_name': customer_info['name'],
                'customer_email': customer_info['email'],
                'customer_phone': customer_info['phone'],
                'delivery_address': customer_info['address'],
                'order_notes': customer_info['notes'],
                'items': json.dumps(items)  # Guardar items para crear la orden después
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

@app.route('/api/stripe/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """Crear Payment Intent para Stripe"""
    data = request.get_json()
    
    try:
        amount = data.get('amount', 0)
        currency = data.get('currency', 'mxn')
        
        # Crear el Payment Intent real con Stripe
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,  # Stripe espera centavos
            currency=currency,
            metadata={
                'integration_check': 'accept_a_payment'
            }
        )
        
        return jsonify({
            'client_secret': payment_intent.client_secret,
            'id': payment_intent.id,
            'amount': payment_intent.amount,
            'currency': payment_intent.currency,
            'status': payment_intent.status
        }), 200
        
    except stripe.error.StripeError as e:
        print(f"Error de Stripe: {e}")
        return jsonify({'error': f'Error de Stripe: {str(e)}'}), 400
    except Exception as e:
        print(f"Error al crear Payment Intent: {e}")
        return jsonify({'error': 'Error al crear Payment Intent'}), 500

@app.route('/api/stripe/confirm-payment', methods=['POST'])
def confirm_payment():
    """Confirmar pago con Stripe (simulado)"""
    data = request.get_json()
    
    try:
        payment_intent_id = data.get('payment_intent_id')
        
        # En un entorno real, aquí se confirmaría el pago con Stripe
        # Por ahora, simularemos que el pago fue exitoso
        
        # Crear la orden igual que en el endpoint de efectivo
        customer_name = data.get('customer_name', '')
        customer_phone = data.get('customer_phone', '')
        customer_email = data.get('customer_email', '')
        delivery_address = data.get('delivery_address', '')
        order_notes = data.get('order_notes', '')
        total_amount = data.get('total_amount', 0)
        items = data.get('items', [])
        
        conn = get_db_connection()
        
        # Crear número único de orden
        order_number = f"ORD-{int(datetime.now().timestamp())}-{hash(customer_name) % 1000:03d}"
        
        # Insertar orden principal
        conn.execute('''
            INSERT INTO orders (
                order_number, customer_name, customer_phone, customer_email,
                delivery_address, order_notes, payment_method, total_amount, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            order_number, customer_name, customer_phone, customer_email,
            delivery_address, order_notes, 'card', total_amount, 'completed'
        ))
        
        order_id = conn.lastrowid
        
        # Insertar items de la orden
        for item in items:
            conn.execute('''
                INSERT INTO order_items (
                    order_id, product_id, name, quantity, unit_price, image_url
                ) VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                order_id, 
                item.get('product_id', 0),
                item.get('name', ''),
                item.get('quantity', 1),
                item.get('unit_price', 0),
                item.get('image_url', '')
            ))
        
        conn.commit()
        
        return jsonify({
            'message': 'Pago procesado exitosamente',
            'order_id': order_id,
            'order_number': order_number,
            'payment_intent_id': payment_intent_id,
            'status': 'completed'
        }), 200
        
    except Exception as e:
        print(f"Error al confirmar pago: {e}")
        if conn:
            conn.rollback()
        return jsonify({'error': 'Error al procesar el pago'}), 500
    finally:
        if conn:
            conn.close()

@app.route('/api/verify-payment', methods=['POST'])
def verify_stripe_payment():
    """Verificar sesión de Stripe y crear orden"""
    print("🔍 Endpoint /api/verify-payment llamado")
    data = request.get_json()
    session_id = data.get('session_id')
    print(f"📋 Session ID recibido: {session_id}")
    
    if not session_id:
        print("❌ Error: session_id no proporcionado")
        return jsonify({'error': 'session_id es requerido'}), 400
    
    try:
        print("🔍 Verificando sesión con Stripe...")
        # Verificar la sesión con Stripe
        session = stripe.checkout.Session.retrieve(session_id)
        print(f"💳 Estado del pago: {session.payment_status}")
        print(f"💰 Monto: {session.amount_total}")
        
        if session.payment_status == 'paid':
            print("✅ Pago confirmado, creando orden...")
            # Extraer información de la sesión
            metadata = session.metadata or {}
            print(f"📋 Metadata: {metadata}")
            
            conn = get_db_connection()
            
            try:
                # Generar número de orden
                import time
                import random
                timestamp = int(time.time())
                random_num = random.randint(100, 999)
                order_number = f"ORD-{timestamp}-{random_num}"
                print(f"🏷️ Número de orden generado: {order_number}")
                
                # Crear la orden
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO orders (
                        order_number, payment_method, payment_status, total_amount,
                        customer_name, customer_phone, customer_email,
                        stripe_payment_intent_id, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
                ''', (
                    order_number,
                    'card',
                    'completed',
                    session.amount_total / 100,  # Stripe usa centavos
                    metadata.get('customer_name', 'Cliente Stripe'),
                    metadata.get('customer_phone', ''),
                    session.customer_details.email if session.customer_details else '',
                    session.payment_intent
                ))
                
                order_id = cursor.lastrowid
                print(f"💾 Orden creada con ID: {order_id}")
                
                # Si hay items en metadata, agregarlos
                if 'items' in metadata:
                    print("📦 Agregando items a la orden...")
                    items = json.loads(metadata['items'])
                    print(f"📋 Items: {len(items)} productos")
                    for item in items:
                        cursor.execute('''
                            INSERT INTO order_items (
                                order_id, product_id, quantity, unit_price, total_price
                            ) VALUES (?, ?, ?, ?, ?)
                        ''', (
                            order_id,
                            item['product_id'],
                            item['quantity'],
                            item['unit_price'],
                            item['unit_price'] * item['quantity']
                        ))
                else:
                    print("⚠️ No se encontraron items en metadata")
                
                conn.commit()
                print("✅ Orden guardada exitosamente en la base de datos")
                
                return jsonify({
                    'success': True,
                    'order_id': order_id,
                    'order_number': order_number,
                    'payment_status': 'completed',
                    'message': 'Pago verificado y orden creada exitosamente'
                }), 200
                
            except Exception as db_error:
                conn.rollback()
                print(f"Error de base de datos: {db_error}")
                return jsonify({'error': 'Error al crear la orden en la base de datos'}), 500
            finally:
                conn.close()
        else:
            return jsonify({'error': 'El pago no está completado'}), 400
            
    except stripe.error.InvalidRequestError:
        return jsonify({'error': 'Sesión de pago inválida'}), 400
    except Exception as e:
        print(f"Error al verificar pago: {e}")
        return jsonify({'error': 'Error al verificar el pago'}), 500

if __name__ == '__main__':
    # Configuración para desarrollo local
    app.run(port=5001, debug=True, host='0.0.0.0')