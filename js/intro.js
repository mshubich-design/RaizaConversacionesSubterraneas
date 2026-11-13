/* RAIZA · popup de introducción del home. Aparece cuando termina el preloader (en cada carga o refresh) y se cierra con la X o Esc. */
(function () {
  var root = document.documentElement, KEY = 'raiza-intro';
  var CSS = '' +
  '#rzIntro{position:fixed;inset:0;z-index:99999;background:#19271e;color:#f4f0e5;overflow:hidden;opacity:0;transition:opacity .4s ease;' +
    '--pu:min(calc(100vw / 2576),calc(100vh / 1449));font-family:"RZ Text","Helvetica Neue",Helvetica,Arial,sans-serif}' +
  '#rzIntro.on{opacity:1}#rzIntro.off{opacity:0;pointer-events:none}' +
  '#rzIntro .st{position:absolute;left:50%;top:50%;width:calc(2576 * var(--pu));height:calc(1449 * var(--pu));transform:translate(-50%,-50%)}' +
  '#rzIntro .a{position:absolute;margin:0}' +
  '#rzIntro .ttl{left:calc(98 * var(--pu));top:calc(146 * var(--pu));width:calc(780 * var(--pu));font-family:"RZ Display","Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:800;font-size:calc(46 * var(--pu));line-height:calc(55 * var(--pu));text-transform:uppercase;letter-spacing:-.012em}' +
  '#rzIntro .ttl b{font-weight:800;color:#738d66}' +
  '#rzIntro h3{margin:0;font-family:"RZ Display","Helvetica Neue",Helvetica,Arial,sans-serif;font-weight:700;font-size:calc(33 * var(--pu));line-height:calc(40 * var(--pu));letter-spacing:-.005em}' +
  '#rzIntro p.t{margin:0;font-weight:400;font-size:calc(32 * var(--pu));line-height:calc(38.8 * var(--pu));letter-spacing:-.012em}' +
  '#rzIntro .ph{left:calc(934 * var(--pu));top:calc(162 * var(--pu));width:calc(748 * var(--pu));height:calc(1122 * var(--pu));object-fit:cover;display:block}' +
  '#rzIntro .ic{display:block;height:auto}' +
  '#rzIntro .ln{height:calc(3 * var(--pu));background:#f4f0e5}' +
  '#rzIntro .hd{width:0;height:0;border-top:calc(11 * var(--pu)) solid transparent;border-bottom:calc(11 * var(--pu)) solid transparent}' +
  '#rzIntro .x{position:absolute;right:calc(52 * var(--pu));top:calc(40 * var(--pu));width:calc(64 * var(--pu));height:calc(64 * var(--pu));min-width:34px;min-height:34px;border:0;background:none;cursor:pointer;z-index:3;padding:0;color:#f4f0e5}' +
  '#rzIntro .x:before,#rzIntro .x:after{content:"";position:absolute;left:12%;right:12%;top:50%;height:max(2px,calc(3.4 * var(--pu)));background:currentColor;transform:rotate(45deg)}' +
  '#rzIntro .x:after{transform:rotate(-45deg)}' +
  '#rzIntro .x:hover{opacity:.7}#rzIntro .x:focus-visible{outline:2px solid #738d66;outline-offset:4px}' +
  '#rzIntro .m{display:none}' +
  /* móvil / vertical: columna legible */
  '@media (max-width:900px),(max-aspect-ratio:1/1){' +
    '#rzIntro{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}' +
    '#rzIntro .st{display:none}#rzIntro .m{display:block;position:relative;padding:max(64px,9vh) 24px 56px;max-width:560px;margin:0 auto}' +
    '#rzIntro .m .ttl{position:static;width:auto;font-size:clamp(23px,6.4vw,34px);line-height:1.2;margin:0 0 30px}' +
    '#rzIntro .m h3{font-size:18px;line-height:1.3;margin:0 0 8px}' +
    '#rzIntro .m p.t{font-size:15.5px;line-height:1.5;margin:0}' +
    '#rzIntro .m section{margin:0 0 28px}' +
    '#rzIntro .m .ph{position:static;width:100%;height:auto;aspect-ratio:2/3;max-height:62vh;margin:6px 0 30px}' +
    '#rzIntro .m .row{display:flex;align-items:center;gap:14px;margin:0 0 28px}' +
    '#rzIntro .m .row .ic{width:84px;flex:none}' +
    '#rzIntro .m .row .ln{flex:1;height:2px}' +
    '#rzIntro .m .row.r{flex-direction:row-reverse}' +
    '#rzIntro .m .row .ln{position:relative}' +
    '#rzIntro .m .row .ln:before{content:"";position:absolute;left:-1px;top:50%;transform:translateY(-50%);border-top:6px solid transparent;border-bottom:6px solid transparent;border-right:11px solid #f4f0e5}' +
    '#rzIntro .m .row.r .ln:before{left:auto;right:-1px;border-right:0;border-left:11px solid #f4f0e5}' +
    '#rzIntro .x{right:14px;top:12px;width:40px;height:40px}' +
  '}' +
  'html.rzi-lock,html.rzi-lock body{overflow:hidden!important}';

  var L = {
    t1: 'La investigación se concentra exclusivamente<br>en el Parque Nacional Desierto de los Leones,<br>estudiando las relaciones ecológicas<br>que se desarrollan dentro de este bosque,<br>sin generalizarlas a otros ecosistemas.',
    t2: 'Se explora la Wood Wide Web a través<br>de las conexiones subterráneas entre<br>hongos y árboles como pinos (<i style="font-style:normal">Pinus</i>),<br>y encinos (<i style="font-style:normal">Quercus</i>).',
    t3: 'El enfoque principal es la relación entre<br>hongos y árboles mediante las micorrizas,<br>donde ambos organismos intercambian<br>recursos esenciales para su desarrollo.',
    t4: 'RAIZA busca hacer visible el mundo<br>subterráneo del bosque, explorando<br>las redes de micelio, las asociaciones<br>entre organismos y los procesos<br>de descomposición que mantienen<br>vivo el ecosistema.'
  };
  var TITLE = 'Explora las conversaciones<br>subterráneas del <b>Desierto<br>de los Leones</b> a través<br>de sus <b>hongos</b>, sus <b>funciones<br>y las relaciones</b> que<br>establecen con los árboles<br>de este <b>bosque.</b>';
  var TITLE_M = 'Explora las conversaciones subterráneas del <b>Desierto de los Leones</b> a través de sus <b>hongos</b>, sus <b>funciones y las relaciones</b> que establecen con los árboles de este <b>bosque.</b>';

  function html() {
    return '' +
    '<button class="x" type="button" aria-label="Cerrar introducción"></button>' +
    '<div class="st">' +
      '<h1 class="a ttl" id="rziT">' + TITLE + '</h1>' +
      '<div class="a" style="left:calc(98 * var(--pu));top:calc(616 * var(--pu))"><h3>1. Un ecosistema específico</h3></div>' +
      '<p class="a t" style="left:calc(98 * var(--pu));top:calc(693 * var(--pu))">' + L.t1 + '</p>' +
      '<img class="a ph" src="img/popup/bosque.jpg" alt="Tronco cubierto de musgo en el Desierto de los Leones">' +
      '<div class="a" style="left:calc(1818 * var(--pu));top:calc(104 * var(--pu))"><h3>2. La Wood Wide Web</h3></div>' +
      '<p class="a t" style="left:calc(1818 * var(--pu));top:calc(181 * var(--pu))">' + L.t2 + '</p>' +
      '<img class="a ic" src="img/popup/raices.png" alt="" style="left:calc(1995 * var(--pu));top:calc(435 * var(--pu));width:calc(290 * var(--pu))">' +
      '<div class="a ln" style="left:calc(1412 * var(--pu));top:calc(545 * var(--pu));width:calc(480 * var(--pu))"></div>' +
      '<div class="a hd" style="left:calc(1890 * var(--pu));top:calc(535 * var(--pu));border-left:calc(24 * var(--pu)) solid #f4f0e5"></div>' +
      '<div class="a" style="left:calc(1838 * var(--pu));top:calc(716 * var(--pu))"><h3>3. La relación hongo-árbol</h3></div>' +
      '<p class="a t" style="left:calc(1838 * var(--pu));top:calc(795 * var(--pu))">' + L.t3 + '</p>' +
      '<div class="a" style="left:calc(1838 * var(--pu));top:calc(1020 * var(--pu))"><h3>4. Lo que ocurre bajo nuestros pies</h3></div>' +
      '<p class="a t" style="left:calc(1838 * var(--pu));top:calc(1098 * var(--pu))">' + L.t4 + '</p>' +
      '<img class="a ic" src="img/popup/hongo.png" alt="" style="left:calc(225 * var(--pu));top:calc(985 * var(--pu));width:calc(285 * var(--pu))">' +
      '<div class="a ln" style="left:calc(612 * var(--pu));top:calc(1027 * var(--pu));width:calc(480 * var(--pu))"></div>' +
      '<div class="a hd" style="left:calc(588 * var(--pu));top:calc(1017 * var(--pu));border-right:calc(24 * var(--pu)) solid #f4f0e5"></div>' +
    '</div>' +
    '<div class="m">' +
      '<h1 class="a ttl">' + TITLE_M + '</h1>' +
      '<section><h3>1. Un ecosistema específico</h3><p class="t">' + L.t1.replace(/<br>/g, ' ') + '</p></section>' +
      '<div class="row"><img class="ic" src="img/popup/hongo.png" alt=""><div class="ln"></div></div>' +
      '<img class="ph" src="img/popup/bosque.jpg" alt="Tronco cubierto de musgo en el Desierto de los Leones">' +
      '<section><h3>2. La Wood Wide Web</h3><p class="t">' + L.t2.replace(/<br>/g, ' ') + '</p></section>' +
      '<div class="row r"><img class="ic" src="img/popup/raices.png" alt=""><div class="ln"></div></div>' +
      '<section><h3>3. La relación hongo-árbol</h3><p class="t">' + L.t3.replace(/<br>/g, ' ') + '</p></section>' +
      '<section><h3>4. Lo que ocurre bajo nuestros pies</h3><p class="t">' + L.t4.replace(/<br>/g, ' ') + '</p></section>' +
    '</div>';
  }

  function show() {
  var st = document.createElement('style'); st.textContent = CSS; (document.head || root).appendChild(st);
  var box = document.createElement('div');
  box.id = 'rzIntro'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'rziT');
  box.innerHTML = html();
  root.appendChild(box); root.classList.add('rzi-lock');
  requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('on'); }); });

  var closeBtn = box.querySelector('.x'); box.tabIndex = -1; box.style.outline = 'none'; box.focus({ preventScroll: true });

  /* que el scroll del fondo (incl. el suave del home) no se mueva mientras el popup está abierto */
  box.addEventListener('wheel', function (e) { if (!box.scrollHeight || box.scrollHeight <= box.clientHeight + 1) e.preventDefault(); else e.stopPropagation(); }, { passive: false });

  function close() {
    box.classList.remove('on'); box.classList.add('off');
    root.classList.remove('rzi-lock');
    document.removeEventListener('keydown', key);
    setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); if (st.parentNode) st.parentNode.removeChild(st); }, 450);
  }
  function key(e) { if (e.key === 'Escape') close(); }
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', key);
  }

  if (window.raizaLoaded || !window.raizaLoader) show();
  else window.addEventListener('raiza:loaded', show, { once: true });
})();
