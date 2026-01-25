# Configuración de Archivos Estáticos

## 📋 Resumen

El código ahora usa **rutas absolutas** para servir archivos estáticos, lo que garantiza que funcione tanto en **local** como en **PythonAnywhere**.

---

## ✅ En Local (Windows)

Cuando ejecutas `python app_pythonanywhere.py` en tu computadora:

```
http://localhost:5000          → Flask sirve build/index.html
http://localhost:5000/products → React maneja la ruta, Flask sirve build/index.html
http://localhost:5000/static/css/main.*.css  → Flask sirve build/static/css/main.*.css
http://localhost:5000/images/products/*.jpg  → Flask sirve build/images/products/*.jpg
```

**Cómo funciona:**
```python
build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')
# En Windows: C:\Users\Yoan David\mis-proyectos\tienda-abarrotes-react\build
```

✅ **Ventaja**: Todo funcionará en cualquier carpeta donde ejecutes el script

---

## 🚀 En PythonAnywhere

Cuando esté desplegado en producción:

### Opción A: Dejar que Flask sirva los estáticos (más simple)
- No necesita cambios adicionales
- El código ya soporta esto
- **Ruta en PythonAnywhere:**
```python
build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'build')
# En PythonAnywhere: /home/TUUSUARIO/tienda-abarrotes-react/build
```

### Opción B: Usar archivos estáticos del panel Web (más eficiente)
Si quieres que PythonAnywhere sirva los estáticos directamente (sin pasar por Flask):

1. En el panel de PythonAnywhere → Web → Static files:
   - URL: `/static/` → Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/static/`
   - URL: `/images/` → Directory: `/home/TUUSUARIO/tienda-abarrotes-react/build/images/`

2. En ese caso, el código Flask no será llamado para esos archivos (es más rápido)

---

## 🔒 Seguridad

Se añadió verificación de path traversal:
```python
if not os.path.abspath(requested_path).startswith(os.path.abspath(build_dir)):
    return {'error': 'Access denied'}, 403
```

Esto previene que alguien intente acceder a archivos fuera de `build/` usando rutas como:
- `http://localhost:5000/../../etc/passwd` ❌ Bloqueado

---

## 🔍 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `app_pythonanywhere.py` | Aplicación Flask con rutas |
| `build/` | Construcción React (JS, CSS, HTML) |
| `build/index.html` | Página principal (644 bytes) |
| `build/static/js/` | Bundles JavaScript (106.56 kB) |
| `build/static/css/` | Estilos CSS (13.67 kB) |
| `build/images/` | Imágenes de productos |

---

## ✔️ Verificación

Para confirmar que funciona:

1. **Local:**
   ```bash
   python app_pythonanywhere.py
   # Abre http://localhost:5000
   # Deberías ver la tienda con productos
   ```

2. **PythonAnywhere:**
   - Verifica que los archivos estén en `/home/TUUSUARIO/tienda-abarrotes-react/build/`
   - Carga la URL principal (ej: https://exael.pythonanywhere.com)
   - Verifica que no haya errores 404 en la consola del navegador

---

## 📝 Notas

- ✅ Rutas relativas: **NO se usan** (causaban problemas en Windows)
- ✅ `send_from_directory()`: Se usa para mayor seguridad y robustez
- ✅ React SPA routing: Cualquier ruta desconocida sirve `index.html` para que React maneje la navegación
- ✅ Cross-platform: Funciona en Windows, Linux y macOS
