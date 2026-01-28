# 🛡️ GUÍA DE PROTECCIÓN Y MANTENIMIENTO DE VS CODE

## 📊 Estado Actual del Sistema

**Fecha de análisis:** 25 de Enero de 2026

### Extensiones Instaladas

- **Total de extensiones:** 198 activas
- **Espacio ocupado:** 5.1 GB
- **Extensiones en el archivo:** 558 recomendaciones

### Espacio en Disco

- **Disco C:\ disponible:** 179.47 GB de 475.83 GB
- **Porcentaje usado:** 62.28%
- **Estado:** ✅ Saludable (suficiente espacio)

---

## ⚠️ PROBLEMA IDENTIFICADO

Es probable que ayer VS Code haya tenido problemas porque:

1. **Sobrecarga de extensiones** - 558 extensiones en recommendations es excesivo
2. **Actualizaciones automáticas** - VS Code pudo actualizarse y resetear configuraciones
3. **Conflictos de memoria** - Demasiadas extensiones corriendo simultáneamente
4. **Crash del sistema** - Windows pudo haber forzado el cierre de VS Code

---

## 🔧 SOLUCIONES IMPLEMENTADAS

### 1. Archivo `.vscode/settings.json` Creado

He creado una configuración protegida con:

✅ **Desactivación de actualizaciones automáticas de extensiones**

```json
"extensions.autoCheckUpdates": false,
"extensions.autoUpdate": false
```

✅ **Gestión de memoria mejorada**

```json
"extensions.experimental.affinity": {
  "ms-python.python": 1,
  "github.copilot": 2,
  "esbenp.prettier-vscode": 3
}
```

✅ **Prevención de pérdida de datos**

```json
"window.restoreWindows": "all",
"files.hotExit": "onExitAndWindowClose"
```

✅ **Optimización de watchers**

- Reduce la carga del sistema
- Excluye node_modules, .venv, build, etc.

---

## 📝 RECOMENDACIONES CRÍTICAS

### 🎯 Opción 1: Reducir Extensiones (RECOMENDADO)

Tu archivo `extensions.json` tiene **558 extensiones**, pero solo tienes **198 instaladas**.

**Acción sugerida:** Limpiar el archivo a solo las extensiones esenciales.

#### Extensiones Esenciales para tu Proyecto:

```
CORE (8):
- GitHub Copilot & Chat
- ESLint
- Prettier
- Error Lens
- IntelliCode
- Path Intellisense
- GitLens

REACT (10):
- ES7 React Snippets
- Simple React Snippets
- Tailwind CSS IntelliSense
- Tailwind Docs
- Headwind
- Styled Components
- Auto Rename/Close Tag
- Import Cost
- Jest
- Playwright

PYTHON/FLASK (6):
- Python
- Pylance
- Python Debugger
- Black Formatter
- Flask Snippets
- Jinja2 Snippets

DATABASE (4):
- SQLite
- SQLTools
- MySQL Client
- MongoDB

GIT (4):
- GitLens
- Git History
- Git Graph
- GitHub Pull Requests

UTILITIES (8):
- REST Client
- Thunder Client
- Live Server
- Todo Tree
- Better Comments
- Bookmarks
- Code Spell Checker (English + Spanish)
- Docker

TOTAL: ~40 extensiones esenciales
```

### 🎯 Opción 2: Gestión por Perfiles (VS Code 1.75+)

Crear perfiles separados:

1. **Perfil Frontend** - React, Tailwind, ESLint, Prettier
2. **Perfil Backend** - Python, Flask, Database
3. **Perfil Full Stack** - Todo combinado (usar solo cuando sea necesario)

**Cómo crear perfiles:**

```
1. Ctrl+Shift+P
2. Buscar "Profiles: Create Profile"
3. Seleccionar extensiones específicas
4. Cambiar entre perfiles según necesites
```

### 🎯 Opción 3: Deshabilitar Extensiones por Workspace

En lugar de desinstalar, deshabilita extensiones que no uses en este proyecto:

```
1. Clic derecho en la extensión
2. "Disable (Workspace)"
3. Solo afecta este proyecto
```

---

