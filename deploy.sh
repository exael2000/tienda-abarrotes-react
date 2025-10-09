#!/bin/bash
# Script de deploy automático para PythonAnywhere

echo "🚀 Iniciando deploy automático..."

# Paso 1: Hacer backup de la base de datos actual
echo "📦 Creando backup de la base de datos actual..."
if [ -f "db.sqlite3" ]; then
    cp db.sqlite3 db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup creado"
fi

# Paso 2: Stash cambios locales si existen
echo "📂 Guardando cambios locales temporalmente..."
git stash

# Paso 3: Actualizar código desde Git
echo "📥 Actualizando desde GitHub..."
git pull origin main

# Paso 4: Verificar archivo .env
echo "🔐 Verificando configuración de variables de entorno..."
if [ ! -f ".env" ]; then
    echo "⚠️  Archivo .env no encontrado. Creando template..."
    echo "STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI" > .env
    echo "STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI" >> .env
    echo "FLASK_ENV=production" >> .env
    echo "SECRET_KEY=tu_super_secret_key_para_jwt_sessions" >> .env
    echo "DATABASE_URL=sqlite:///db.sqlite3" >> .env
    echo "❗ IMPORTANTE: Edita el archivo .env con tus claves reales de Stripe"
    echo "❗ nano .env"
else
    echo "✅ Archivo .env encontrado"
fi

# Paso 5: Instalar dependencias necesarias
echo "📦 Instalando dependencias..."
pip3.10 install --user python-dotenv

# Paso 6: Crear build del frontend
echo "🔨 Creando build de producción..."
npm run build

# Paso 7: Reemplazar app.py con la versión de PythonAnywhere
echo "🔄 Actualizando aplicación..."
cp app_pythonanywhere.py db-microservice/app.py

# Paso 8: Inicializar base de datos completa (con tablas de Stripe)
echo "🗄️ Inicializando base de datos completa..."
cd db-microservice
python3.10 init_complete_db.py
cd ..

echo "✅ Deploy completado!"
echo "🌐 Tu aplicación está disponible en: https://exael.pythonanywhere.com"
echo "📊 API: https://exael.pythonanywhere.com/api/products"
echo "� Base de datos: 34 productos de 5 proveedores"
echo "�👤 Usuario de prueba: exael / exael"