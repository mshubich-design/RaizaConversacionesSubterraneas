/* RAIZA · home: escala de diseño, scroll suave, botón «volver arriba» y raíces que crecen con el scroll.
   Las ilustraciones SVG vienen de js/art/home-art.js. */
(function(){
  /* ── pinta las ilustraciones SVG antes de buscar las raíces ── */
  document.getElementById('roots').innerHTML = RAIZA_ART.roots;
  document.querySelector('#hongo').innerHTML = RAIZA_ART.hongo;

  var root=document.documentElement, body=document.body;
  body.classList.remove('no-js');
  var reduced=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) body.classList.add('reduced');

  /* ── unidad de diseño exacta (sin la barra de scroll) ── */
  function setU(){
    var w=root.clientWidth;
    if(w>900) root.style.setProperty('--u',Math.min(w/1068,1.8)+'px'); else root.style.removeProperty('--u');
  }

  /* ── scroll suave tipo Lenis: la rueda mueve un destino y la página lo persigue con inercia ── */
  var S={cur:0,tgt:0,run:false,set:0,last:0}, SMOOTH_TAU=.075;   /* SMOOTH_TAU: más alto = más "flotado" */
  var WHEEL=1.1;   /* WHEEL: qué tanto avanza cada giro de la rueda */
  var smooth=!reduced&&!(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
  function maxS(){return Math.max(0,document.documentElement.scrollHeight-innerHeight)}
  function sloop(ts){
    var dt=Math.min(.05,Math.max(.001,(ts-S.last)/1000)); S.last=ts;
    S.cur+=(S.tgt-S.cur)*(1-Math.exp(-dt/SMOOTH_TAU));
    if(Math.abs(S.tgt-S.cur)<.4){S.cur=S.tgt;S.run=false}
    S.set=S.cur; window.scrollTo({top:S.cur,behavior:'instant'}); sync();
    if(S.run) requestAnimationFrame(sloop);
  }
  function glideTo(y){S.tgt=Math.max(0,Math.min(maxS(),y)); if(!S.run){S.cur=window.scrollY;S.run=true;S.last=performance.now();requestAnimationFrame(sloop)}}
  if(smooth){
    window.addEventListener('wheel',function(e){
      if(e.ctrlKey||e.defaultPrevented) return;
      e.preventDefault();
      var dy=(e.deltaMode===1?e.deltaY*34:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY)*WHEEL;
      glideTo((S.run?S.tgt:window.scrollY)+dy);
    },{passive:false});
    window.addEventListener('scroll',function(){      /* teclado, barra de scroll… : sincroniza */
      if(S.run&&Math.abs(window.scrollY-S.set)>3){S.run=false}
    },{passive:true});
  }
  function toTop(e){if(e)e.preventDefault(); if(smooth)glideTo(0); else window.scrollTo({top:0,behavior:reduced?'auto':'smooth'})}
  document.getElementById('hongo').addEventListener('click',toTop);
  document.getElementById('hongoHint').addEventListener('click',toTop);
  document.querySelector('.nav__mark').addEventListener('click',toTop);

  /* ── las raíces CRECEN desde el logo.svg conforme bajas ──
     Un solo árbol conectado: cada trazo sabe a qué profundidad empieza y termina. El frente de crecimiento baja
     lineal con el scroll: en cero no hay raíces y llegan al fondo justo cuando llegas al final de la página. */
  var gens=[], F0=Infinity, F1=0;
  Array.prototype.forEach.call(document.querySelectorAll('#rzGen path'),function(p){
    var o={p:p,s:+p.getAttribute('data-s'),e:+p.getAttribute('data-e'),v:-1}; gens.push(o);
    if(o.s<F0)F0=o.s; if(o.e>F1)F1=o.e;
  });
  F0-=1; F1+=1;
  var g={max:1,t0:0,f:0,run:false};
  function target(now){
    if(reduced) return 1;
    var f;
    if(g.max>=150) f=window.scrollY/g.max;
    else{ /* página casi sin scroll (celular): crece sola al empezar a tocar/scroll o tras unos segundos */
      var a=(now-g.t0-1500)/9000;
      f=Math.max(a,window.scrollY/Math.max(1,g.max));
    }
    return Math.min(1,Math.max(0,f));
  }
  function render(){
    var F=F0+(F1-F0)*g.f;
    for(var i=0;i<gens.length;i++){
      var o=gens[i], p=F<=o.s?0:F>=o.e?1:(F-o.s)/(o.e-o.s);
      if(p!==o.v){
        if(p<=0){o.p.style.visibility='hidden'}
        else{o.p.style.visibility='visible';o.p.style.strokeDashoffset=(1-p).toFixed(4)}
        o.v=p;
      }
    }
  }
  /* móvil: las raíces persiguen al scroll con retraso suave y velocidad máxima, así crecen más lento que el dedo */
  var mq=window.matchMedia&&matchMedia("(max-width:900px)"), MTAU=.42, MMAX=.42;  /* MTAU: más alto = más retraso · MMAX: fracción máxima del crecimiento por segundo */
  g.tf=0; g.a=false; g.l=0;
  function anim(ts){
    var dt=Math.min(.05,Math.max(.001,(ts-g.l)/1000)); g.l=ts;
    var d=g.tf-g.f, st=d*(1-Math.exp(-dt/MTAU)), cap=MMAX*dt;
    if(st>cap)st=cap; else if(st<-cap)st=-cap;
    g.f+=st; if(Math.abs(g.tf-g.f)<.0004)g.f=g.tf;
    render();
    if(g.f!==g.tf) requestAnimationFrame(anim); else g.a=false;
  }
  function follow(f){
    if(reduced||!(mq&&mq.matches)){ g.tf=g.f=f; render(); return }
    g.tf=f; if(!g.a){g.a=true;g.l=performance.now();requestAnimationFrame(anim)}
  }
  function loop(ts){
    follow(target(ts));
    if(g.max<150&&!reduced&&(ts-g.t0)<11000) requestAnimationFrame(loop); else g.run=false;
  }
  function update(){ if(!g.run){g.run=true;requestAnimationFrame(loop)} }
  function sync(){var f=target(performance.now()); if(f!==g.tf)follow(f)}
  function measure(){
    g.max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    if(!g.t0) g.t0=performance.now();
    sync(); update();
  }
  function onScroll(){sync()}
  window.addEventListener('scroll',onScroll,{passive:true});
  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){setU();measure()},80)});
  setU();measure();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(measure);
  window.addEventListener('load',measure);
})();
