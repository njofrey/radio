document.addEventListener('DOMContentLoaded', () => {

    const audioPlayer = document.getElementById('audio-player');
    const songTitleEl = document.getElementById('song-title');
    const artistNameEl = document.getElementById('artist-name');

    // URL de stream HTTPS segura y estable para la prueba.
    const streamUrl = 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one';
    
    // Asignamos el stream al reproductor.
    audioPlayer.src = streamUrl;

    // Simulación de datos "Ahora Suena" para el diseño visual.
    function fetchMockNowPlayingData() {
        const mockData = {
            artist: "BBC Radio 1",
            song_title: "Live from London",
        };
        updateUI(mockData);
    }
    
    function updateUI(data) {
        songTitleEl.textContent = data.song_title;
        artistNameEl.textContent = data.artist;
    }

    // Ejecutamos las funciones.
    fetchMockNowPlayingData();
    setInterval(fetchMockNowPlayingData, 15000);
});
