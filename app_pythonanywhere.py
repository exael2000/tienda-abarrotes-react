from flask import Flask, jsonify, request, send_from_directory, send_file
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
import sqlite3
import bcrypt
from datetime import datetime, timedelta
import os

app = Flask(__name__, static_folder='build', static_url_path='')
CORS(app, origins=["*"], allow_headers=["*"], methods=["*"])

# Configuración JWT
app.config['JWT_SECRET_KEY'] = 'tu-clave-secreta-super-segura'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
jwt = JWTManager(app)

def get_db_connection():
    db_path = os.path.join(os.path.dirname(__file__), 'db-microservice', 'db.sqlite3')
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

@app.route('/api/products')
def get_products():
    conn = get_db_connection()
    products = conn.execute('SELECT * FROM productos ORDER BY supplier, name').fetchall()
    conn.close()
    
    products_list = [dict(product) for product in products]
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

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join('build', path)):
        return send_from_directory('build', path)
    else:
        return send_file('build/index.html')

if __name__ == '__main__':
    app.run(debug=True)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def get_db_connection():
    # Ruta fija para PythonAnywhere
    conn = sqlite3.connect('/home/exael/tienda-abarrotes-react/db.sqlite3')
    conn.row_factory = sqlite3.Row
    return conn

# ================================
# API ENDPOINTS
# ================================

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

# ================================
# FRONTEND ROUTES
# ================================

@app.route('/')
def serve_frontend():
    """Servir la página principal del frontend"""
    return send_file('/home/exael/tienda-abarrotes-react/build/index.html')

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Servir imágenes de productos"""
    try:
        return send_from_directory('/home/exael/tienda-abarrotes-react/build/images', filename)
    except:
        return send_from_directory('/home/exael/tienda-abarrotes-react/build/images/products', 'placeholder.svg')

@app.route('/<path:path>')
def serve_static_files(path):
    """Servir archivos estáticos del frontend o SPA fallback"""
    
    # Si es una ruta de API, retornar 404
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # Intentar servir el archivo estático
    try:
        return send_from_directory('/home/exael/tienda-abarrotes-react/build', path)
    except:
        # Si no existe el archivo, servir index.html (para SPA routing)
        return send_file('/home/exael/tienda-abarrotes-react/build/index.html')

if __name__ == '__main__':
    # Configuración para desarrollo local
    app.run(port=5001, debug=True, host='0.0.0.0')