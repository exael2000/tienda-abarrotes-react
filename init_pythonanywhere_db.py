#!/usr/bin/env python3
"""
Script de inicialización de base de datos para PythonAnywhere
Crea todas las tablas necesarias para la aplicación
"""

import sqlite3
import os
import sys
from datetime import datetime

def create_database():
    """Crear base de datos y todas las tablas necesarias"""
    
    # Ruta de la base de datos
    db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
    
    print(f"🔧 Creando base de datos en: {db_path}")
    
    # Conectar a la base de datos (la crea si no existe)
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. Tabla de usuarios
        print("📝 Creando tabla 'users'...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT,
                phone TEXT,
                address TEXT,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 2. Tabla de productos (ya debe existir)
        print("📝 Verificando tabla 'productos'...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS productos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                price_cents INTEGER NOT NULL,
                image_url TEXT,
                category TEXT,
                brand TEXT,
                supplier TEXT,
                stock INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 3. Tabla de carrito
        print("📝 Creando tabla 'cart_items'...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS cart_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES productos (id) ON DELETE CASCADE,
                UNIQUE(user_id, product_id)
            )
        ''')
        
        # 4. Tabla de órdenes
        print("📝 Creando tabla 'orders'...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                order_number TEXT UNIQUE NOT NULL,
                payment_method TEXT NOT NULL,
                payment_status TEXT DEFAULT 'pending',
                total_amount REAL NOT NULL,
                stripe_payment_intent_id TEXT,
                stripe_session_id TEXT,
                customer_name TEXT NOT NULL,
                customer_phone TEXT NOT NULL,
                customer_email TEXT,
                delivery_address TEXT,
                order_notes TEXT,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
            )
        ''')
        
        # 5. Tabla de items de órdenes
        print("📝 Creando tabla 'order_items'...")
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                unit_price REAL NOT NULL,
                total_price REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES productos (id) ON DELETE CASCADE
            )
        ''')
        
        # 6. Índices para mejorar rendimiento
        print("📝 Creando índices...")
        
        # Índices para cart_items
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart_items(product_id)')
        
        # Índices para orders
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)')
        
        # Índices para order_items
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)')
        
        # Índices para productos
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_productos_category ON productos(category)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_productos_brand ON productos(brand)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_productos_supplier ON productos(supplier)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_productos_is_active ON productos(is_active)')
        
        # Confirmar cambios
        conn.commit()
        
        # Verificar tablas creadas
        print("\n✅ Verificando tablas creadas:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        expected_tables = ['users', 'productos', 'cart_items', 'orders', 'order_items']
        for table_name in expected_tables:
            if any(table[0] == table_name for table in tables):
                print(f"   ✓ {table_name}")
            else:
                print(f"   ✗ {table_name} - NO ENCONTRADA")
        
        # Mostrar todas las tablas
        print(f"\n📊 Tablas totales en la base de datos: {len(tables)}")
        for table in tables:
            print(f"   - {table[0]}")
        
        print(f"\n🎉 Base de datos inicializada correctamente!")
        print(f"📍 Ubicación: {db_path}")
        
    except Exception as e:
        print(f"❌ Error al crear la base de datos: {e}")
        return False
    
    finally:
        conn.close()
    
    return True

def create_sample_user():
    """Crear un usuario de prueba"""
    try:
        import bcrypt
        
        db_path = os.path.join(os.path.dirname(__file__), 'db.sqlite3')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Verificar si ya existe un usuario
        cursor.execute('SELECT COUNT(*) FROM users')
        user_count = cursor.fetchone()[0]
        
        if user_count == 0:
            print("👤 Creando usuario de prueba...")
            
            # Crear usuario de prueba
            password = "admin123"
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name, phone, address)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                'admin',
                'admin@example.com',
                password_hash.decode('utf-8'),
                'Administrador',
                '555-0123',
                'Dirección de ejemplo'
            ))
            
            conn.commit()
            print("✅ Usuario de prueba creado:")
            print("   Username: admin")
            print("   Password: admin123")
            print("   Email: admin@example.com")
        else:
            print(f"👤 Ya existen {user_count} usuarios en la base de datos")
        
        conn.close()
        
    except ImportError:
        print("⚠️  bcrypt no disponible, saltando creación de usuario de prueba")
    except Exception as e:
        print(f"❌ Error al crear usuario de prueba: {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando configuración de base de datos para PythonAnywhere...")
    print("=" * 60)
    
    # Crear base de datos y tablas
    if create_database():
        # Crear usuario de prueba
        create_sample_user()
        
        print("\n" + "=" * 60)
        print("✅ CONFIGURACIÓN COMPLETADA")
        print("\n📋 PRÓXIMOS PASOS:")
        print("1. Sube este archivo a tu servidor PythonAnywhere")
        print("2. En la consola de PythonAnywhere ejecuta:")
        print("   cd ~/tienda-abarrotes-react")
        print("   python3 init_pythonanywhere_db.py")
        print("3. Configura las variables de entorno en .env")
        print("4. Reinicia tu aplicación web")
        
    else:
        print("❌ Error en la configuración")
        sys.exit(1)

if __name__ == '__main__':
    main()