#!/usr/bin/env python3
"""
🚀 Script de Despliegue Automatizado para PythonAnywhere
============================================================

Este script te ayuda a preparar todos los archivos necesarios para 
desplegar la aplicación en PythonAnywhere.

Uso: python deploy_to_pythonanywhere.py
"""

import os
import shutil
import zipfile
from pathlib import Path

def create_deployment_package():
    """Crear paquete de archivos listos para PythonAnywhere"""
    
    print("🚀 Iniciando preparación para despliegue en PythonAnywhere...")
    
    # Crear directorio de despliegue
    deploy_dir = Path("deployment_package")
    if deploy_dir.exists():
        shutil.rmtree(deploy_dir)
    deploy_dir.mkdir()
    
    # Archivos necesarios del backend
    backend_files = [
        "db-microservice/app_pythonanywhere.py",
        "db-microservice/wsgi.py", 
        "db-microservice/requirements.txt",
        "db-microservice/init_complete_db.py",
        "db-microservice/models.py",
        "db-microservice/db.sqlite3"
    ]
    
    print("📁 Copiando archivos del backend...")
    for file_path in backend_files:
        source = Path(file_path)
        if source.exists():
            dest = deploy_dir / source.name
            shutil.copy2(source, dest)
            print(f"   ✅ {source.name}")
        else:
            print(f"   ❌ {source.name} - No encontrado")
    
    # Crear build del frontend si existe
    frontend_build = Path("build")
    if frontend_build.exists():
        print("📁 Copiando build del frontend...")
        shutil.copytree(frontend_build, deploy_dir / "static")
        print("   ✅ Frontend build copiado a /static")
    else:
        print("   ⚠️  No se encontró build del frontend. Ejecutar 'npm run build' primero.")
    
    # Crear archivo README para el despliegue
    readme_content = """
🚀 INSTRUCCIONES DE DESPLIEGUE EN PYTHONANYWHERE
================================================

1. SUBE ESTOS ARCHIVOS A TU CUENTA:
   - app_pythonanywhere.py → /home/tuusuario/mysite/
   - wsgi.py → /home/tuusuario/mysite/
   - requirements.txt → /home/tuusuario/mysite/
   - init_complete_db.py → /home/tuusuario/mysite/
   - models.py → /home/tuusuario/mysite/
   - db.sqlite3 → /home/tuusuario/mysite/
   - static/ → /home/tuusuario/mysite/static/ (todo el contenido)

2. EJECUTA EN LA CONSOLA DE PYTHONANYWHERE:
   cd /home/tuusuario/mysite
   pip3.10 install --user -r requirements.txt
   python3.10 init_complete_db.py

3. CONFIGURA LA WEB APP:
   - Source code: /home/tuusuario/mysite
   - Working directory: /home/tuusuario/mysite
   - WSGI configuration file: /var/www/tuusuario_pythonanywhere_com_wsgi.py
   - Edita el WSGI y asegúrate que importe desde app_pythonanywhere

4. CONFIGURA ARCHIVOS ESTÁTICOS:
   - URL: /static/
   - Directory: /home/tuusuario/mysite/static

5. REINICIA LA WEB APP

✅ LISTO! Tu aplicación debería estar funcionando en:
   https://tuusuario.pythonanywhere.com
"""
    
    with open(deploy_dir / "DEPLOY_INSTRUCTIONS.txt", "w", encoding="utf-8") as f:
        f.write(readme_content)
    
    # Crear archivo ZIP para fácil subida
    print("📦 Creando archivo ZIP...")
    with zipfile.ZipFile("tienda_abarrotes_deploy.zip", "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_path in deploy_dir.rglob("*"):
            if file_path.is_file():
                arcname = file_path.relative_to(deploy_dir)
                zipf.write(file_path, arcname)
                
    print(f"""
✅ PAQUETE DE DESPLIEGUE CREADO EXITOSAMENTE!

📁 Archivos preparados en: {deploy_dir.absolute()}
📦 Archivo ZIP creado: tienda_abarrotes_deploy.zip

🔗 PRÓXIMOS PASOS:
1. Sube el archivo ZIP a PythonAnywhere
2. Extrae los archivos en /home/tuusuario/mysite/
3. Sigue las instrucciones en DEPLOY_INSTRUCTIONS.txt

🌐 Una vez desplegado, la aplicación estará disponible en:
   https://tuusuario.pythonanywhere.com
""")

if __name__ == "__main__":
    create_deployment_package()