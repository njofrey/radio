/* Radio Matías Batista
 * Single station player for static hosting (GitHub + Vercel).
 * Shows current song if metadata endpoint available.
 * Graceful fallback when metadata blocked by CORS.
 * Works in modern Chrome, Safari (desktop + iOS), Firefox, Edge.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----- CONFIG -----
  // TODO: reemplaza con tu stream real. Debe ser HTTPS para evitar bloqueo mixto.
  const STREAM_URL = 'https://example.com/live.mp3'; // <--- cambia esto
  // Opcional: endpoint para metadatos
  const METADATA_URL = null; // p.ej. 'https://example.com/status-json.xsl'
  const METADATA_TYPE = null; // 'icecast' | 'shoutcast' | null

  // ----- ELEMENTOS -----
  const audioEl = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const statusBadge = document.getElementById('status-badge');
  const errorMsg = document.getElementById('error-msg');
  const songTitleEl = document.getElementById('song-title');
  const artistNameEl = document.getElementById('artist-name');
  const lastUpdatedEl = document.getElementById('last-updated');

  // Configura fuente de audio
  audioEl.src = STREAM_URL;

  // Estado meta
  let metaTimer = null;
  let lastMetaText = '';

  // ----- PLAY -----
  playBtn.addEventListener('click', () => {
    clearError();
    setStatus('loading', 'Cargando');
    safePlay();
  });

  // ----- PAUSE -----
  pauseBtn.addEventListener('click', () => {
    audioEl.pause();
    setStatus('idle', 'Listo');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  // Audio listeners
  audioEl.addEventListener('playing', () => {
    setStatus('playing', 'Reproduciendo');
    playBtn.disabled = true;
    pauseBtn.disabled = false;
  });
  audioEl.addEventListener('pause', () => {
    if (!audioEl.ended) setStatus('idle', 'Pausado');
  });
  audioEl.addEventListener('waiting', () => setStatus('loading', 'Buffering'));
  audioEl.addEventListener('stalled', () => setStatus('loading', 'Reconectando'));
  audioEl.addEventListener('error', () => {
    setStatus('error', 'Error de reproducción');
    showError('No se pudo reproducir el stream. Revisa la URL o tu conexión.');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });
  audioEl.addEventListener('ended', () => {
    // En streams live a veces Safari detiene; intenta reanudar
    retryStream();
  });

  // ----- METADATA POLL -----
  if (METADATA_URL) startMetaPoll();
  else {
    // Sin meta, muestra nombre fijo
    updateNowPlaying('En vivo', 'Radio Matías Batista');
  }

  // Pausar poll cuando pestaña oculta
  document.addEventListener('visibilitychange', () => {
    if (!METADATA_URL) return;
    if (document.hidden) stopMetaPoll();
    else startMetaPoll();
  });

  // ----- FUNCIONES -----
  function safePlay() {
    // Algunos navegadores requieren cargar primero
    audioEl.load();
    audioEl.play().catch(err => {
      // Autoplay bloqueado o error
      setStatus('idle', 'Presiona Play');
      showError('El navegador bloqueó la reproducción automática. Toca Play de nuevo si no comienza.');
      console.warn('Play error', err);
    });
  }

  function retryStream() {
    setStatus('loading', 'Reconectando');
    audioEl.load();
    audioEl.play().catch(() => {
      setStatus('error', 'Error');
      playBtn.disabled = false;
      pauseBtn.disabled = true;
    });
  }

  function setStatus(state, msg) {
    statusBadge.className = 'status-badge';
    switch (state) {
      case 'loading':
        statusBadge.classList.add('status-loading');
        break;
      case 'playing':
        statusBadge.classList.add('status-playing');
        break;
      case 'error':
        statusBadge.classList.add('status-error');
        break;
      default:
        // idle
        break;
    }
    statusBadge.textContent = msg;
  }

  function showError(txt) {
    errorMsg.textContent = txt;
    errorMsg.hidden = false;
  }
  function clearError() {
    errorMsg.textContent = '';
    errorMsg.hidden = true;
  }

  function updateNowPlaying(song, artist) {
    songTitleEl.textContent = song || 'En vivo';
    artistNameEl.textContent = artist || 'Radio Matías Batista';
    lastUpdatedEl.textContent = 'Actualizado ' + new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  function startMetaPoll() {
    stopMetaPoll();
    fetchMeta();
    metaTimer = setInterval(fetchMeta, 15000); // cada 15 s
  }
  function stopMetaPoll() {
    if (metaTimer) {
      clearInterval(metaTimer);
      metaTimer = null;
    }
  }

  async function fetchMeta() {
    try {
      const res = await fetch(METADATA_URL, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();

      let artist = 'Radio Matías Batista';
      let song = 'En vivo';

      if (METADATA_TYPE === 'icecast') {
        const data = JSON.parse(text);
        const src = Array.isArray(data.icestats.source) ? data.icestats.source[0] : data.icestats.source;
        if (src && src.title) {
          [artist, song] = splitArtistTitle(src.title, artist, song);
        }
      } else if (METADATA_TYPE === 'shoutcast') {
        const match = text.match(/StreamTitle='([^']+)'/i);
        if (match && match[1]) {
          [artist, song] = splitArtistTitle(match[1], artist, song);
        }
      } else {
        [artist, song] = splitArtistTitle(text, artist, song);
      }

      const combined = artist + ' - ' + song;
      if (combined !== lastMetaText) {
        lastMetaText = combined;
        updateNowPlaying(song, artist);
      }
    } catch (err) {
      console.warn('Meta error', err);
      // degrada silencioso
    }
  }

  function splitArtistTitle(raw, fallbackArtist, fallbackSong) {
    if (!raw) return [fallbackArtist, fallbackSong];
    const parts = raw.split(' - ');
    if (parts.length >= 2) return [parts[0].trim(), parts.slice(1).join(' - ').trim()];
    return [fallbackArtist, raw.trim()];
  }
});
