/* Radio Matías Batista Player
 * Características:
 * - Lista de emisoras seleccionables.
 * - Reproducción con botones Play y Pausa.
 * - Estado visual (Listo, Cargando, Reproduciendo, Error).
 * - Poll de metadatos Now Playing para servidores Icecast/Shoutcast cuando hay endpoint.
 * - Persistencia de estación elegida en localStorage.
 * - Manejo básico de errores de red y autoplay.
 *
 * Nota: Los navegadores móviles bloquean autoplay sin interacción. El usuario debe presionar Play.
 */

document.addEventListener('DOMContentLoaded', () => {
  const audioPlayer = document.getElementById('audio-player');
  const playBtn = document.getElementById('play-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stationSelect = document.getElementById('station-select');
  const songTitleEl = document.getElementById('song-title');
  const artistNameEl = document.getElementById('artist-name');
  const lastUpdatedEl = document.getElementById('last-updated');
  const statusBadge = document.getElementById('status-badge');

  /* Configura aquí tus emisoras.
   * Usa HTTPS siempre que sea posible para evitar bloqueo mixto.
   * metadataUrl puede ser:
   *   - Icecast JSON: http(s)://servidor:puerto/status-json.xsl
   *   - Shoutcast songtitle endpoint, depende del proveedor.
   * Si no tienes endpoint, deja null y mostraremos solo el nombre de la emisora.
   */
  const stations = [
    {
      id: 'bbc1',
      name: 'BBC Radio 1 (demo)',
      streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
      metadataUrl: null,
      metadataType: null
    },
    {
      id: 'fip',
      name: 'FIP (Francia, demo)',
      streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
      metadataUrl: null,
      metadataType: null
    },
    {
      id: 'sample',
      name: 'Sample MP3 público',
      streamUrl: 'https://file-examples.com/storage/feff6e78a1f20e4f550d3f3/2017/11/file_example_MP3_700KB.mp3',
      metadataUrl: null,
      metadataType: null
    }
    // Agrega emisoras chilenas aquí cuando tengas URLs de stream y meta.
  ];

  /* Rellena el select */
  stations.forEach(st => {
    const opt = document.createElement('option');
    opt.value = st.id;
    opt.textContent = st.name;
    stationSelect.appendChild(opt);
  });

  /* Carga estación guardada o la primera */
  const savedStationId = localStorage.getItem('rmb_station_id');
  const defaultStation = stations.find(st => st.id === savedStationId) || stations[0];
  stationSelect.value = defaultStation.id;
  loadStation(defaultStation);

  /* Eventos */
  playBtn.addEventListener('click', () => {
    audioPlayer.play().then(() => {
      setStatus('playing');
      playBtn.disabled = true;
      pauseBtn.disabled = false;
    }).catch(err => {
      console.error('Play blocked', err);
      setStatus('error', 'No se pudo reproducir. Toca de nuevo.');
    });
  });

  pauseBtn.addEventListener('click', () => {
    audioPlayer.pause();
    setStatus('idle');
    playBtn.disabled = false;
    pauseBtn.disabled = true;
  });

  stationSelect.addEventListener('change', e => {
    const st = stations.find(s => s.id === e.target.value);
    if (st) {
      localStorage.setItem('rmb_station_id', st.id);
      loadStation(st, true);
    }
  });

  /* Audio events */
  audioPlayer.addEventListener('playing', () => setStatus('playing'));
  audioPlayer.addEventListener('pause', () => setStatus('idle'));
  audioPlayer.addEventListener('waiting', () => setStatus('loading'));
  audioPlayer.addEventListener('stalled', () => setStatus('loading'));
  audioPlayer.addEventListener('error', () => setStatus('error', 'Error de reproducción'));

  /* Poll metadatos */
  let metaTimer = null;
  function startMetaPoll(station) {
    stopMetaPoll();
    if (!station.metadataUrl) {
      // Sin meta, solo muestra nombre de la estación.
      updateNowPlaying({
        artist: station.name,
        song: 'En vivo'
      });
      return;
    }
    fetchMeta(station); // primer intento inmediato
    metaTimer = setInterval(() => fetchMeta(station), 15000); // cada 15 s
  }

  function stopMetaPoll() {
    if (metaTimer) {
      clearInterval(metaTimer);
      metaTimer = null;
    }
  }

  async function fetchMeta(station) {
    try {
      const res = await fetch(station.metadataUrl, { cache: 'no-store' });
      if (!res.ok) throw new Error('Meta HTTP ' + res.status);
      const text = await res.text();

      let artist = station.name;
      let song = 'En vivo';

      if (station.metadataType === 'icecast') {
        // Parse JSON de Icecast
        const data = JSON.parse(text);
        // data.icestats.source puede ser array o objeto
        const src = Array.isArray(data.icestats.source)
          ? data.icestats.source[0]
          : data.icestats.source;
        if (src && src.title) {
          // Muchos servidores ponen "Artista - Tema" en title
          [artist, song] = splitArtistTitle(src.title, artist, song);
        }
      } else if (station.metadataType === 'shoutcast') {
        // Shoutcast retorna texto plano con SongTitle=...
        const match = text.match(/StreamTitle='([^']+)'/i);
        if (match && match[1]) {
          [artist, song] = splitArtistTitle(match[1], artist, song);
        }
      } else {
        // Intento genérico: buscar patrón Artista - Título
        [artist, song] = splitArtistTitle(text, artist, song);
      }

      updateNowPlaying({ artist, song });
    } catch (err) {
      console.warn('Meta error', err);
      // No actualiza, deja último dato
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

  function updateNowPlaying({ artist, song }) {
    songTitleEl.textContent = song || '';
    artistNameEl.textContent = artist || '';
    lastUpdatedEl.textContent = 'Actualizado ' + formatTime(new Date());
  }

  function formatTime(d) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function setStatus(state, msg) {
    statusBadge.className = 'status-badge';
    switch (state) {
      case 'loading':
        statusBadge.classList.add('status-loading');
        statusBadge.textContent = msg || 'Cargando';
        break;
      case 'playing':
        statusBadge.classList.add('status-playing');
        statusBadge.textContent = msg || 'Reproduciendo';
        break;
      case 'error':
        statusBadge.classList.add('status-error');
        statusBadge.textContent = msg || 'Error';
        break;
      default:
        statusBadge.textContent = msg || 'Listo';
    }
  }

  function loadStation(station, userInitiated = false) {
    stopMetaPoll();
    setStatus('loading', 'Cargando ' + station.name);
    // Si ya estaba reproduciendo, pausa primero
    audioPlayer.pause();
    audioPlayer.src = station.streamUrl;
    audioPlayer.load(); // fuerza recarga

    // Si el cambio fue por el usuario, intenta autoplay inmediato
    if (userInitiated) {
      audioPlayer.play().then(() => {
        setStatus('playing');
        playBtn.disabled = true;
        pauseBtn.disabled = false;
      }).catch(() => {
        // Autoplay bloqueado, habilita Play manual
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        setStatus('idle', 'Presiona Play');
      });
    } else {
      // Primera carga, espera acción del usuario
      playBtn.disabled = false;
      pauseBtn.disabled = true;
      setStatus('idle', 'Presiona Play');
    }

    // Muestra nombre de estación mientras llega meta
    updateNowPlaying({ artist: station.name, song: 'En vivo' });
    startMetaPoll(station);
  }
});
