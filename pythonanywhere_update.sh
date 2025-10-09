#!/bin/bash
# Script específico para PythonAnywhere - Actualizar aplicación con mejoras de Stripe

echo "🏃‍♂️ Ejecutando actualización en PythonAnywhere..."

# Cambiar al directorio correcto
cd ~/tienda-abarrotes-react || { echo "❌ Error: No se encontró el directorio del proyecto"; exit 1; }

# Hacer pull de los cambios
echo "📥 Descargando cambios desde GitHub..."
git pull origin main

# Verificar que el pull fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Pull completado exitosamente"
else
    echo "❌ Error al hacer pull. Verifica tu conexión y permisos."
    exit 1
fi

# Mostrar los archivos modificados
echo "📋 Archivos actualizados:"
git diff --name-only HEAD~1

# Inicializar base de datos con nuevas tablas de órdenes
echo "🗄️ Inicializando base de datos con tablas de órdenes..."
python3.10 init_complete_db.py

# Verificar que las tablas de órdenes existen
echo "🔍 Verificando tablas de órdenes..."
python3.10 -c "
import sqlite3
conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()
cursor.execute('SELECT name FROM sqlite_master WHERE type=\"table\" AND name IN (\"orders\", \"order_items\")')
order_tables = cursor.fetchall()
if len(order_tables) == 2:
    print('✅ Tablas de órdenes creadas correctamente')
    cursor.execute('SELECT COUNT(*) FROM orders')
    order_count = cursor.fetchone()[0]
    print(f'📊 Órdenes en base de datos: {order_count}')
else:
    print('⚠️ Faltan tablas de órdenes')
conn.close()
"

# Verificar configuración de Stripe
echo "💳 Verificando configuración de Stripe..."
python3.10 -c "
import os
from dotenv import load_dotenv
load_dotenv()
stripe_key = os.getenv('STRIPE_SECRET_KEY', 'not_found')
if stripe_key and stripe_key != 'not_found' and stripe_key.startswith('sk_'):
    print('✅ Stripe configurado correctamente')
else:
    print('⚠️ Verifica la configuración de Stripe en las variables de entorno')
"

# Verificar el archivo principal de la aplicación
echo "🔧 Verificando app_pythonanywhere.py..."
if [ -f "app_pythonanywhere.py" ]; then
    echo "✅ Archivo principal encontrado"
    # Verificar que el endpoint de verify-payment existe
    if grep -q "verify-payment" app_pythonanywhere.py; then
        echo "✅ Endpoint de verificación de pagos encontrado"
    else
        echo "⚠️ El endpoint de verificación de pagos no se encontró"
    fi
else
    echo "❌ Error: app_pythonanywhere.py no encontrado"
fi

echo ""
echo "🎊 ¡Actualización completada en PythonAnywhere!"
echo ""
echo "📝 IMPORTANTE - Próximos pasos manuales:"
echo "1. 🔄 Ve al dashboard de PythonAnywhere"
echo "2. 🔄 Reinicia tu aplicación web (botón 'Reload')"
echo "3. 🧪 Prueba la aplicación en: https://exael.pythonanywhere.com"
echo "4. 💳 Verifica que los pagos con Stripe funcionen"
echo ""
echo "🆕 Nuevas características disponibles:"
echo "✅ Creación automática de órdenes tras pago exitoso"
echo "✅ Páginas de checkout optimizadas"
echo "✅ Integración completa con Stripe Checkout"
echo "✅ Base de datos con historial de órdenes"