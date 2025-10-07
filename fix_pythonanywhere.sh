#!/bin/bash
echo "Actualizando archivos en PythonAnywhere..."

# Subir cambios a GitHub primero
git add .
git commit -m "Fix API configuration for PythonAnywhere deployment"
git push

echo "=== Cambios subidos a GitHub ==="
echo ""
echo "Ahora ve a tu consola de PythonAnywhere y ejecuta:"
echo ""
echo "cd ~/tienda-abarrotes-react"
echo "git pull"
echo ""
echo "# Usar el archivo app_pythonanywhere.py en lugar de app.py"
echo "cd db-microservice"
echo "cp app_pythonanywhere.py app.py"
echo ""
echo "# Reconstruir frontend con las nuevas configuraciones"
echo "cd .."
echo "npm run build"
echo ""
echo "# Verificar que la API esté funcionando"
echo "curl https://TUUSUARIO.pythonanywhere.com/api/health"
echo ""
echo "# Reiniciar la aplicación web desde el dashboard de PythonAnywhere"
echo "# Ir a Web tab -> Reload"
echo ""
echo "=== IMPORTANTE ==="
echo "1. Reemplaza TUUSUARIO por tu nombre de usuario de PythonAnywhere"
echo "2. Asegúrate de reiniciar la app web desde el dashboard"
echo "3. El archivo app_pythonanywhere.py tiene mejor configuración de CORS"