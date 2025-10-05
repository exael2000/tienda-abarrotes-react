from flask import Flask, jsonify, request, send_from_directory, send_file
import sqlite3
import os

# Configurar Flask para PythonAnywhere (ruta fija)
app = Flask(__name__, 
            static_folder='/home/exael/tienda-abarrotes-react/build',
            static_url_path='')

# CORS manual (sin dependencia de flask-cors)
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