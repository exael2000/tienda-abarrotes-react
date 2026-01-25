import sqlite3

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Ver tablas
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print("Tablas en la BD:")
for table in tables:
    print(f"  - {table}")

# Ver esquema de users
print("\nEsquema de tabla 'users':")
cursor.execute("PRAGMA table_info(users);")
for row in cursor.fetchall():
    print(f"  {row[1]} ({row[2]})")

# Ver cantidad de usuarios
cursor.execute("SELECT COUNT(*) FROM users;")
user_count = cursor.fetchone()[0]
print(f"\nCantidad de usuarios: {user_count}")

# Ver cantidad de productos
cursor.execute("SELECT COUNT(*) FROM productos;")
product_count = cursor.fetchone()[0]
print(f"Cantidad de productos: {product_count}")

conn.close()
