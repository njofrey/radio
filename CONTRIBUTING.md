# 🤝 Guía de Contribución

## 🎯 Objetivo

Esta guía establece las buenas prácticas para colaborar en el proyecto **Radio Matías Batista** de manera eficiente y segura.

## 📋 Antes de Contribuir

### 1. Configuración Inicial

```bash
# Clonar repositorio
git clone [URL_DEL_REPO]
cd Radio

# Verificar que todo funciona
# Abrir index.html en navegador
# Verificar que el stream funciona
```

### 2. Entender el Proyecto

- **Propósito**: Radio web streaming 24/7
- **Audiencia**: Fans de música alternativa/rock
- **Tecnología**: Vanilla JS, CSS, HTML
- **Diseño**: Estilo "brutal" con tipografía Akira Expanded

## 🔄 Flujo de Trabajo

### Paso 1: Crear Branch

```bash
# Siempre desde main
git checkout main
git pull origin main

# Crear feature branch
git checkout -b feature/nombre-descriptivo
```

**Ejemplos de nombres de branch:**
- `feature/nuevo-control-volume`
- `fix/stream-timeout-error`
- `style/mejorar-responsive-mobile`
- `docs/actualizar-readme`

### Paso 2: Desarrollar

#### Estándares de Código

**HTML:**
```html
<!-- ✅ Correcto -->
<main class="main-content" role="main">
    <section class="console" role="region" aria-label="Controles">
        <button id="play-btn" aria-label="Reproducir radio">PLAY</button>
    </section>
</main>

<!-- ❌ Incorrecto -->
<div class="container">
    <div class="controls">
        <div id="btn">PLAY</div>
    </div>
</div>
```

**CSS:**
```css
/* ✅ Correcto */
:root {
    --primary-color: #000000;
    --accent-color: #FF0000;
}

.main-button {
    background-color: var(--primary-color);
    color: var(--accent-color);
}

/* ❌ Incorrecto */
.button {
    background: black;
    color: red;
}
```

**JavaScript:**
```javascript
// ✅ Correcto
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Validación de elementos
const audioPlayer = document.getElementById('audio-player');
if (!audioPlayer) {
    console.error('SECURITY: Audio player not found');
    return;
}

// ❌ Incorrecto
function updateText(text) {
    element.innerHTML = text; // XSS vulnerable
}
```

### Paso 3: Commits Descriptivos

```bash
# ✅ Correcto
git commit -m "feat: añadir control de volumen con slider"
git commit -m "fix: resolver timeout en conexión del stream"
git commit -m "style: mejorar responsive en pantallas pequeñas"

# ❌ Incorrecto
git commit -m "cambios"
git commit -m "fix"
git commit -m "mejoras"
```

### Paso 4: Testing Local

#### Checklist Obligatorio

- [ ] **Funcionalidad**: Play/Pause funciona correctamente
- [ ] **Stream**: Se conecta al stream sin errores
- [ ] **Responsive**: Funciona en móvil (320px+) y desktop
- [ ] **Accesibilidad**: Navegación por teclado funciona
- [ ] **Performance**: No bloquea el render inicial
- [ ] **Console**: Sin errores en DevTools
- [ ] **Cross-browser**: Chrome, Firefox, Safari

#### Testing Manual

```bash
# Servidor local para testing
python -m http.server 8000
# Abrir http://localhost:8000

# Verificar en diferentes dispositivos
# - Desktop (1920x1080)
# - Tablet (768x1024)
# - Móvil (375x667)
```

### Paso 5: Pull Request

#### Template de PR

