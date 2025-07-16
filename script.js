/* Radio Matías Batista minimal
 * Single station, static deploy friendly.
 * Replace STREAM_URL with your live stream.
 * Metadata disabled until we have endpoint with CORS.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ----- CONFIG -----
  // Demo: FIP (Francia). Cambia cuando tengas tu stream.
  // Prueba: abre esta URL directo en el navegador. Si suena, sirve.
  // Si no reproduce en tu país, dímelo y busco otra.
  const STREAM_URL = 'https://icecast.radiofrance.fr/fip-midfi.mp3';

  // Metadata apagada por defecto; activa cuando tengamos endpoint.
  const METADATA_URL = null;
  const METADATA_TYPE = null; // 'icecast' o 'shoutcast'

  // ----- DOM -----
  const audioEl = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const statusBadge = document.getElementById('status-badge');
  const errorMsg = document.getElementById('error-msg');
  const songTitleEl = document.getElementById('song-title');
  const artistNameEl = document.getElementById('artist-name');
  const lastUpdatedEl = document.getElementById('last-updated');

  // Set stream
  audioEl.src = STREAM_URL;

  // Initial NP
  updateNowPlaying('En vivo', 'Radio Matías Batista');

  // PLAY
  playBtn.addEventListener('click', () => {
    clearError();
    setStatus('loading', 'Cargando');
    safePlay();
  });

  // PAUSE
  pauseBtn.addEventListener('click', () => {
    audioEl.pause();
    setStatus('idle', 'Pausado');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  // Audio events
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
    setStatus('error', 'Error');
    showError('No se pudo reproducir el stream. Revisa la URL o tu conexión.');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });
  audioEl.addEventListener('ended', () => {
    // Streams live a veces se cierran; intenta resumir
    retryStream();
  });

  // Metadata (apagada por ahora)
  if (METADATA_URL) startMetaPoll();

  // ----- funciones -----
  function safePlay() {
    audioEl.load();
    audioEl.play().catch(err => {
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
        statusBadge.classList.add('status-loading'); break;
      case 'playing':
        statusBadge.classList.add('status-playing'); break;
      case 'error':
        statusBadge.classList.add('status-error'); break;
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

  // Meta poll (inactivo hasta que configures)
  let metaTimer = null;
  function startMetaPoll() {
    stopMetaPoll();
    fetchMeta();
    metaTimer = setInterval(fetchMeta, 15000);
  }
  function stopMetaPoll() {
    if (metaTimer) clearInterval(metaTimer);
    metaTimer = null;
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

      updateNowPlaying(song, artist);
    } catch (err) {
      console.warn('Meta error', err);
    }
  }
  function splitArtistTitle(raw, fallbackArtist, fallbackSong) {
    if (!raw) return [fallbackArtist, fallbackSong];
    const parts = raw.split(' - ');
    if (parts.length >= 2) return [parts[0].trim(), parts.slice(1).join(' - ').trim()];
    return [fallbackArtist, raw.trim()];
  }
});
