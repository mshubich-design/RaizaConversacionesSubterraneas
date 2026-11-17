/* RAIZA · preloader del HOME (index). Es lo primero que se ve: pantalla verde con el logo y una
   barra de carga REAL que cuenta los bytes de las imágenes y espera estilos, scripts y tipografías.
   Al terminar quita la pantalla y lanza el evento 'raiza:loaded' (entonces aparece el popup). */
(function () {
  var root = document.documentElement;
  var A = window.RAIZA_LOADER_ART;           /* SVG del logo y de la punta (js/art/loader-art.js) */
  var BG = '#1e3029', CREAM = '#f4f0e5';
  var MIN_MS = 650, MAX_MS = 15000;

  var css = '#rzLoader{position:fixed;inset:0;z-index:100000;background:' + BG + ';display:flex;flex-direction:column;align-items:center;justify-content:center;gap:clamp(18px,3.4vh,34px);opacity:1;transition:opacity .45s ease;font-family:"RZ Display","Helvetica Neue",Helvetica,Arial,sans-serif}' +
    '#rzLoader.out{opacity:0;pointer-events:none}' +
    '#rzLoader .rzl-logo{width:min(44vw,420px);min-width:190px;height:auto;display:block;fill:' + CREAM + '}' +
    '#rzLoader .rzl-bar{position:relative;width:min(44vw,420px);min-width:190px;height:3px;margin:clamp(14px,2.4vh,24px) 0}' +
    '#rzLoader .rzl-track{position:absolute;inset:0;background:rgba(244,240,229,.22);border-radius:3px;overflow:hidden}' +
    '#rzLoader .rzl-fill{height:100%;width:0;background:' + CREAM + ';border-radius:3px}' +
    '#rzLoader .rzl-tip{position:absolute;top:50%;left:0;width:clamp(38px,5.4vw,58px);height:clamp(38px,5.4vw,58px);transform:translate(-50%,-50%);will-change:left}' +
    '#rzLoader .rzl-tip-svg{display:block;width:100%;height:100%;fill:' + CREAM + ';animation:rzlSpin 1.6s linear infinite}' +
    '@keyframes rzlSpin{to{transform:rotate(360deg)}}' +
    '@media (prefers-reduced-motion:reduce){#rzLoader .rzl-tip-svg{animation-duration:6s}}' +
    '#rzLoader .rzl-pct{color:' + CREAM + ';font-weight:700;font-size:13px;letter-spacing:.12em;margin-top:-4px;opacity:.8;font-variant-numeric:tabular-nums}' +
    'html.rzl-lock,html.rzl-lock body{overflow:hidden!important}';
  var st = document.createElement('style'); st.id = 'rzLoaderCss'; st.textContent = css;
  (document.head || root).appendChild(st);

  var el = null, fill = null, tipEl = null, pct = null, shownAt = 0, finished = false, shownFlag = false;

  function build() {
    if (el) return;
    el = document.createElement('div'); el.id = 'rzLoader';
    el.setAttribute('role', 'progressbar'); el.setAttribute('aria-label', 'Cargando');
    el.setAttribute('aria-valuemin', '0'); el.setAttribute('aria-valuemax', '100');
    el.innerHTML = A.logo +
      '<div class="rzl-bar"><div class="rzl-track"><div class="rzl-fill"></div></div><div class="rzl-tip">' + A.tip + '</div></div><div class="rzl-pct">0%</div>';
    root.appendChild(el);
    fill = el.querySelector('.rzl-fill'); tipEl = el.querySelector('.rzl-tip'); pct = el.querySelector('.rzl-pct');
    root.classList.add('rzl-lock');
    shownAt = performance.now(); shownFlag = true;
  }

  /* ── progreso real ── */
  var target = 0, shown = 0;
  var holds = {};                            /* trabajos extra (p. ej. datos de la red) */
  function holdCount() { var n = 0; for (var k in holds) if (holds[k]) n++; return n; }
  var parts = { dom: 0, res: 0, load: 0, fonts: 0 };
  var resBytes = [];                         /* {got,total,done} por recurso */
  var resCount = 0, resDone = 0, domReady = false, winLoaded = false, fontsDone = false;

  function recompute() {
    var res;
    if (!resBytes.length) res = domReady ? 1 : 0;
    else {
      var got = 0, tot = 0, known = 0, eqSum = 0;
      resBytes.forEach(function (r) { if (r.total > 0) { got += Math.min(r.got, r.total); tot += r.total; known++ } eqSum += r.done ? 1 : (r.total > 0 ? Math.min(1, r.got / r.total) : 0); });
      var eq = eqSum / resBytes.length;
      res = (known === resBytes.length && tot > 0) ? got / tot : eq;
      if (res > eq) res = (res + eq) / 2;    /* evita saltos cuando aún no se conocen todos los tamaños */
    }
    var p = (domReady ? 12 : 4) + 70 * res + (winLoaded ? 10 : 0) + (fontsDone ? 4 : 0);
    if (holdCount() > 0) p = Math.min(p, 96);
    if (winLoaded && fontsDone && holdCount() === 0 && resDone >= resCount) p = 100;
    target = Math.max(target, Math.min(100, p));
  }

  function trackImage(src) {
    var r = { got: 0, total: 0, done: false }; resBytes.push(r); resCount++;
    function fin() { if (!r.done) { r.done = true; r.got = r.total || r.got; resDone++; recompute(); } }
    if (!window.fetch || location.protocol === 'file:') { return { r: r, fin: fin, plain: true }; }
    fetch(src).then(function (resp) {
      r.total = +resp.headers.get('content-length') || 0;
      if (!resp.body || !resp.body.getReader) { return resp.blob().then(function () { fin(); }); }
      var rd = resp.body.getReader();
      (function pump() {
        rd.read().then(function (s) {
          if (s.done) { fin(); return; }
          r.got += s.value.length; if (!r.total) r.total = 0; recompute(); pump();
        }).catch(fin);
      })();
    }).catch(fin);
    return { r: r, fin: fin, plain: false };
  }

  function scan() {
    var seenSrc = {};
    var imgs = Array.prototype.slice.call(document.images);
    imgs.forEach(function (im) {
      var src = im.currentSrc || im.src; if (!src || seenSrc[src]) return; seenSrc[src] = 1;
      if (im.complete && im.naturalWidth) { resBytes.push({ got: 1, total: 1, done: true }); resCount++; resDone++; return; }
      var t = trackImage(src);
      if (t.plain) {                         /* file:// → cuenta por imagen */
        im.addEventListener('load', t.fin); im.addEventListener('error', t.fin);
      }
    });
    Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]')).forEach(function (l) {
      if (l.sheet) return;
      var r = { got: 0, total: 0, done: false }; resBytes.push(r); resCount++;
      var f = function () { if (!r.done) { r.done = true; resDone++; recompute(); } };
      l.addEventListener('load', f); l.addEventListener('error', f);
    });
    recompute();
  }

  function frame() {
    if (!el) return;
    var now = performance.now();
    var cap = 100;
    if (now - shownAt < MIN_MS) cap = Math.min(100, ((now - shownAt) / MIN_MS) * 100);  /* se alcanza a ver */
    var goal = Math.min(target, cap);
    shown += (goal - shown) * 0.14; if (goal - shown < 0.15) shown = goal;
    var v = Math.max(0, Math.min(100, shown));
    fill.style.width = v + '%'; tipEl.style.left = v + '%'; pct.textContent = Math.round(v) + '%';
    el.setAttribute('aria-valuenow', Math.round(v));
    if (!finished && v >= 99.9 && target >= 100) { finish(); return; }
    requestAnimationFrame(frame);
  }

  function finish() {
    finished = true;
    window.raizaLoaded = true;
    try { window.dispatchEvent(new Event('raiza:loaded')); } catch (e) {}   /* el popup se monta ya, debajo del preloader */
    el.classList.add('out');
    setTimeout(function () {
      if (el && el.parentNode) el.parentNode.removeChild(el); el = null;
      if (!document.getElementById('rzIntro')) root.classList.remove('rzl-lock');
    }, 480);
  }

  function start() {
    build();
    requestAnimationFrame(frame);
    setTimeout(function () { target = 100; winLoaded = fontsDone = true; holds = {}; }, MAX_MS);  /* tope de seguridad */
  }

  /* ── API para páginas con carga propia (datos, mapas…) ── */
  window.raizaLoader = {
    hold: function (k) { holds[k] = true; recompute(); },
    release: function (k) { holds[k] = false; recompute(); }
  };

  start();

  function onDom() {
    domReady = true; scan(); recompute();
    if (document.fonts && document.fonts.ready) {
      var all = []; try { document.fonts.forEach(function (f) { all.push(f.load().catch(function () {})); }); } catch (e) {}
      Promise.all(all).then(function () { return document.fonts.ready; }).then(function () { fontsDone = true; recompute(); });
    } else fontsDone = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onDom); else onDom();
  window.addEventListener('load', function () { winLoaded = true; recompute(); });
  if (document.readyState === 'complete') { winLoaded = true; recompute(); }

  /* volver con "atrás" (caché de página): quitar el preloader */
  window.addEventListener('pageshow', function (e) {
    if (e.persisted && el) { el.parentNode && el.parentNode.removeChild(el); el = null; root.classList.remove('rzl-lock'); }
  });
})();
