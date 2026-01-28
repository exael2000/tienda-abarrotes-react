import os

# Mostrar información de rutas
print("=" * 60)
print("DIAGNÓSTICO DE RUTAS")
print("=" * 60)

# Directorio actual
print(f"\nDirectorio actual: {os.getcwd()}")

# Directorio del script
script_dir = os.path.dirname(os.path.abspath(__file__))
print(f"Directorio del script: {script_dir}")

# Ruta build
build_dir = os.path.join(script_dir, 'build')
print(f"\nRuta build: {build_dir}")
print(f"¿Existe build/? {os.path.exists(build_dir)}")

# Ruta index.html
index_path = os.path.join(build_dir, 'index.html')
print(f"\nRuta index.html: {index_path}")
print(f"¿Existe index.html? {os.path.exists(index_path)}")

if os.path.exists(index_path):
    size = os.path.getsize(index_path)
    print(f"Tamaño de index.html: {size} bytes")

# Listar archivos en build/
print(f"\nArchivos en build/:")
if os.path.exists(build_dir):
    for item in os.listdir(build_dir)[:10]:  # Primeros 10
        item_path = os.path.join(build_dir, item)
        if os.path.isdir(item_path):
            print(f"  📁 {item}/")
        else:
            print(f"  📄 {item}")

print("\n" + "=" * 60)
