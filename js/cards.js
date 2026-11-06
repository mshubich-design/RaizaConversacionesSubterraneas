const imagenes = document.querySelectorAll('.imagen');

imagenes.forEach(imagen => {

    imagen.addEventListener('click', () => {
        let activeImagen = document.querySelector('.imagen--gigante');
        if (activeImagen && activeImagen !== imagen) {
            activeImagen.classList.remove('imagen--gigante');
        }
        imagen.classList.toggle('imagen--gigante');

    });

});
