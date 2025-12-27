document.addEventListener('DOMContentLoaded', () => {
    // Referencias a Elementos del DOM con validación de seguridad
    const audioPlayer = document.getElementById('audio-player');
    const playButton = document.getElementById('play-btn');
    const nowPlayingText = document.getElementById('now-playing');
    const statusLive = document.getElementById('status-live');
    const statusTime = document.getElementById('status-time');
    const statusStream = document.getElementById('status-stream');
    const albumArtContainer = document.getElementById('album-art-container');
    const albumArtImg = document.getElementById('album-art');

    // Validación de elementos críticos
    if (!audioPlayer || !playButton || !nowPlayingText) {
        console.error('SECURITY: Critical DOM elements missing');
        return;
    }

    // URL de stream con validación de seguridad
    const ALLOWED_STREAM_HOSTS = ['radio.matiasbatista.com'];
    const streamUrl = 'https://radio.matiasbatista.com/listen/matias_batista/radio.mp3';
    const nowPlayingApiUrl = 'https://radio.matiasbatista.com/api/nowplaying_static/matias_batista.json';
    
    // Validar URL del stream
    function validateStreamUrl(url) {
        try {
            const urlObj = new URL(url);
            return ALLOWED_STREAM_HOSTS.includes(urlObj.hostname) && (urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
        } catch (e) {
            console.error('SECURITY: Invalid stream URL', e);
            return false;
        }
    }

    if (!validateStreamUrl(streamUrl)) {
        console.error('SECURITY: Stream URL validation failed');
        return;
    }
    
    // Estados iniciales
    let isPlaying = false;
    let isLoading = false;
    let hasInitialized = false;
    let hasError = false;
    let requestCount = 0; // Rate limiting simple
    const MAX_REQUESTS_PER_MINUTE = 30;
    let nowPlayingData = null;

    // Función de sanitización para prevenir XSS
    function sanitizeText(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Rate limiting simple
    function checkRateLimit() {
        const now = Date.now();
        if (!window.lastRequestTime) {
            window.lastRequestTime = now;
            window.requestHistory = [];
        }
        
        // Limpiar requests antiguos (más de 1 minuto)
        window.requestHistory = window.requestHistory.filter(time => now - time < 60000);
        
        if (window.requestHistory.length >= MAX_REQUESTS_PER_MINUTE) {
            console.warn('SECURITY: Rate limit exceeded');
            return false;
        }
        
        window.requestHistory.push(now);
        return true;
    }
    
    // --- LÓGICA DE REPRODUCCIÓN SEGURA ---
    playButton.addEventListener('click', (event) => {
        event.preventDefault();
        
        if (!checkRateLimit()) {
            return;
        }

        // Resetear estado de error al intentar reproducir
        if (hasError) {
            hasError = false;
            hasInitialized = false;
        }

        try {
            if (isPlaying) {
                // Acción de Pausar
                audioPlayer.pause();
            } else {
                // Acción de Reproducir
                if (!hasInitialized) {
                    // Validar URL nuevamente antes de asignar
                    if (!validateStreamUrl(streamUrl)) {
                        handlePlayError();
                        return;
                    }
                    audioPlayer.src = streamUrl;
                    audioPlayer.load();
                    hasInitialized = true;
                } else {
                    audioPlayer.play().catch(error => {
                        console.error('PLAY_ERROR:', error);
                        handlePlayError();
                    });
                }
            }
        } catch (error) {
            console.error('CLICK_ERROR:', error);
            handlePlayError();
        }
    });

    // --- MANEJADORES DE EVENTOS SEGUROS ---
    audioPlayer.addEventListener('loadstart', () => {
        isLoading = true;
        hasError = false;
        updateUI();
    });

    audioPlayer.addEventListener('canplay', () => {
        if (!isPlaying && !hasError) {
            audioPlayer.play().catch(error => {
                console.error('AUTOPLAY_ERROR:', error);
                handlePlayError();
            });
        }
    });
    
    audioPlayer.addEventListener('playing', () => {
        isPlaying = true;
        isLoading = false;
        hasError = false;
        updateUI();
        
        // INMEDIATAMENTE cambiar la primera canción cuando empiece a reproducir
        setTimeout(() => {
            if (isPlaying && !hasError) {
                changeNowPlaying();
            }
        }, 500); // Solo 500ms de delay para el primer cambio
    });

    audioPlayer.addEventListener('pause', () => {
        isPlaying = false;
        isLoading = false;
        updateUI();
        // Resetear a estado inicial cuando se pausa
        resetToInitialState();
    });

    audioPlayer.addEventListener('error', (e) => {
        console.error('STREAM_ERROR:', e);
        handlePlayError();
    });

    audioPlayer.addEventListener('waiting', () => {
        isLoading = true;
        updateUI();
    });

    // Función segura para manejar errores
    function handlePlayError() {
        isLoading = false;
        isPlaying = false;
        hasError = true;
        hasInitialized = false;
        updateUI();
        
        // Auto-reintentar después de 3 segundos con validación
        setTimeout(() => {
            if (hasError && !isPlaying && validateStreamUrl(streamUrl)) {
                hasError = false;
                updateUI();
            }
        }, 3000);
    }

    // --- FUNCIONES DE ACTUALIZACIÓN UI SEGURAS ---
    function updateUI() {
        try {
            updatePlayButtonState();
            updateStatusValues();
            updateAccessibility();
        } catch (error) {
            console.error('UI_UPDATE_ERROR:', error);
        }
    }

    function updatePlayButtonState() {
        if (!playButton) return;
        
        playButton.classList.remove('playing', 'loading', 'error');
        
        if (hasError) {
            playButton.classList.add('error');
            playButton.textContent = 'RETRY';
            playButton.setAttribute('aria-label', 'Reintentar conexión');
        } else if (isPlaying) {
            playButton.classList.add('playing');
            playButton.textContent = 'PAUSE';
            playButton.setAttribute('aria-label', 'Pausar radio');
        } else {
            playButton.textContent = 'PLAY';
            playButton.setAttribute('aria-label', 'Reproducir radio');
        }

        if (isLoading && !hasError) {
            playButton.classList.add('loading');
        }
    }

    function updateStatusValues() {
        if (!statusTime) return;
        
        const currentTime = new Date();
        const hours = currentTime.getHours().toString().padStart(2, '0');
        const minutes = currentTime.getMinutes().toString().padStart(2, '0');
        
        // Sanitizar y actualizar contenido
        statusTime.textContent = `${hours}:${minutes}_FM`;
        
        // Actualizar clases de estado de forma segura
        if (statusLive) {
            statusLive.className = 'status-value';
            statusStream.className = 'status-value';
            
            if (hasError) {
                statusLive.textContent = 'ERROR';
                statusLive.classList.add('error');
                statusStream.textContent = 'DISCONNECTED';
                statusStream.classList.add('error');
            } else if (isLoading) {
                statusLive.textContent = 'CONNECTING';
                statusLive.classList.add('connecting');
                statusStream.textContent = 'BUFFERING...';
                statusStream.classList.add('connecting');
            } else if (isPlaying) {
                statusLive.textContent = 'LIVE';
                statusLive.classList.add('live');
                statusStream.textContent = 'STREAMING';
                statusStream.classList.add('live');
            } else {
                statusLive.textContent = 'OFFLINE';
                statusLive.classList.add('offline');
                statusStream.textContent = 'IDLE';
                statusStream.classList.add('offline');
            }
        }
    }

    function updateAccessibility() {
        try {
            const liveRegion = document.querySelector('.marquee-text');
            if (liveRegion) {
                liveRegion.setAttribute('aria-live', isPlaying ? 'polite' : 'off');
            }
            
            // Título seguro sin inyección
            const baseTitle = 'DJ Matías Batista - Radio Online';
            document.title = isPlaying ? `▶ ${baseTitle} - EN VIVO` : baseTitle;
            
            // Favicon dinámico seguro
            updateFavicon();
        } catch (error) {
            console.error('ACCESSIBILITY_UPDATE_ERROR:', error);
        }
    }

    function updateFavicon() {
        const favicon = document.getElementById('favicon');
        if (!favicon) return;
        
        try {
            const svgContent = isPlaying 
                ? "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' fill='%23FF0000'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='10'>▶</text></svg>"
                : "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><rect width='16' height='16' fill='%23000'/><text x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-size='10'>📻</text></svg>";
            
            favicon.setAttribute('href', `data:image/svg+xml,${svgContent}`);
        } catch (error) {
            console.error('FAVICON_UPDATE_ERROR:', error);
        }
    }

    // --- OBTENER INFORMACIÓN DE NOW PLAYING ---
    async function fetchNowPlaying() {
        try {
            const response = await fetch(nowPlayingApiUrl);
            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();
            nowPlayingData = data;

            if (data.now_playing && data.now_playing.song) {
                const song = data.now_playing.song;
                const artist = song.artist || 'Unknown Artist';
                const title = song.title || 'Unknown Track';
                const artUrl = song.art;

                updateMarqueeText(artist, title);
                updateAlbumArt(artUrl);
                updateMediaSession(artist, title, artUrl);
            }
        } catch (error) {
            console.error('NOW_PLAYING_FETCH_ERROR:', error);
            // Fallback to generic message on error
            updateMarqueeText('RADIO MATÍAS BATISTA', 'ON AIR 24/7');
            hideAlbumArt();
        }
    }

    // --- ACTUALIZAR ALBUM ART ---
    function updateAlbumArt(artUrl) {
        if (!albumArtContainer || !albumArtImg) return;

        if (artUrl) {
            albumArtImg.src = artUrl;
            albumArtContainer.style.display = 'block';
        } else {
            hideAlbumArt();
        }
    }

    function hideAlbumArt() {
        if (albumArtContainer) {
            albumArtContainer.style.display = 'none';
        }
    }

    // --- ACTUALIZAR MEDIASESSION (CARPLAY, LOCK SCREEN) ---
    function updateMediaSession(artist, title, artUrl) {
        if (!('mediaSession' in navigator)) return;

        try {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artist,
                album: 'Radio Matías Batista',
                artwork: artUrl ? [
                    { src: artUrl, sizes: '512x512', type: 'image/jpeg' },
                    { src: artUrl, sizes: '256x256', type: 'image/jpeg' },
                    { src: artUrl, sizes: '128x128', type: 'image/jpeg' }
                ] : []
            });
        } catch (error) {
            console.error('MEDIASESSION_UPDATE_ERROR:', error);
        }
    }

    // --- CAMBIO DE CANCIONES SEGURO ---
    function changeNowPlaying() {
        if (!isPlaying || hasError || !nowPlayingText) return;
        fetchNowPlaying();
    }

    function updateMarqueeText(artist, songTitle) {
        if (!nowPlayingText) return;

        try {
            const safeArtist = sanitizeText(artist);
            const safeSongTitle = sanitizeText(songTitle);
            const brutalText = `>>> ARTIST: ${safeArtist} // SONG: ${safeSongTitle} <<<`;
            
            // Crear elementos seguros
            const span1 = document.createElement('span');
            const span2 = document.createElement('span');
            span1.textContent = brutalText;
            span2.textContent = brutalText;
            
            nowPlayingText.innerHTML = '';
            nowPlayingText.appendChild(span1);
            nowPlayingText.appendChild(span2);
        } catch (error) {
            console.error('MARQUEE_UPDATE_ERROR:', error);
        }
    }

    function resetToInitialState() {
        if (!nowPlayingText) return;
        
        try {
            const initialText = '>>> PRESIONA PLAY <<<';
            const span1 = document.createElement('span');
            const span2 = document.createElement('span');
            span1.textContent = initialText;
            span2.textContent = initialText;
            
            nowPlayingText.innerHTML = '';
            nowPlayingText.appendChild(span1);
            nowPlayingText.appendChild(span2);
        } catch (error) {
            console.error('RESET_ERROR:', error);
        }
    }

    // --- EVENTOS DE SEGURIDAD ---
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isPlaying) {
            console.log('PAGE_HIDDEN: Manteniendo stream activo');
        } else if (!document.hidden && isPlaying) {
            updateUI();
        }
    });

    // Prevenir ataques de navegación maliciosa
    window.addEventListener('beforeunload', () => {
        try {
            if (isPlaying && audioPlayer) {
                audioPlayer.pause();
            }
        } catch (error) {
            console.error('CLEANUP_ERROR:', error);
        }
    });

    // --- INICIALIZACIÓN SEGURA ---
    console.log('Radio Matías Batista v2.0 - Now Playing Integration - Initialized');
    resetToInitialState();
    updateUI();

    // INTERVALOS OPTIMIZADOS - Fetch Now Playing cada 15 segundos
    const songInterval = setInterval(() => {
        try {
            if (isPlaying && !hasError) {
                fetchNowPlaying();
            }
        } catch (error) {
            console.error('SONG_INTERVAL_ERROR:', error);
        }
    }, 15000); // Cada 15 segundos
    
    const statusInterval = setInterval(() => {
        try {
            updateStatusValues();
        } catch (error) {
            console.error('STATUS_INTERVAL_ERROR:', error);
        }
    }, 1000);

    // Limpieza de intervalos al salir
    window.addEventListener('beforeunload', () => {
        clearInterval(songInterval);
        clearInterval(statusInterval);
    });

    // Insert current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
});