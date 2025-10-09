#!/usr/bin/env python3
import sqlite3
import os

def check_database():
    db_path = 'db.sqlite3'
    
    if not os.path.exists(db_path):
        print(f"❌ Base de datos no encontrada: {db_path}")
        return False
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar tablas
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"📊 Tablas encontradas: {tables}")
        
        # Verificar datos
        if 'productos' in tables:
            cursor.execute("SELECT COUNT(*) FROM productos")
            product_count = cursor.fetchone()[0]
            print(f"📦 Productos: {product_count}")
            
        if 'users' in tables:
            cursor.execute("SELECT COUNT(*) FROM users") 
            user_count = cursor.fetchone()[0]
            print(f"👥 Usuarios: {user_count}")
            
        conn.close()
        print("✅ Base de datos verificada correctamente")
        return True
        
    except Exception as e:
        print(f"❌ Error al verificar la base de datos: {e}")
        return False

if __name__ == "__main__":
    check_database()