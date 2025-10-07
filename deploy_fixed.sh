#!/bin/bash

# 🚀 Script de Deploy Automático para PythonAnywhere - Resuelve Conflictos
# ========================================================================

echo "🚀 Iniciando deploy con resolución de conflictos..."

# Función para verificar si un comando fue exitoso
check_success() {
    if [ $? -ne 0 ]; then
        echo "❌ Error: $1"
        exit 1
    fi
}

echo "💾 Haciendo backup de archivos importantes..."
# Backup de la base de datos si existe
if [ -f "db-microservice/db.sqlite3" ]; then
    cp db-microservice/db.sqlite3 db-microservice/db.sqlite3.backup
    echo "   ✅ Backup de base de datos creado"
fi

echo "🧹 Limpiando archivos que causan conflictos..."
# Eliminar archivos que pueden causar conflictos
rm -rf build/ 2>/dev/null
rm -f db.sqlite3 2>/dev/null
rm -f db-microservice/app.py 2>/dev/null

echo "💾 Guardando cambios locales temporalmente..."
git add . 2>/dev/null
git stash push -m "Backup antes de deploy $(date)" 2>/dev/null || echo "   ℹ️  No hay cambios locales para guardar"

echo "📥 Actualizando desde GitHub..."
git fetch origin main
check_success "No se pudo hacer fetch del repositorio"

# Forzar actualización desde GitHub
git reset --hard origin/main
check_success "No se pudo actualizar desde GitHub"

echo "🔧 Configurando archivos para PythonAnywhere..."
# Usar el archivo específico de PythonAnywhere
if [ -f "db-microservice/app_pythonanywhere.py" ]; then
    cp db-microservice/app_pythonanywhere.py db-microservice/app.py
    echo "   ✅ Archivo app.py configurado para PythonAnywhere"
else
    echo "   ⚠️  app_pythonanywhere.py no encontrado"
fi

echo "🔨 Creando build de producción..."
npm run build
check_success "No se pudo crear el build de producción"

echo "📦 Instalando dependencias de Python..."
pip3.10 install --user -r db-microservice/requirements.txt
check_success "No se pudieron instalar las dependencias"

echo "🗃️ Configurando base de datos..."
cd db-microservice

# Usar backup si la nueva BD está vacía
if [ -f "db.sqlite3.backup" ]; then
    NEW_SIZE=$(stat -f%z "db.sqlite3" 2>/dev/null || stat -c%s "db.sqlite3" 2>/dev/null || echo "0")
    BACKUP_SIZE=$(stat -f%z "db.sqlite3.backup" 2>/dev/null || stat -c%s "db.sqlite3.backup" 2>/dev/null || echo "0")
    
    if [ "$BACKUP_SIZE" -gt "$NEW_SIZE" ]; then
        echo "   🔄 Restaurando base de datos desde backup..."
        cp db.sqlite3.backup db.sqlite3
    fi
fi

# Inicializar/actualizar base de datos
python3.10 init_complete_db.py
check_success "No se pudo inicializar la base de datos"
cd ..

echo "📁 Configurando archivos estáticos..."
if [ -d "build" ] && [ ! -d "static" ]; then
    mkdir -p static
    cp -r build/* static/
    echo "   ✅ Archivos estáticos copiados"
fi

echo "🔄 Reiniciando aplicación web..."
# Tocar el archivo WSGI para reiniciar
touch /var/www/*_pythonanywhere_com_wsgi.py 2>/dev/null || echo "   ⚠️  Reinicia manualmente desde el dashboard"

echo ""
echo "✅ ¡DEPLOY COMPLETADO EXITOSAMENTE!"
echo ""
echo "📊 Estadísticas del deploy:"
if [ -f "db-microservice/db.sqlite3" ]; then
    cd db-microservice
    PRODUCTS=$(python3.10 -c "import sqlite3; conn = sqlite3.connect('db.sqlite3'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM products'); print(cursor.fetchone()[0]); conn.close()" 2>/dev/null || echo "Error")
    USERS=$(python3.10 -c "import sqlite3; conn = sqlite3.connect('db.sqlite3'); cursor = conn.cursor(); cursor.execute('SELECT COUNT(*) FROM users'); print(cursor.fetchone()[0]); conn.close()" 2>/dev/null || echo "Error")
    echo "   🗃️ Base de datos: $PRODUCTS productos, $USERS usuarios"
    cd ..
fi
echo "   📦 Build: $([ -d "build" ] && echo "✅ Generado" || echo "❌ Error")"
echo ""
echo "🔗 Tu aplicación está disponible en:"
echo "   https://$(whoami).pythonanywhere.com"
echo ""
echo "🎉 ¡Tu tienda de abarrotes está lista!"