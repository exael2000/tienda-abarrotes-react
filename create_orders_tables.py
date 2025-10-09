import sys
sys.path.append('db-microservice')
from models import create_orders_table

# Crear las tablas de órdenes
create_orders_table('db.sqlite3')

# Verificar que se crearon
import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tablas después de crear orders:", [t[0] for t in tables])

# Verificar estructura de orders
cursor.execute("PRAGMA table_info(orders)")
columns = cursor.fetchall()
print("Columnas de orders:", [col[1] for col in columns])

# Verificar estructura de order_items
cursor.execute("PRAGMA table_info(order_items)")
items_columns = cursor.fetchall()
print("Columnas de order_items:", [col[1] for col in items_columns])

conn.close()