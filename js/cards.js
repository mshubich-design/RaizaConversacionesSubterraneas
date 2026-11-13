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

    const items = Array.from(grid.children).filter(
        node => node.classList && node.classList.contains('imagen')
    );

    requestAnimationFrame(() => {

        /* Limpiar estilos puestos directamente por JavaScript */
        items.forEach(item => {
            item.style.gridColumn = '';
            item.style.gridRow = '';
        });

        if (activeImagen) {

            /* CELULAR: 1 columna × 2 filas */
            if (window.innerWidth <= 480) {
                activeImagen.style.gridColumn = '1';
                activeImagen.style.gridRow = 'span 2';
            }

            /* TABLET PEQUEÑA / REGULAR: 2 columnas × 2 filas */
            else if (window.innerWidth <= 900) {
                activeImagen.style.gridColumn = 'span 2';
                activeImagen.style.gridRow = 'span 2';
            }

            /* TABLET GRANDE Y COMPUTADORA: 2 columnas × 2 filas */
            else {
                activeImagen.style.gridColumn = 'span 2';
                activeImagen.style.gridRow = 'span 2';
            }
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

function setupTheme() {
    const toggle = document.getElementById("themeToggle");
    const label = document.getElementById("themeLabel");
    const saved = localStorage.getItem("raiza-theme");
    setTheme(saved === "dark" ? "dark" : "light");
    toggle.addEventListener("click", () => {
      setTheme(root.dataset.theme === "light" ? "dark" : "light");
    });
    function setTheme(theme) {
      root.dataset.theme = theme;
      label.textContent = theme === "light" ? "BOSQUE" : "SUBSUELO";
      document.querySelector('meta[name="theme-color"]').content = theme === "light" ? "#05180d" : "#f1f2e0";
      localStorage.setItem("raiza-theme", theme);
    }
  }

updateGridLayout();

