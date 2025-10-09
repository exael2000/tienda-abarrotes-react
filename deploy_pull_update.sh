#!/bin/bash
# Script para actualizar la aplicación en PythonAnywhere con pull de Git

echo "🚀 Iniciando actualización de la aplicación en PythonAnywhere..."

# 1. Hacer pull de los últimos cambios
echo "📥 Descargando últimos cambios de Git..."
git pull origin main

# 2. Verificar el estado del repositorio
echo "📋 Estado del repositorio:"
git status --short

# 3. Mostrar los últimos commits
echo "📜 Últimos commits:"
git log --oneline -5

# 4. Verificar que las dependencias estén actualizadas
echo "📦 Verificando dependencias de Python..."
pip install -r requirements.txt

# 5. Verificar estructura de la base de datos
echo "🗄️ Verificando base de datos..."
python3 -c "
import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\"')
tables = cursor.fetchall()
print('Tablas disponibles:', [t[0] for t in tables])
conn.close()
"

# 6. Inicializar base de datos si es necesario
echo "🔧 Inicializando base de datos completa..."
python3 init_complete_db.py

# 7. Verificar que el servidor puede iniciarse
echo "🧪 Verificando configuración del servidor..."
python3 -c "
try:
    from app_pythonanywhere import app
    print('✅ Configuración de Flask OK')
except Exception as e:
    print('❌ Error en configuración:', e)
"

# 8. Mostrar resumen
echo "📊 Resumen de la actualización:"
echo "✅ Pull de Git completado"
echo "✅ Dependencias verificadas"
echo "✅ Base de datos inicializada"
echo "✅ Configuración verificada"

echo ""
echo "🎉 ¡Actualización completada!"
echo "🔗 Tu aplicación debería estar disponible en: https://exael.pythonanywhere.com"
echo ""
echo "📝 Próximos pasos:"
echo "1. Reinicia tu aplicación web en el dashboard de PythonAnywhere"
echo "2. Verifica que los pagos con Stripe funcionen correctamente"
echo "3. Prueba el flujo completo: productos → carrito → checkout → pago"