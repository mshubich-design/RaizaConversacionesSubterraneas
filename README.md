# RAIZA · Conversaciones subterráneas

Sitio estático (HTML + CSS + JS, sin build). Para verlo completo ábrelo con un servidor local
(por ejemplo *Live Server* en VS Code o `python3 -m http.server`) y entra a `index.html`.

## Estructura

```
index.html        Home (preloader + popup + raíces que crecen con el scroll)
redes.html        Red subterránea interactiva (D3)
banco.html        Banco de hongos
contacto.html     Contacto

css/
  fonts.css       Tipografías locales
  style.css       Barra superior y tema (compartido por todas las páginas)
  index.css       Home
  redes.css       Red subterránea
  banco.css       Banco de hongos
  contacto.css    Contacto

js/
  theme.js        Tema Bosque ⇄ Subsuelo (todas las páginas)
  index.js        Home: scroll suave, botón «volver arriba», crecimiento de raíces
  loader.js       Preloader del home (barra de carga real)
  intro.js        Popup de introducción del home
  redes.js        Red subterránea
  banco.js        Banco de hongos
  art/            Ilustraciones SVG que cambian con el tema (home, loader, contacto)

data/             Datos de hongos y relaciones (JSON)
img/              home/ · banco/ · popup/
fonts/            Tipografías .woff
```

## Colores
Crema `#f4f0e5` · Verde `#738d66` · Oscuro `#0e231a`

## Notas
- La red (`redes.html`) carga D3 desde CDN y el banco carga Masonry desde CDN: necesitan internet.
- Las ilustraciones SVG viven en `js/art/` porque su color y animación dependen del tema.
