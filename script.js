// Esperamos a que todo el HTML esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    const audioPlayer = document.getElementById('audio-player');
    const songTitleEl = document.getElementById('song-title');
    const artistNameEl = document.getElementById('artist-name');

    // --- ¡IMPORTANTE! ---
    // Esta es la URL que te dará tu proveedor de streaming (Radio.co, etc.)
    const streamUrl = 'URL_DE_TU_STREAM_AQUI'; 
    // Por ahora, la dejamos vacía o con una radio de ejemplo para probar.
    // Ejemplo: 'http://stream.radioreklama.bg/radio1rock.ogg'

    audioPlayer.src = streamUrl;

    // --- SIMULACIÓN DE DATOS "AHORA SUENA" ---
    // Como aún no tenemos un servicio de radio, vamos a simular la llamada a la API.
    // Esto te permite diseñar toda tu página sin depender del backend.
    
    function fetchMockNowPlayingData() {
        console.log("Buscando nueva canción...");

        // Simulamos una respuesta de API con datos falsos
        const mockData = {
            artist: "Los Prisioneros",
            song_title: "La Voz de los '80",
            album_art: "https://upload.wikimedia.org/wikipedia/fi/9/96/La_voz_de_los_80.jpg" // URL de imagen de ejemplo
        };

        // En un caso real, aquí harías:
        // const response = await fetch('https://api.turadio.com/nowplaying');
        // const data = await response.json();
        // updateUI(data);

        // Por ahora, usamos los datos falsos
        updateUI(mockData);
    }
    
    function updateUI(data) {
        songTitleEl.textContent = data.song_title;
        artistNameEl.textContent = data.artist;
        // Podríamos actualizar la carátula también, pero lo mantenemos simple por ahora.
    }

    // Llamamos a la función una vez al inicio para que no se vea vacío
    fetchMockNowPlayingData();

    // Y luego, la llamamos cada 15 segundos para simular la actualización en tiempo real
    setInterval(fetchMockNowPlayingData, 15000);
});