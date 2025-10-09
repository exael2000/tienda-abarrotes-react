import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Verificar tablas existentes
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
tables = cursor.fetchall()
print("Tablas existentes:", [t[0] for t in tables])

# Verificar si existe la tabla orders
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'")
orders_table = cursor.fetchone()
print("Tabla orders existe:", orders_table is not None)

if orders_table:
    # Si existe, verificar estructura
    cursor.execute("PRAGMA table_info(orders)")
    columns = cursor.fetchall()
    print("Columnas de orders:", [col[1] for col in columns])
else:
    print("❌ La tabla orders NO existe - este es el problema!")

conn.close()