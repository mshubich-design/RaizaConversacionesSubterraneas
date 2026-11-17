const grid = document.querySelector('.grid');
const contenedorTarjetas = document.querySelector('.tarjetas-info');
const imagenes = Array.from(document.querySelectorAll('.imagen'));
const tarjetas = Array.from(document.querySelectorAll('.tarjeta-hongo'));

let activeImagen = null;

function resetActiveCard() {
    const imagenActiva = document.querySelector('.imagen--gigante');
    if (!imagenActiva) return;

    imagenActiva.classList.remove('imagen--gigante');
    const tarjetaActiva = imagenActiva.querySelector('.tarjeta-hongo');
    if (tarjetaActiva) {
        tarjetaActiva.classList.add('oculto');
        contenedorTarjetas.appendChild(tarjetaActiva);
    }
}

function updateGridLayout() {
    if (!grid) return;

    const items = Array.from(grid.children).filter(node => node.classList && node.classList.contains('imagen'));
    requestAnimationFrame(() => {
        items.forEach(item => {
            item.style.gridColumn = '';
            item.style.gridRow = '';
        });

        if (activeImagen) {
            activeImagen.style.gridColumn = 'span 2';
            activeImagen.style.gridRow = 'span 2';
        }
    });
}

imagenes.forEach(imagen => {
    imagen.addEventListener('click', () => {
        const idHongo = imagen.dataset.hongo;
        const tarjetaHongo = tarjetas.find(tarjeta => tarjeta.dataset.hongo === idHongo);

        if (activeImagen && activeImagen !== imagen) {
            resetActiveCard();
        }

        const estaActiva = imagen.classList.contains('imagen--gigante');

        if (estaActiva) {
            imagen.classList.remove('imagen--gigante');
            if (tarjetaHongo) {
                tarjetaHongo.classList.add('oculto');
                contenedorTarjetas.appendChild(tarjetaHongo);
            }
            activeImagen = null;
        } else {
            imagen.classList.add('imagen--gigante');
            if (tarjetaHongo) {
                tarjetaHongo.classList.remove('oculto');
                imagen.appendChild(tarjetaHongo);
            }
            activeImagen = imagen;
        }

        updateGridLayout();
    });
});

updateGridLayout();

