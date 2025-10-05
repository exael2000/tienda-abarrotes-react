import sqlite3
import os

# Verificar si el archivo existe
print(f"Archivo db.sqlite3 existe: {os.path.exists('db.sqlite3')}")
print(f"Tamaño del archivo: {os.path.getsize('db.sqlite3') if os.path.exists('db.sqlite3') else 'N/A'} bytes")

try:
    # Conectar a la base de datos
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # Verificar tablas
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"Tablas encontradas: {tables}")
    
    if tables:
        # Verificar productos
        cursor.execute("SELECT COUNT(*) FROM productos")
        count = cursor.fetchone()[0]
        print(f"Número de productos: {count}")
        
        if count > 0:
            # Mostrar los primeros 3 productos
            cursor.execute("SELECT id, name, supplier FROM productos LIMIT 3")
            products = cursor.fetchall()
            print("Primeros 3 productos:")
            for product in products:
                print(f"  - ID: {product[0]}, Nombre: {product[1]}, Proveedor: {product[2]}")
    
    conn.close()
    print("Base de datos verificada correctamente")
    
except Exception as e:
    print(f"Error al verificar la base de datos: {e}")