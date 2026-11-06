const tarjetas = document.querySelectorAll('.tarjeta-hongo');
const contenedorTarjetas = document.querySelector('.tarjetas-info');
const imagenes = document.querySelectorAll('.imagen');

imagenes.forEach(imagen => {

    imagen.addEventListener('click', () => {
        let activeImagen = document.querySelector('.imagen--gigante');
        if (activeImagen && activeImagen !== imagen) {
            activeImagen.classList.remove('imagen--gigante');

            const tarjetaAnterior = activeImagen.querySelector('.tarjeta-hongo');

            if (tarjetaAnterior) {
                contenedorTarjetas.appendChild(tarjetaAnterior);
                tarjetaAnterior.classList.add('oculto');
            }
        }

        const estabaGrande = imagen.classList.contains('imagen--gigante');
        imagen.classList.toggle('imagen--gigante');

        const idHongo = imagen.dataset.hongo;

        const tarjetaActual = Array.from(tarjetas).find(tarjeta => {
            return tarjeta.dataset.hongo === idHongo;
        });

        if (tarjetaActual) {

            if (estabaGrande) {
                // Si se reduce la imagen, regresar y ocultar la tarjeta
                contenedorTarjetas.appendChild(tarjetaActual);
                tarjetaActual.classList.add('oculto');

            } else {
                // Si crece la imagen, colocar la tarjeta encima
                tarjetaActual.classList.remove('oculto');
                imagen.appendChild(tarjetaActual);
            }

        }

    });

});

