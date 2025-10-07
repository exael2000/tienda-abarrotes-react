#!/bin/bash
# Script de deploy automático para PythonAnywhere

echo "🚀 Iniciando deploy automático..."

# Paso 1: Actualizar código desde Git
echo "📥 Actualizando desde GitHub..."
git pull origin main

# Paso 2: Crear build del frontend
echo "🔨 Creando build de producción..."
npm run build

# Paso 3: Reemplazar app.py con la versión de PythonAnywhere
echo "🔄 Actualizando aplicación..."
cp app_pythonanywhere.py db-microservice/app.py

# Paso 4: Inicializar base de datos completa
echo "🗄️ Inicializando base de datos completa..."
cd db-microservice
python3.10 init_complete_db.py
cd ..

echo "✅ Deploy completado!"
echo "🌐 Tu aplicación está disponible en: https://exael.pythonanywhere.com"
echo "📊 API: https://exael.pythonanywhere.com/api/products"
echo "� Base de datos: 34 productos de 5 proveedores"
echo "�👤 Usuario de prueba: exael / exael"