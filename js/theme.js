/* RAIZA · tema compartido (Bosque ⇄ Subsuelo) para index, redes y banco.
   Guarda la elección en localStorage y se sincroniza entre páginas y pestañas. */
(function () {
  var KEY = 'raiza-theme';
  var root = document.documentElement;

  function read() {
    try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }

  function paint(theme) {
    root.setAttribute('data-theme', theme);
    var dark = theme === 'dark';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#0f231a;' : '#738d66');
    var buttons = document.querySelectorAll('.nav__toggle');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', dark);
      var label = buttons[i].querySelector('#themeLabel') || buttons[i];
      label.textContent = dark ? 'Bosque' : 'Subsuelo';   /* muestra a dónde cambia */
    }
  }

  function set(theme) {
    paint(theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
  }

  paint(read());                                    /* antes de pintar: sin parpadeo */

  document.addEventListener('DOMContentLoaded', function () {
    paint(read());
    var buttons = document.querySelectorAll('.nav__toggle');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      });
    }
  });

  window.addEventListener('storage', function (e) {  /* otra pestaña cambió el tema */
    if (e.key === KEY) paint(read());
  });
  window.addEventListener('pageshow', function () { paint(read()); });  /* volver con "atrás" */
})();
