# Modelos de base de datos
import sqlite3
from datetime import datetime

def create_orders_table(db_path='db.sqlite3'):
    """Crear tabla de órdenes si no existe"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Tabla de órdenes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_number TEXT UNIQUE NOT NULL,
            payment_method TEXT NOT NULL, -- 'cash', 'card', 'transfer'
            payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
            total_amount REAL NOT NULL,
            stripe_payment_intent_id TEXT, -- Para pagos con tarjeta
            customer_name TEXT NOT NULL,
            customer_phone TEXT NOT NULL,
            customer_email TEXT,
            delivery_address TEXT,
            order_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Tabla de items de órdenes
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            unit_price REAL NOT NULL,
            total_price REAL NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Tablas de órdenes creadas exitosamente")

def generate_order_number():
    """Generar número único de orden"""
    import time
    timestamp = int(time.time())
    return f"ORD-{timestamp}"

if __name__ == "__main__":
    create_orders_table()
