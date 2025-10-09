#!/bin/bash

# 🚀 Script de Deploy Mejorado para PythonAnywhere
# =================================================
# Arregla duplicados, conflictos y errores ocasionales

echo "🚀 Iniciando deploy mejorado para PythonAnywhere..."

# Función para verificar éxito de comandos
check_success() {
    if [ $? -ne 0 ]; then
        echo "❌ Error: $1"
        exit 1
    fi
}

# Función para limpiar archivos problemáticos
cleanup_files() {
    echo "🧹 Limpiando archivos problemáticos..."
    
    # Limpiar cache de Python
    find . -name "*.pyc" -delete 2>/dev/null
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
    
    # Limpiar builds anteriores
    rm -rf build/ 2>/dev/null
    rm -rf node_modules/.cache/ 2>/dev/null
    
    echo "   ✅ Archivos problemáticos limpiados"
}

# Función para hacer backup de datos importantes
backup_data() {
    echo "💾 Creando backup de datos importantes..."
    
    if [ -f "db.sqlite3" ]; then
        cp db.sqlite3 db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
        echo "   ✅ Backup de base de datos principal creado"
    fi
    
    if [ -f "db-microservice/db.sqlite3" ]; then
        cp db-microservice/db.sqlite3 db-microservice/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
        echo "   ✅ Backup de base de datos microservicio creado"
    fi
}

# 1. LIMPIEZA INICIAL
cleanup_files
backup_data

# 2. ACTUALIZACIÓN DE CÓDIGO
echo "📥 Actualizando código desde GitHub..."

# Guardar cambios locales si existen
git add . 2>/dev/null
git stash push -m "Deploy backup $(date)" 2>/dev/null || echo "   ℹ️  No hay cambios locales"

# Forzar actualización limpia
git fetch origin main
git reset --hard origin/main
check_success "No se pudo actualizar desde GitHub"

echo "   ✅ Código actualizado desde GitHub"

# 3. INSTALACIÓN DE DEPENDENCIAS
echo "📦 Instalando dependencias..."

# Dependencias de Node.js
npm ci --production=false
check_success "No se pudieron instalar las dependencias de Node.js"

# Dependencias de Python
pip3.10 install --user stripe python-dotenv flask flask-cors flask-jwt-extended bcrypt requests
check_success "No se pudieron instalar las dependencias de Python"

echo "   ✅ Dependencias instaladas"

# 4. BUILD DEL FRONTEND
echo "🔨 Creando build optimizado del frontend..."

# Limpiar cache de React antes del build
npm run build --verbose
check_success "No se pudo crear el build del frontend"

echo "   ✅ Build del frontend completado"

# 5. CONFIGURACIÓN DE ARCHIVOS PARA PYTHONANYWHERE
echo "🔧 Configurando archivos para PythonAnywhere..."

# Asegurar que tenemos el archivo correcto en la raíz
if [ ! -f "app_pythonanywhere.py" ]; then
    echo "❌ Error: app_pythonanywhere.py no encontrado en raíz"
    exit 1
fi

# Copiar la aplicación principal
cp app_pythonanywhere.py app.py
echo "   ✅ Archivo app.py configurado"

# 6. CONFIGURACIÓN DE BASE DE DATOS
echo "🗃️ Configurando base de datos..."

# Verificar que existe el script de inicialización
if [ ! -f "init_complete_db.py" ]; then
    echo "❌ Error: init_complete_db.py no encontrado"
    exit 1
fi

# Inicializar base de datos
python3.10 init_complete_db.py
check_success "No se pudo inicializar la base de datos"

echo "   ✅ Base de datos configurada"

# 7. VERIFICACIONES FINALES
echo "🔍 Verificando configuración..."

# Verificar que el build existe
if [ ! -d "build" ] || [ ! -f "build/index.html" ]; then
    echo "❌ Error: Build del frontend no está completo"
    exit 1
fi

# Verificar que la base de datos existe
if [ ! -f "db.sqlite3" ]; then
    echo "❌ Error: Base de datos no existe"
    exit 1
fi

# Verificar que las tablas existen
TABLES_COUNT=$(sqlite3 db.sqlite3 ".tables" | wc -l)
if [ "$TABLES_COUNT" -lt 3 ]; then
    echo "❌ Error: Base de datos no tiene las tablas necesarias"
    exit 1
fi

echo "   ✅ Todas las verificaciones pasaron"

# 8. ESTADÍSTICAS DEL DEPLOY
echo ""
echo "📊 Estadísticas del deploy:"

# Contar productos y usuarios
PRODUCTS=$(sqlite3 db.sqlite3 "SELECT COUNT(*) FROM products;" 2>/dev/null || echo "0")
USERS=$(sqlite3 db.sqlite3 "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")

echo "   📦 Products: $PRODUCTS"
echo "   👥 Users: $USERS"
echo "   🏗️  Build: $([ -f "build/index.html" ] && echo "✅ OK" || echo "❌ Error")"
echo "   🗃️  Database: $([ -f "db.sqlite3" ] && echo "✅ OK" || echo "❌ Error")"

# Tamaño de archivos importantes
echo "   📏 Tamaños:"
echo "      - app.py: $([ -f "app.py" ] && stat -f%z "app.py" 2>/dev/null || stat -c%s "app.py" 2>/dev/null || echo "0") bytes"
echo "      - db.sqlite3: $([ -f "db.sqlite3" ] && stat -f%z "db.sqlite3" 2>/dev/null || stat -c%s "db.sqlite3" 2>/dev/null || echo "0") bytes"
echo "      - build/: $([ -d "build" ] && du -sh build | cut -f1 || echo "0") "

echo ""
echo "🎉 ¡DEPLOY COMPLETADO EXITOSAMENTE!"
echo ""
echo "🔗 Próximos pasos:"
echo "1. Ve al panel Web de PythonAnywhere"
echo "2. Haz clic en 'Reload $(whoami).pythonanywhere.com'"
echo "3. Configura las variables de entorno de Stripe en el WSGI"
echo "4. Tu aplicación estará disponible en: https://$(whoami).pythonanywhere.com"
echo ""
echo "💡 Tip: Si hay errores, revisa los logs en el panel Web"