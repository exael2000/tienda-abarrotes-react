@echo off
REM Script de ejecución para la Tienda de Abarrotes en Windows
REM Ejecuta: double-click en este archivo o: levantar_tienda.bat

echo.
echo ====================================================
echo     TIENDA DE ABARROTES - INICIO LOCAL
echo ====================================================
echo.

REM Verificar que estamos en la carpeta correcta
if not exist "package.json" (
    echo [ERROR] No se encontró package.json
    echo [ERROR] Ejecuta este script desde la carpeta raíz del proyecto
    pause
    exit /b 1
)

REM Verificar si es la primera ejecución
if not exist "build" (
    echo [INFO] Primera ejecución detectada
    echo [INFO] Compilando React...
    call npm run build
    if errorlevel 1 (
        echo [ERROR] Error al compilar React
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Verificando dependencias Python...
if not exist ".venv" (
    echo [INFO] Virtual environment no encontrado
    echo [INFO] Creando virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

echo.
echo [INFO] Iniciando servidor Flask...
echo [INFO] Accede a: http://localhost:5000
echo [INFO] Presiona Ctrl+C para detener
echo.

python app_pythonanywhere.py

pause
