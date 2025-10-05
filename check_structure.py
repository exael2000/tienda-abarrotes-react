import sqlite3

try:
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # Verificar estructura de la tabla productos
    cursor.execute("PRAGMA table_info(productos)")
    columns = cursor.fetchall()
    print("Estructura actual de la tabla productos:")
    for col in columns:
        print(f"  - {col[1]} ({col[2]})")
    
    # Verificar todos los productos
    cursor.execute("SELECT * FROM productos")
    products = cursor.fetchall()
    print(f"\nProductos actuales ({len(products)}):")
    for product in products:
        print(f"  - {product}")
    
    conn.close()
    
except Exception as e:
    print(f"Error: {e}")