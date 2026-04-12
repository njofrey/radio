# 🔒 Política de Seguridad

## 🛡️ Reportar Vulnerabilidades

Si encuentras una vulnerabilidad de seguridad, **NO** la reportes públicamente. En su lugar:

1. **Email directo**: Envía un email a [tu-email@ejemplo.com]
2. **Asunto**: `[SECURITY] Radio Matías Batista - Vulnerabilidad`
3. **Incluye**: Descripción detallada, pasos para reproducir, impacto potencial

### Respuesta
- **24 horas**: Confirmación de recepción
- **7 días**: Evaluación inicial
- **30 días**: Resolución o actualización de estado

## 🔐 Medidas de Seguridad Implementadas

### Content Security Policy (CSP)

CSP real se aplica como HTTP header vía `vercel.json` (el meta tag en HTML sirve como fallback):

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
media-src 'self' https://radio.matiasbatista.com;
connect-src 'self' https://radio.matiasbatista.com;
img-src 'self' data: https:;
frame-ancestors 'none';
base-uri 'self';
```

### Headers de Seguridad
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Sanitización de Datos
```javascript
// Función de sanitización para prevenir XSS
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
```

### Validación de URLs
```javascript
// Validar URLs externas permitidas
const ALLOWED_STREAM_HOSTS = ['radio.matiasbatista.com'];
function validateStreamUrl(url) {
    try {
        const urlObj = new URL(url);
        return ALLOWED_STREAM_HOSTS.includes(urlObj.hostname) &&
               (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
    } catch (e) {
        return false;
    }
}
```

### Rate Limiting
```javascript
// Rate limiting simple para prevenir abuso
const MAX_REQUESTS_PER_MINUTE = 30;
function checkRateLimit() {
    // Implementación de rate limiting
}
```

## 🚨 Vulnerabilidades Conocidas

### No Aplicables
- **SQL Injection**: No usa base de datos
- **Authentication**: No requiere login
- **File Upload**: No permite subir archivos
- **Session Management**: No usa sesiones

### Potenciales
- **XSS**: Mitigado con sanitización
- **CSRF**: No aplicable (solo GET requests)
- **Clickjacking**: Mitigado con X-Frame-Options
- **Information Disclosure**: Headers de seguridad implementados

## 🔍 Auditoría de Seguridad

### Checklist Mensual
- [ ] Revisar dependencias por vulnerabilidades
- [ ] Verificar headers de seguridad
- [ ] Probar sanitización de inputs
- [ ] Validar CSP headers
- [ ] Revisar console por errores de seguridad

### Herramientas Recomendadas
- **Lighthouse Security**: Para auditoría automática
- **OWASP ZAP**: Para testing de seguridad
- **Chrome DevTools**: Para revisar headers y CSP
- **Security Headers**: Para verificar headers

## 📋 Buenas Prácticas

### Para Desarrolladores
1. **Nunca** confiar en input del usuario
2. **Siempre** sanitizar datos antes de mostrar
3. **Validar** URLs externas antes de usar
4. **Usar** HTTPS para todas las conexiones
5. **Mantener** headers de seguridad actualizados

### Para Colaboradores
1. **No subir** credenciales al repositorio
2. **Revisar** código por vulnerabilidades antes de PR
3. **Reportar** problemas de seguridad inmediatamente
4. **Mantener** dependencias actualizadas

## 🚀 Deployment Seguro

### Producción
- [ ] HTTPS obligatorio
- [ ] Headers de seguridad configurados
- [ ] CSP headers implementados
- [ ] No credenciales en código
- [ ] Validación de URLs externas

### Staging
- [ ] Mismo nivel de seguridad que producción
- [ ] Testing de seguridad antes de deploy
- [ ] Monitoreo de errores de seguridad

## 📞 Contacto de Seguridad

**Email**: [tu-email@ejemplo.com]  
**Asunto**: `[SECURITY] Radio Matías Batista`  
**Respuesta**: Dentro de 24 horas

## 🔄 Actualizaciones

- **v2.2**: Migración a Vercel + `vercel.json` con headers reales (HSTS, CSP, COOP). Stream migrado a `radio.matiasbatista.com` (AzuraCast propio). Eliminado `.htaccess`.
- **v2.1**: CSP headers implementados
- **v2.0**: Sanitización de inputs añadida
- **v1.0**: Headers de seguridad básicos

---

**Última actualización**: Abril 2026
**Próxima revisión**: Octubre 2026

**BUILD: v2.2** | **WITH_LOVE_FROM_NICOLAS_JOFRE**
