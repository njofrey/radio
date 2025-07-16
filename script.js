/* Radio Matías Batista - estilo minimal con controles nativos
 * Solo una emisora.
 * Muestra título/artist si hay metadatos (Icecast o Shoutcast) opcionales.
 * Heurística: "Artista - Canción" si viene en title.
 */

document.addEventListener('DOMContentLoaded', () => {
  /* CONFIGURA TU STREAM AQUÍ */
  // Demo: FIP Francia. Cambia cuando tengas tu stream propio.
  const STREAM_URL = 'https://icecast.radiofrance.fr/fip-midfi.mp3';

  // Metadatos (opcional). Deja null si no tienes.
  const METADATA_URL = null; // ejemplo: 'https://tu-servidor/status-json.xsl'
  const METADATA_TYPE = null; // 'icecast' o 'shoutcast' o null (heurística)

  /* DOM */
  const audioEl = document.getElementById('audio-player');
  const songTitleEl = document.getElementById('song-title');
  const artistNameEl = document.getElementById('artist-name');
  const lastUpdatedEl = document.getElementById('last-updated');

  /* Inicializa fuente */
  audioEl.src = STREAM_URL;

  /* Estado meta */
  updateNowPlaying('En vivo', 'Radio Matías Batista');

  /* Eventos de audio solo para refrescar hora */
  audioEl.addEventListener('playing', () => {
    lastUpdatedEl.textContent = 'Reproduciendo ' + timeNow();
  });
  audioEl.addEventListener('pause', () => {
    lastUpdatedEl.textContent = 'Pausado ' + timeNow();
  });
  audioEl.addEventListener('error', () => {
    lastUpdatedEl.textContent = 'Error ' + timeNow();
  });

  /* Poll de metadatos si está configurado */
  if (METADATA_URL) startMetaPoll();

  /* Funciones */
  function updateNowPlaying(song, artist) {
    songTitleEl.textContent = song || 'En vivo';
    artistNameEl.textContent = artist || 'Radio Matías Batista';
    lastUpdatedEl.textContent = 'Actualizado ' + timeNow();
  }

  function timeNow() {
    return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  }

  /* --- Metadatos --- */
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
        const src = Array.isArray(data.icestats.source)
          ? data.icestats.source[0]
          : data.icestats.source;
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
      // Silencio; mantenemos última data
      console.warn('Meta error', err);
    }
  }

  function splitArtistTitle(raw, fallbackArtist, fallbackSong) {
    if (!raw) return [fallbackArtist, fallbackSong];
    const parts = raw.split(' - ');
    if (parts.length >= 2) {
      return [parts[0].trim(), parts.slice(1).join(' - ').trim()];
    }
    return [fallbackArtist, raw.trim()];
  }
});
