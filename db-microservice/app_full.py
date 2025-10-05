from flask import Flask, jsonify, request, send_from_directory, send_file
import sqlite3
import os

# Obtener la ruta del directorio raíz del proyecto
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)  # Un nivel arriba desde db-microservice

# Configurar Flask para servir archivos estáticos desde la carpeta build
app = Flask(__name__, 
            static_folder=os.path.join(project_root, 'build'),  # Ruta absoluta a build
            static_url_path='')

# CORS manual (funciona mejor que Flask-CORS en PythonAnywhere)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

def get_db_connection():
    # Usar ruta absoluta para la base de datos
    db_path = os.path.join(project_root, 'db.sqlite3')
    conn = sqlite3.connect(db_path)
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
    index_path = os.path.join(project_root, 'build', 'index.html')
    return send_file(index_path)

@app.route('/images/<path:filename>')
def serve_images(filename):
    """Servir imágenes de productos"""
    try:
        # Las imágenes se buscan directamente en build/images/ 
        # porque filename ya incluye "products/imagen.jpg"
        images_path = os.path.join(project_root, 'build', 'images')
        return send_from_directory(images_path, filename)
    except:
        placeholder_path = os.path.join(project_root, 'build', 'images', 'products')
        return send_from_directory(placeholder_path, 'placeholder.svg')

@app.route('/<path:path>')
def serve_static_files(path):
    """Servir archivos estáticos del frontend o SPA fallback"""
    
    # Si es una ruta de API, retornar 404
    if path.startswith('api/'):
        return jsonify({'error': 'API endpoint not found'}), 404
    
    # Intentar servir el archivo estático
    try:
        build_path = os.path.join(project_root, 'build')
        return send_from_directory(build_path, path)
    except:
        # Si no existe el archivo, servir index.html (para SPA routing)
        index_path = os.path.join(project_root, 'build', 'index.html')
        return send_file(index_path)

if __name__ == '__main__':
    # Configuración para desarrollo local
    app.run(port=5001, debug=True, host='0.0.0.0')