```markdown
## 📝 Descripción
Breve descripción de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Nueva funcionalidad
- [ ] Corrección de bug
- [ ] Mejora de estilo
- [ ] Documentación
- [ ] Refactorización

## 🧪 Testing
- [ ] Funciona en Chrome
- [ ] Funciona en Firefox
- [ ] Funciona en Safari
- [ ] Responsive en móvil
- [ ] Accesibilidad verificada
- [ ] Console sin errores

## 📸 Screenshots (si aplica)
[Adjuntar screenshots de cambios visuales]

## 🔍 Checklist
- [ ] Código sigue los estándares del proyecto
- [ ] Commits descriptivos y en inglés
- [ ] No regresiones en funcionalidad existente
- [ ] Performance mantenida
```

## 🚨 Reglas Importantes

### 1. Protección de Main Branch

- **Nunca** hacer push directo a `main`
- **Siempre** usar Pull Requests
- **Requerir** al menos 1 review antes de merge
- **Proteger** branch `main` en GitHub Settings

### 2. Seguridad

```javascript
// ✅ SIEMPRE sanitizar inputs
function updateDisplay(text) {
    const sanitized = sanitizeText(text);
    element.textContent = sanitized;
}

// ✅ Validar URLs externas
const ALLOWED_HOSTS = ['sonic.portalfoxmix.club'];
function validateUrl(url) {
    const urlObj = new URL(url);
    return ALLOWED_HOSTS.includes(urlObj.hostname);
}
```

### 3. Performance

```css
/* ✅ Usar font-display: swap */
@font-face {
    font-family: 'Akira Expanded';
    src: url('Fonts/Akira Expanded Demo.otf') format('opentype');
    font-display: swap;
}

/* ✅ Mobile-first */
@media (max-width: 768px) {
    .element {
        /* Estilos móvil */
    }
}
```

### 4. Accesibilidad

```html
<!-- ✅ Siempre incluir ARIA labels -->
<button id="play-btn" aria-label="Reproducir radio" type="button">
    PLAY
</button>

<!-- ✅ Roles semánticos -->
<main role="main">
    <section role="region" aria-label="Controles de radio">
```

## 🔧 Herramientas Recomendadas

### Desarrollo
- **VS Code** con extensiones:
  - Live Server
  - HTML CSS Support
  - JavaScript (ES6) code snippets
- **Chrome DevTools** para debugging
- **Lighthouse** para performance

### Testing
- **W3C Validator** para HTML
- **CSS Validator** para estilos
- **Lighthouse** para accessibility/performance
- **Screen Reader** (NVDA/VoiceOver) para accesibilidad

### Git
```bash
# Configurar alias útiles
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
```

## 🐛 Troubleshooting

### Problemas Comunes

#### Stream no funciona
```bash
# Verificar conectividad
curl -I https://sonic.portalfoxmix.club/8196/stream

# Revisar CORS en DevTools
# Network tab → verificar headers
```

#### CSS no se aplica
```bash
# Limpiar cache
Ctrl+Shift+R (Chrome)
# O
Cmd+Shift+R (Mac)

# Verificar rutas de archivos
# Revisar sintaxis CSS
```

#### JavaScript errors
```bash
# Abrir DevTools Console
# Verificar elementos DOM existen
# Revisar scope de variables
```

## 📞 Soporte

### Antes de Preguntar
1. Revisar esta guía
2. Buscar en issues existentes
3. Probar en diferentes navegadores
4. Verificar console errors

### Crear Issue
```markdown
## 🐛 Bug Report

**Descripción**: [Descripción clara del problema]

**Pasos para reproducir**:
1. Ir a [URL]
2. Hacer click en [elemento]
3. Ver error en [lugar]

**Comportamiento esperado**: [Qué debería pasar]

**Comportamiento actual**: [Qué pasa realmente]

**Navegador**: Chrome/Firefox/Safari
**OS**: Windows/Mac/Linux
**Versión**: [Versión del navegador]
```

## 🎉 Reconocimiento

- **Desarrollador**: Nicolas Jofre
- **DJ**: Matías Batista
- **Stream**: sonic.portalfoxmix.club

---

**¡Gracias por contribuir a la radio más brutal! 🎵** 