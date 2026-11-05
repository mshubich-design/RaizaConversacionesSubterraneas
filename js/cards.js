const imagenes = document.querySelectorAll('.imagen');

imagenes.forEach(imagen => {

    imagen.addEventListener('click', () => {

        imagen.classList.toggle('imagen--gigante');

    });

});
