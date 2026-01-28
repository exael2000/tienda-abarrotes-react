#!/usr/bin/env python3
import os

# Mostrar información de rutas
print("=" * 60)
print("DIAGNÓSTICO DE ARCHIVOS PARA FLASK")
print("=" * 60)

# Obtener directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"\nDirectorio del script: {script_dir}")

# Rutas de build
build_dir = os.path.join(script_dir, 'build')
print(f"Ruta build: {build_dir}")
print(f"¿Existe build/? {os.path.exists(build_dir)}")

# Rutas específicas
index_html = os.path.join(build_dir, 'index.html')
print(f"\nindex.html: {index_html}")
print(f"¿Existe? {os.path.exists(index_html)}")
if os.path.exists(index_html):
    size = os.path.getsize(index_html)
    print(f"Tamaño: {size} bytes")

# Verificar static
static_dir = os.path.join(build_dir, 'static')
print(f"\nstatic/: {static_dir}")
print(f"¿Existe? {os.path.exists(static_dir)}")
if os.path.exists(static_dir):
    items = os.listdir(static_dir)
    print(f"Contenido: {items}")

# Verificar images
images_dir = os.path.join(build_dir, 'images')
print(f"\nimages/: {images_dir}")
print(f"¿Existe? {os.path.exists(images_dir)}")
if os.path.exists(images_dir):
    files = os.listdir(images_dir)
    print(f"Archivos: {len(files)} archivos")

print("\n" + "=" * 60)