## 🚨 PREVENCIÓN DE PROBLEMAS FUTUROS

### 1. Backup Automático de Extensiones

Crea un script PowerShell para guardar tu lista:

```powershell
# Guardar en: backup-extensions.ps1
code --list-extensions > "$PSScriptRoot\.vscode\installed-extensions.txt"
Write-Host "✅ Backup de extensiones creado"
```

Ejecutar cada semana o antes de actualizaciones grandes.

### 2. Restaurar Extensiones

Si vuelve a pasar:

```powershell
# Restaurar desde backup
Get-Content .vscode\installed-extensions.txt | ForEach-Object {
    code --install-extension $_
}
```

### 3. Monitoreo de Rendimiento

**Verificar extensiones lentas:**

```
Ctrl+Shift+P → "Developer: Show Running Extensions"
```

**Desactivar extensiones problemáticas:**

- Revisa las que usan mucha CPU/memoria
- Desactívalas si no las usas frecuentemente

### 4. Limpieza Periódica

**Cada mes:**

```powershell
# Limpiar caché de VS Code
Remove-Item -Recurse -Force "$env:APPDATA\Code\Cache\*"
Remove-Item -Recurse -Force "$env:APPDATA\Code\CachedData\*"
```

### 5. Configuración de Windows

Asegúrate de que Windows no entre en modo de ahorro de energía mientras usas VS Code:

```
Panel de Control → Opciones de energía →
Cambiar la configuración del plan →
"Alto rendimiento" o "Equilibrado"
```

---

## 📋 CHECKLIST DE MANTENIMIENTO

### Diario:

- [ ] Cerrar VS Code correctamente (Archivo → Salir)
- [ ] No forzar el cierre con Alt+F4 o Task Manager

### Semanal:

- [ ] Revisar extensiones en "Running Extensions"
- [ ] Deshabilitar las que no uses
- [ ] Hacer backup de extensiones instaladas

### Mensual:

- [ ] Limpiar caché de VS Code
- [ ] Revisar espacio en disco C:\
- [ ] Actualizar solo extensiones críticas

### Antes de Actualizar VS Code:

- [ ] Exportar lista de extensiones
- [ ] Hacer backup de settings.json
- [ ] Cerrar otros programas pesados

---

## 🔍 DIAGNÓSTICO RÁPIDO

Si VS Code se comporta raro:

1. **Abrir en Modo Seguro:**

   ```
   code --disable-extensions
   ```

2. **Ver logs de errores:**

   ```
   Ayuda → Alternar herramientas de desarrollo
   → Consola
   ```

3. **Reiniciar extensiones:**

   ```
   Ctrl+Shift+P → "Developer: Reload Window"
   ```

4. **Reinstalar VS Code (último recurso):**
   - Desinstalar VS Code
   - NO borrar `%APPDATA%\Code` (conserva extensiones)
   - Reinstalar desde https://code.visualstudio.com/

---

## ✅ ESTADO ACTUAL PROTEGIDO

Con las configuraciones que acabo de crear:

✅ Actualizaciones automáticas desactivadas
✅ Gestión de memoria optimizada
✅ Prevención de pérdida de datos
✅ Watchers optimizados para mejor rendimiento
✅ Formateo y linting configurado correctamente

---

## 🎯 PRÓXIMOS PASOS RECOMENDADOS

1. **INMEDIATO:** Revisar si necesitas todas las 558 extensiones del archivo
   - Considera reducir a ~50-100 extensiones esenciales

2. **ESTA SEMANA:** Crear backup de extensiones instaladas

   ```powershell
   code --list-extensions > .vscode\installed-extensions.txt
   ```

3. **OPCIONAL:** Investigar perfiles de VS Code para organizar extensiones

4. **PREVENTIVO:** Configurar script de backup automático

---

## 📞 Si Vuelve a Pasar

1. **No entrar en pánico** - Tus configuraciones están guardadas
2. Restaurar desde `.vscode\installed-extensions.txt`
3. Verificar que `settings.json` y `extensions.json` estén intactos
4. Ejecutar en modo seguro primero para identificar extensión problemática

---

_Última actualización: 25/01/2026_
_Sistema protegido y optimizado ✅_
