#!/usr/bin/env python3
"""
Script para inicializar la tabla de usuarios y crear el usuario inicial 'exael'
"""

import sqlite3
import bcrypt
from datetime import datetime

def init_users_table():
    """Crear tabla de usuarios y usuario inicial"""
    
    conn = sqlite3.connect('db.sqlite3')
    cursor = conn.cursor()
    
    # Crear tabla de usuarios
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE
        )
    ''')
    
    # Verificar si ya existe el usuario 'exael'
    existing_user = cursor.execute(
        'SELECT id FROM users WHERE username = ?', 
        ('exael',)
    ).fetchone()
    
    if not existing_user:
        # Crear hash del password 'exael'
        password = 'exael'
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Insertar usuario inicial
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (?, ?, ?, ?, ?)
        ''', ('exael', 'exael@tienda.com', password_hash, 'Exael', 'Admin'))
        
        print("✅ Usuario 'exael' creado exitosamente")
        print("   Username: exael")
        print("   Password: exael")
        print("   Email: exael@tienda.com")
    else:
        print("ℹ️  Usuario 'exael' ya existe en la base de datos")
    
    # Crear tabla de sesiones para tokens
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_jti TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Crear tabla de carritos para persistir items por usuario
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cart_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES productos (id),
            UNIQUE(user_id, product_id)
        )
    ''')
    
    conn.commit()
    conn.close()
    
    print("✅ Tabla de usuarios inicializada correctamente")
    print("✅ Tabla de sesiones creada")
    print("✅ Tabla de carritos creada")

if __name__ == '__main__':
    init_users_table()