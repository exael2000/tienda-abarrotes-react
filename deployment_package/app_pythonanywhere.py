from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity, get_jwt
import sqlite3
import bcrypt
from datetime import datetime, timedelta

app = Flask(__name__)
# Configuración específica para PythonAnywhere
CORS(app, origins=["*"], allow_headers=["*"], methods=["*"])

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
        return jsonify({'error': 'El usuario o email ya existe'}), 400
    
    # Hashear contraseña
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    try:
        # Insertar nuevo usuario
        cursor = conn.execute('''
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
        'SELECT * FROM users WHERE username = ?', (username,)
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
    }), 200

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

# ===== ENDPOINTS DE PRODUCTOS =====

@app.route('/api/products')
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM productos ORDER BY supplier, name').fetchall()
    conn.close()
    
    # Convertir rows a diccionarios
    products_list = []
    for product in products:
        product_dict = dict(product)
        products_list.append(product_dict)
    
    return jsonify(products_list)

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
    conn.execute('''
        INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(user_id, product_id) 
        DO UPDATE SET quantity = quantity + excluded.quantity, updated_at = CURRENT_TIMESTAMP
    ''', (user_id, product_id, quantity))
    
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
    
    if not product_id:
        return jsonify({'error': 'product_id es requerido'}), 400
    
    conn = get_db_connection()
    conn.execute('DELETE FROM cart_items WHERE user_id = ? AND product_id = ?', 
                (user_id, product_id))
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Producto eliminado del carrito'}), 200

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
        SELECT product_id, quantity 
        FROM cart_items 
        WHERE user_id = ?
    ''', (user_id,)).fetchall()
    
    # Crear diccionario para fácil acceso
    db_cart_dict = {item['product_id']: item['quantity'] for item in db_cart}
    
    # Procesar items del carrito local
    for item in local_cart:
        product_id = item.get('id')
        quantity = item.get('quantity', 0)
        
        if product_id and quantity > 0:
            # Verificar stock
            product = conn.execute('SELECT stock FROM productos WHERE id = ?', (product_id,)).fetchone()
            if product and quantity <= product['stock']:
                if product_id in db_cart_dict:
                    # Combinar cantidades (local + BD)
                    new_quantity = min(db_cart_dict[product_id] + quantity, product['stock'])
                    conn.execute('''
                        UPDATE cart_items 
                        SET quantity = ?, updated_at = CURRENT_TIMESTAMP 
                        WHERE user_id = ? AND product_id = ?
                    ''', (new_quantity, user_id, product_id))
                else:
                    # Agregar nuevo item
                    conn.execute('''
                        INSERT INTO cart_items (user_id, product_id, quantity, updated_at)
                        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                    ''', (user_id, product_id, quantity))
    
    conn.commit()
    conn.close()
    
    return jsonify({'message': 'Carrito sincronizado exitosamente'}), 200

# ===== HEALTH CHECK =====
@app.route('/api/health')
def health_check():
    return jsonify({'status': 'OK', 'message': 'API funcionando correctamente'})

if __name__ == '__main__':
    # Configuración para desarrollo local
    app.run(port=5001, debug=True, host='0.0.0.0')