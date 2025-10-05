#!/bin/bash
# Script de deploy automático para PythonAnywhere

echo "🚀 Iniciando deploy automático..."

# Paso 1: Actualizar código desde Git
echo "📥 Actualizando desde GitHub..."
git pull origin main

# Paso 2: Crear build del frontend
echo "🔨 Creando build de producción..."
npm run build

# Paso 3: Reemplazar app.py con la versión completa
echo "🔄 Actualizando aplicación..."
cp db-microservice/app_full.py db-microservice/app.py

# Paso 4: Asegurar que la base de datos esté actualizada
echo "🗄️ Verificando base de datos..."
cd db-microservice
python3.10 update_products.py

echo "✅ Deploy completado!"
echo "🌐 Tu aplicación está disponible en: https://exael.pythonanywhere.com"
echo "📊 API: https://exael.pythonanywhere.com/api/products"