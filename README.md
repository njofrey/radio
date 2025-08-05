# 📻 Radio Matías Batista

Radio online de Matías Batista transmitiendo música curada 24/7.

## 🚀 Características

- **Streaming en vivo 24/7** desde sonic.portalfoxmix.club
- **Diseño brutal** con tipografía Akira Expanded
- **Responsive** optimizado para móvil y desktop
- **Accesibilidad** completa con ARIA labels
- **SEO optimizado** con meta tags y structured data
- **PWA ready** con manifest.json
- **Seguridad** con CSP headers y sanitización

## 🛠️ Tecnologías

- HTML5 semántico
- CSS3 con variables CSS y Grid/Flexbox
- JavaScript vanilla (ES6+)
- Fuente personalizada Akira Expanded
- PWA con manifest.json

## 📁 Estructura del Proyecto

```
Radio/
├── index.html          # Página principal
├── script.js           # Lógica de radio
├── style.css           # Estilos brutales
├── manifest.json       # PWA manifest
├── Fonts/              # Fuentes personalizadas
│   └── Akira Expanded Demo.otf
├── robots.txt          # SEO robots
├── sitemap.xml         # SEO sitemap
└── SECURITY.md         # Política de seguridad
```

## 🤝 Guías de Colaboración

### Flujo de Trabajo

1. **Crear feature branch** desde `main`
   ```bash
   git checkout -b feature/nombre-del-feature
   ```

2. **Desarrollar** con commits descriptivos
   ```bash
   git commit -m "feat: añadir nueva funcionalidad X"
   ```

3. **Push y Pull Request**
   ```bash
   git push origin feature/nombre-del-feature
   ```

### Convenciones de Commits

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `style:` Cambios de estilo/CSS
- `refactor:` Refactorización de código
- `docs:` Documentación
- `test:` Tests
- `chore:` Tareas de mantenimiento

### Estándares de Código

#### HTML
- Usar elementos semánticos (`<main>`, `<section>`, `<header>`)
- Incluir atributos ARIA para accesibilidad
- Meta tags completos para SEO
- Validar con W3C validator

#### CSS
- Usar variables CSS (`:root`)
- Mobile-first responsive design
- Preferencias de usuario (`prefers-reduced-motion`)
- Alto contraste accesible

#### JavaScript
- Vanilla JS, sin frameworks
- Sanitización de datos para prevenir XSS
- Rate limiting para APIs
- Manejo de errores robusto
- Console logging para debugging

### Revisión de Código

#### Checklist Pre-PR
- [ ] Código funciona en Chrome, Firefox, Safari
- [ ] Responsive en móvil (320px+) y desktop
- [ ] Accesibilidad verificada (navegación por teclado)
- [ ] Performance optimizada (no bloquea render)
- [ ] SEO meta tags actualizados si es necesario
- [ ] Console sin errores
- [ ] Stream funciona correctamente

#### Criterios de Aprobación
- ✅ Funcionalidad probada
- ✅ Código limpio y legible
- ✅ Sin regresiones en UX
- ✅ Performance mantenida
- ✅ Accesibilidad preservada

### Configuración Local

1. **Clonar repositorio**
   ```bash
   git clone [URL_DEL_REPO]
   cd Radio
   ```

2. **Servidor local** (opcional)
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # PHP
   php -S localhost:8000
   ```

3. **Abrir en navegador**
   ```
   http://localhost:8000
   ```

### Testing

#### Manual Testing Checklist
- [ ] Play/Pause funciona
- [ ] Stream se conecta correctamente
- [ ] UI actualiza estados (loading, playing, error)
- [ ] Responsive en diferentes tamaños
- [ ] Navegación por teclado funciona
- [ ] Screen reader compatible
- [ ] Console sin errores

#### Herramientas Recomendadas
- **Lighthouse** para performance/accessibility
- **W3C Validator** para HTML
- **CSS Validator** para estilos
- **Chrome DevTools** para debugging

### Deployment

#### Producción
- Subir a hosting estático (Netlify, Vercel, GitHub Pages)
- Verificar HTTPS obligatorio
- CSP headers configurados
- CDN para assets si es necesario

#### Staging
- Branch `staging` para testing
- Auto-deploy desde `staging` branch
- Testing manual antes de merge a `main`

### Seguridad

#### Checklist de Seguridad
- [ ] CSP headers configurados
- [ ] Sanitización de inputs
- [ ] Rate limiting implementado
- [ ] HTTPS obligatorio
- [ ] No credenciales en código
- [ ] Validación de URLs externas

### Performance

#### Métricas Objetivo
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

#### Optimizaciones
- Fuentes con `font-display: swap`
- CSS crítico inline
- Lazy loading de assets
- Minificación de assets
- Compresión gzip/brotli

## 🐛 Troubleshooting

### Problemas Comunes

#### Stream no reproduce
- Verificar URL del stream
- Revisar CORS headers
- Comprobar conectividad de red

#### CSS no carga
- Verificar rutas de archivos
- Limpiar cache del navegador
- Revisar sintaxis CSS

#### JavaScript errors
- Abrir DevTools Console
- Verificar elementos DOM existen
- Revisar scope de variables

## 📞 Contacto

- **Desarrollador**: Nicolas Jofre
- **DJ**: Matías Batista
- **Stream**: sonic.portalfoxmix.club

---

**BUILD: v2.1** | **WITH_LOVE_FROM_NICOLAS_JOFRE** ❤️ 