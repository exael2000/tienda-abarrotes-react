import sqlite3
import bcrypt

# Conectar a la base de datos
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# Obtener el usuario exael
cursor.execute('SELECT username, password_hash FROM users WHERE username = ?', ('exael',))
user = cursor.fetchone()

if user:
    username, stored_hash = user
    test_password = 'exael'
    
    print(f"Usuario encontrado: {username}")
    print(f"Hash almacenado: {stored_hash}")
    print(f"Contraseña a probar: {test_password}")
    
    # Probar la verificación de contraseña
    try:
        # Convertir el hash a bytes si es necesario
        if isinstance(stored_hash, str):
            stored_hash = stored_hash.encode('utf-8')
        
        # Verificar la contraseña
        is_valid = bcrypt.checkpw(test_password.encode('utf-8'), stored_hash)
        print(f"¿Contraseña válida? {is_valid}")
        
        # También probar con el hash directo
        test_hash = bcrypt.hashpw(test_password.encode('utf-8'), bcrypt.gensalt())
        print(f"Nuevo hash de prueba: {test_hash}")
        
    except Exception as e:
        print(f"Error al verificar contraseña: {e}")
else:
    print("Usuario no encontrado")

conn.close()