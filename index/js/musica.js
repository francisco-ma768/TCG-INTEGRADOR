// Evita que la música se duplique
if (!window.musicaFondo) {

    window.musicaFondo = new Audio("assets/tribal-war-chant.mp3");
    window.musicaFondo.loop = true;
    window.musicaFondo.volume = 1;

    window.musicaFondo.play().catch(() => {
        console.log("Autoplay bloqueado");
    });
}

// Función para pausar desde otras páginas
window.pausarMusica = () => {
    if (window.musicaFondo) {
        window.musicaFondo.pause();
    }
};

// Función para reanudar desde otras páginas
window.reanudarMusica = () => {
    if (window.musicaFondo) {
        window.musicaFondo.play();
    }
};
