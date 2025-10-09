#!/bin/bash
# Script para resolver conflicto de git y actualizar aplicación en PythonAnywhere

echo "🔧 Resolviendo conflicto de Git en PythonAnywhere..."
echo "=" * 50

# 1. Hacer backup de la base de datos actual
echo "📦 Creando backup de la base de datos..."
cp db.sqlite3 db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup creado"

# 2. Stash los cambios locales
echo "📂 Guardando cambios locales temporalmente..."
git stash

# 3. Hacer pull de los cambios
echo "🔄 Actualizando código desde Git..."
git pull origin main

# 4. Ejecutar script de inicialización de base de datos
echo "🗄️ Inicializando base de datos con nuevas tablas..."
python3 init_pythonanywhere_db.py

# 5. Verificar estructura de la base de datos
echo "🔍 Verificando estructura de la base de datos..."
sqlite3 db.sqlite3 ".tables"

echo ""
echo "✅ ACTUALIZACIÓN COMPLETADA"
echo "📋 PRÓXIMOS PASOS:"
echo "1. Configurar archivo .env con tus claves de Stripe"
echo "2. Instalar python-dotenv: pip3.10 install --user python-dotenv"
echo "3. Reiniciar aplicación web en dashboard de PythonAnywhere"
echo ""
echo "📁 Backup de base de datos guardado como: db.sqlite3.backup.*"