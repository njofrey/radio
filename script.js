document.addEventListener('DOMContentLoaded', () => {

    const audioPlayer = document.getElementById('audio-player');
    const songTitleEl = document.getElementById('song-title');
    const artistNameEl = document.getElementById('artist-name');

    // --- ¡CAMBIO IMPORTANTE! ---
    // Agregamos una URL de un stream público para que la radio suene de verdad.
    // Esta es una estación de Lofi, ideal para probar.
    const streamUrl = 'http://stream.lofi-radio.com:8000/lofi_128'; 
    
    // Asignamos el stream al reproductor para que funcione al darle play.
    audioPlayer.src = streamUrl;

    // --- MANTENEMOS LA SIMULACIÓN DE DATOS "AHORA SUENA" ---
    // ¿Por qué? Porque este stream público no nos dice fácilmente qué canción suena.
    // Nuestro sistema de simulación sigue siendo perfecto para diseñar la parte visual.
    // Cuando contrates tu servicio de radio profesional, ellos sí te darán la API
    // para mostrar la canción real.
    
    function fetchMockNowPlayingData() {
        const mockData = {
            artist: "Jorge González",
            song_title: "Fe",
        };
        updateUI(mockData);
    }
    
    function updateUI(data) {
        songTitleEl.textContent = data.song_title;
        artistNameEl.textContent = data.artist;
    }

    // Actualizamos la info visual al cargar la página
    fetchMockNowPlayingData();
    // Y la actualizamos periódicamente para que parezca viva
    setInterval(fetchMockNowPlayingData, 15000);
});
