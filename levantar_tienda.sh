#!/bin/bash
# Script de ejecución para la Tienda de Abarrotes en Mac/Linux
# Uso: chmod +x levantar_tienda.sh && ./levantar_tienda.sh

set -e  # Salir en caso de error

echo ""
echo "===================================================="
echo "     TIENDA DE ABARROTES - INICIO LOCAL"
echo "===================================================="
echo ""

# Verificar que estamos en la carpeta correcta
if [ ! -f "package.json" ]; then
    echo "[ERROR] No se encontró package.json"
    echo "[ERROR] Ejecuta este script desde la carpeta raíz del proyecto"
    exit 1
fi

# Verificar si es la primera ejecución
if [ ! -d "build" ]; then
    echo "[INFO] Primera ejecución detectada"
    echo "[INFO] Compilando React..."
    npm run build
fi

echo ""
echo "[INFO] Verificando dependencias Python..."
if [ ! -d ".venv" ]; then
    echo "[INFO] Virtual environment no encontrado"
    echo "[INFO] Creando virtual environment..."
    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
else
    source .venv/bin/activate
fi

echo ""
echo "[INFO] Iniciando servidor Flask..."
echo "[INFO] Accede a: http://localhost:5000"
echo "[INFO] Presiona Ctrl+C para detener"
echo ""

python app_pythonanywhere.py
