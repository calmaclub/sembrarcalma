// respiracion.js · el círculo que respira (Sembrar Calma).
// Es una extensión: NO cambia ui.js. Si un ejercicio trae "respiracion" en contenido.js, la rutina guiada muestra
// un círculo que crece al inhalar, se queda quieto al sostener y se encoge al exhalar, con el conteo de cada respiración.
// En esas rutinas, los momentos sin "respiracion" (Prepárate, Llega…) muestran el círculo latiendo suave con la cuenta regresiva.
//
// Formato en contenido.js:  respiracion: [ ['Inhala', 4, 1], ['Sostén', 4], ['Exhala', 6, 0.45] ]
//   [texto que se ve, segundos, tamaño del círculo al terminar (1 = grande, 0.45 = pequeño; sin número = se queda quieto)]

(function () {
  'use strict';
  if (!window.UI || !UI.rutinaGuiada) return;
  const original = UI.rutinaGuiada;
  const { esc, anillo, toque } = UI;

  const estilo = document.createElement('style');
  estilo.textContent = `
    .rg-resp { position: relative; width: var(--tam); height: var(--tam); display: grid; place-items: center; margin: 6px auto 26px; }
    .rg-bola { width: 100%; height: 100%; border-radius: 50%; transform: scale(.45); will-change: transform;
      background: #f6dde6;
      background: radial-gradient(circle, #fff 0 30%,
        color-mix(in srgb, var(--principal) 8%, #fff) 30% 48%,
        color-mix(in srgb, var(--principal) 15%, #fff) 48% 68%,
        color-mix(in srgb, var(--principal) 24%, #fff) 68% 100%);
      box-shadow: 0 18px 50px rgba(196, 70, 107, .18); }
    .rg-guia { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; opacity: 0; transition: opacity .9s ease;
      border: 1.5px solid rgba(196, 70, 107, .28); }
    .rg-guia-2 { inset: -12px; border-color: rgba(143, 184, 234, .45); }
    [data-fase="baja"] .rg-guia { opacity: 1; }
    [data-fase="baja"] .rg-guia-2 { opacity: .8; }
    .rg-paso { margin: 0 0 6px; font-size: clamp(28px, 8vw, 38px); }
    .rg-cuenta { margin: 0 0 6px; font: 600 46px/1 var(--fuente-titulos); color: var(--principal); font-variant-numeric: tabular-nums; }
    .rg-tiempo { margin: 0; font-variant-numeric: tabular-nums; }
    .rg-quieta { animation: rg-latido 4s ease-in-out infinite; }
    @keyframes rg-latido { 0%, 100% { transform: scale(.58); } 50% { transform: scale(.66); } }
    .rg-frase { margin: 18px auto 0; max-width: 320px; font: 500 21px/1.4 var(--fuente-titulos); color: var(--principal); animation: aparece .8s var(--ease) both; }
    .rg-intro-lista { list-style: none; padding: 0; margin: 0 auto 18px; max-width: 340px; text-align: left; }
    .rg-intro-lista li { display: flex; justify-content: space-between; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--borde); }
    .rg-num { position: absolute; font: 600 56px/1 var(--fuente-titulos); color: var(--principal); font-variant-numeric: tabular-nums; }
  `;
  document.head.appendChild(estilo);

  const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const esResp = (x) => x && x.tipo === 'ejercicio' && Array.isArray(x.respiracion) && x.respiracion.length > 0;
  const pasosDe = (x) => x.respiracion.map(([t, s, e]) => ({ t, s: Math.max(1, Number(s) || 1), e: e == null ? null : Number(e) }));

  function rutinaGuiada(b, op = {}) {
    const ej = b.ejercicios || [];
    if (!ej.some((e) => Array.isArray(e.respiracion) && e.respiracion.length)) return original(b, op);

    const resolver = op.resolverMedio || ((src) => src);
    const rondas = b.rondas || 1, descanso = b.descanso || 0;
    const fases = [{ tipo: 'listo', nombre: 'Prepárate', segundos: 5, siguiente: ej[0] }];
    for (let r = 0; r < rondas; r++) ej.forEach((e, k) => {
      fases.push({ tipo: 'ejercicio', ...e, ronda: r + 1, segundos: e.segundos || 30 });
      const ultimo = r === rondas - 1 && k === ej.length - 1;
      if (!ultimo && descanso) fases.push({ tipo: 'descanso', nombre: 'Descansa', segundos: descanso, siguiente: ej[(k + 1) % ej.length] });
    });

    let f = 0, restante = fases[0].segundos, pausa = false, timer = null, wake = null, pasoActual = -1;
    const ultimaFase = fases.length - 1;
    const frases = (window.APP && Array.isArray(APP.frasesCierre) && APP.frasesCierre.length) ? APP.frasesCierre : ['Gracias por regalarte este momento.'];
    const frase = frases[Math.floor(Math.random() * frases.length)];
    const capa = document.createElement('div');
    capa.style.cssText = 'position:fixed;inset:0;z-index:70;background:#F7F4FA;background-image:linear-gradient(180deg, rgba(178,208,245,.60) 0%, rgba(247,244,250,0) 34%, rgba(247,244,250,0) 70%, rgba(244,182,198,.40) 100%);display:flex;flex-direction:column;padding:max(14px,env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));animation:aparece .3s var(--ease) both';
    document.body.appendChild(capa);
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } catch {}

    let audio = null;
    const tono = (freq, dur, vol) => { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = freq; g.gain.setValueAtTime(vol, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + dur);
      o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + dur + .02); } catch {} };
    const pitido = (alto) => tono(alto ? 1046 : 784, .18, .18);
    const cerrar = () => { clearInterval(timer); capa.remove(); try { wake && wake.release(); } catch {} };

    function pintar() {
      const x = fases[f];
      pasoActual = -1;
      const resp = esResp(x);
      const tam = Math.min(250, innerWidth - 110);
      const color = x.tipo === 'descanso' ? 'var(--ok)' : x.tipo === 'listo' ? 'var(--acento)' : 'var(--principal)';
      const sig = x.tipo === 'ejercicio' ? fases.slice(f + 1).find((y) => y.tipo === 'ejercicio') : x.siguiente;
      const centro = resp
        ? `<p class="micro" style="color:${color};margin:0 0 10px">${esc(x.nombre)}</p>
           <div class="rg-resp" style="--tam:${tam}px">
             <span class="rg-guia"></span><span class="rg-guia rg-guia-2"></span>
             <span class="rg-bola" data-bola></span>
           </div>
           <h1 class="rg-paso" data-paso>&nbsp;</h1>
           <p class="rg-cuenta" data-cuenta>&nbsp;</p>
           <p class="suave chico rg-tiempo" data-tiempo>${mmss(restante)}</p>`
        : `<p class="micro" style="color:${color};margin:0 0 10px">${x.tipo === 'descanso' ? 'Descanso' : x.tipo === 'listo' ? 'Empezamos en' : 'Ahora'}</p>
           <div class="rg-resp" style="--tam:${tam}px">
             <span class="rg-bola rg-quieta"></span>
             <span class="rg-num" data-num>${restante}</span>
           </div>
           <h1 class="rg-paso">${esc(x.nombre)}</h1>`;
      capa.innerHTML = `
        <div class="barra"><button class="boton texto gris" data-g="cerrar">Cerrar</button>
          <span class="suave chico" style="font-variant-numeric:tabular-nums">${x.ronda && rondas > 1 ? `Ronda ${x.ronda} de ${rondas}` : ''}</span></div>
        <div class="progreso" style="margin:6px 0 0"><i style="width:${Math.round((f / fases.length) * 100)}%"></i></div>
        <div class="centro" style="align-items:center;text-align:center">
          ${x.video ? `<video data-src="${esc(x.video)}" autoplay muted loop playsinline style="width:100%;max-width:360px;border-radius:var(--radio);margin-bottom:18px;background:#000"></video>` : ''}
          ${centro}
          ${x.nota && x.tipo === 'ejercicio' ? `<p class="suave" style="margin:16px 0 0;max-width:340px">${esc(x.nota)}</p>` : ''}
          ${f === ultimaFase ? `<p class="rg-frase">${esc(frase)}</p>` : ''}
          ${sig ? `<p class="suave chico" style="margin:12px 0 0">Sigue: <strong style="color:var(--texto)">${esc(sig.nombre)}</strong></p>` : ''}
        </div>
        <div style="display:flex;gap:12px;max-width:var(--ancho);width:100%;margin:0 auto">
          <button class="boton secundario" data-g="atras" aria-label="Anterior" style="width:64px">⏮</button>
          <button class="boton" data-g="pausa" style="flex:1">${pausa ? '▶︎ Seguir' : '❚❚ Pausa'}</button>
          <button class="boton secundario" data-g="saltar" aria-label="Siguiente" style="width:64px">⏭</button>
        </div>`;
      capa.querySelectorAll('[data-src]').forEach(async (el) => { el.src = (await resolver(el.dataset.src)) || ''; });
      capa.dataset.fase = '';
      if (resp) respirar(true);
    }

    // Calcula en qué parte de la respiración va (inhala, sostén, exhala) y mueve el círculo.
    function respirar(forzar) {
      const x = fases[f];
      if (!esResp(x)) return;
      const pasos = pasosDe(x), n = pasos.length;
      const L = pasos.reduce((s, p) => s + p.s, 0);
      const pos = (x.segundos - restante) % L;
      let k = 0, ini = 0;
      while (k < n - 1 && pos >= ini + pasos[k].s) { ini += pasos[k].s; k++; }
      const p = pasos[k], dentro = pos - ini, queda = p.s - dentro;
      const escalaAntes = (i) => { for (let j = 1; j <= n; j++) { const q = pasos[(i - j + n) % n]; if (q.e != null) return q.e; } return 0.45; };
      const desde = escalaAntes(k), hacia = p.e == null ? desde : p.e;

      const bola = capa.querySelector('[data-bola]');
      const cuenta = capa.querySelector('[data-cuenta]');
      const tiempo = capa.querySelector('[data-tiempo]');
      const etiqueta = capa.querySelector('[data-paso]');
      if (cuenta) cuenta.textContent = dentro + 1;
      if (tiempo) tiempo.textContent = mmss(restante);

      const cambio = k !== pasoActual;
      if (!cambio && !forzar) return;
      pasoActual = k;
      if (etiqueta) etiqueta.textContent = p.t;
      capa.dataset.fase = hacia > desde ? 'crece' : hacia < desde ? 'baja' : 'quieta';
      if (bola) {
        if (!bola.style.transform || (cambio && dentro === 0)) bola.style.transform = `scale(${desde})`;
        bola.style.transition = 'none';
        void bola.offsetWidth;
        bola.style.transition = `transform ${queda}s cubic-bezier(.45,.05,.55,.95)`;
        bola.style.transform = `scale(${hacia})`;
      }
      if (cambio && !pausa) {
        if (hacia > desde) tono(528, .5, .07);
        else if (hacia < desde) tono(396, .6, .07);
        toque(12);
      }
    }

    function tic() {
      const x = fases[f];
      if (esResp(x)) return respirar(false);
      const arco = capa.querySelector('.arco'), num = capa.querySelector('[data-num]');
      if (num) num.textContent = restante;
      if (arco) arco.style.strokeDashoffset = Number(arco.dataset.c) * (1 - restante / x.segundos);
    }
    function avanzar(d = 1) {
      f += d;
      if (f >= fases.length) return terminar();
      if (f < 0) f = 0;
      restante = fases[f].segundos; pitido(true); toque(30); pintar();
    }
    function terminar() {
      clearInterval(timer); pitido(true);
      capa.dataset.fase = '';
      capa.innerHTML = `<div class="centro" style="align-items:center;text-align:center">
        <div style="font-size:72px;animation:caer .6s var(--resorte) both" aria-hidden="true">🌱</div>
        <h1>¡Lo lograste!</h1><p class="suave" style="font-size:19px">Tu práctica de hoy está completa.</p></div>
        <div style="max-width:var(--ancho);width:100%;margin:0 auto;display:grid;gap:10px">
          <button class="boton ancho" data-g="hecho">${esc(op.botonFinal || 'Listo')}</button>
          <button class="boton secundario ancho" data-g="repetir">↺ Volver a empezar</button>
          <button class="boton texto gris" data-g="cerrar">Cerrar</button></div>`;
    }
    capa.addEventListener('click', (e) => {
      const g = e.target.closest('[data-g]'); if (!g) return;
      const a = g.dataset.g;
      if (a === 'cerrar') cerrar();
      else if (a === 'empezar') { toque(); arrancar(); }
      else if (a === 'repetir') { toque(); f = 0; restante = fases[0].segundos; pausa = false; arrancar(); }
      else if (a === 'hecho') { cerrar(); op.alTerminar && op.alTerminar(); }
      else if (a === 'pausa') {
        pausa = !pausa; toque(); g.textContent = pausa ? '▶︎ Seguir' : '❚❚ Pausa';
        const v = capa.querySelector('video'); if (v) pausa ? v.pause() : v.play().catch(() => {});
        const bola = capa.querySelector('[data-bola]');
        if (bola) {
          if (pausa) { const m = getComputedStyle(bola).transform; bola.style.transition = 'none'; bola.style.transform = m; }
          else respirar(true);
        }
      }
      else if (a === 'saltar') avanzar(1);
      else if (a === 'atras') avanzar(-1);
    });
    function arrancar() {
      clearInterval(timer);
      timer = setInterval(() => {
        if (pausa) return;
        restante--;
        if (restante <= 0) return avanzar(1);
        if (!esResp(fases[f]) && restante <= 3) pitido(false);
        tic();
      }, 1000);
      pintar();
    }

    // Intro: cómo hacer el ejercicio, qué va a encontrar y un gracias por darse este espacio.
    function intro() {
      const total = fases.slice(1).reduce((s, x) => s + x.segundos, 0);
      const pasos = fases.filter((x) => x.tipo === 'ejercicio');
      const textoIntro = b.intro || (window.APP && APP.introRutina) || '';
      capa.dataset.fase = '';
      capa.innerHTML = `
        <div class="barra"><button class="boton texto gris" data-g="cerrar">Cerrar</button><span></span></div>
        <div class="centro" style="align-items:center;text-align:center">
          <div class="rg-resp" style="--tam:${Math.min(150, innerWidth - 200)}px;margin-bottom:18px"><span class="rg-bola rg-quieta"></span></div>
          <p class="micro" style="color:var(--principal);margin:0 0 6px">${esc(b.titulo || 'Tu práctica')} · ${Math.max(1, Math.round(total / 60))} min</p>
          <h1 style="margin:0 0 10px">Gracias por darte este espacio</h1>
          ${textoIntro ? `<p class="suave" style="margin:0 auto 18px;max-width:340px">${esc(textoIntro)}</p>` : ''}
          <ul class="rg-intro-lista">${pasos.map((x) => `<li><span style="font-weight:600">${esc(x.nombre)}</span><span class="suave" style="flex:none;font-variant-numeric:tabular-nums">${mmss(x.segundos)}</span></li>`).join('')}</ul>
        </div>
        <div style="max-width:var(--ancho);width:100%;margin:0 auto">
          <button class="boton ancho" data-g="empezar">Estoy lista</button>
        </div>`;
    }
    intro();
  }

  UI.rutinaGuiada = rutinaGuiada;

  // ───────── Botón "Empezar mi reto de nuevo" (en Perfil) ─────────
  // Borra solo el avance (días hechos). Las respuestas de las preguntas se mantienen.
  const PRODUCTO = (window.CONFIG && CONFIG.PRODUCTO) || '';
  function reiniciar() {
    const h = UI.hoja(`<div style="text-align:center;padding:6px 4px 4px">
        <div style="font-size:44px" aria-hidden="true">🌱</div>
        <h2 style="margin:8px 0 6px">¿Empezar tu reto de nuevo?</h2>
        <p class="suave" style="margin:0 0 18px">Tu avance vuelve al Día 1. Tus respuestas se mantienen.</p>
        <button class="boton ancho" data-si>Sí, empezar de nuevo</button>
        <button class="boton texto gris ancho" data-no style="margin-top:6px">Cancelar</button></div>`);
    h.cuerpo.querySelector('[data-no]').onclick = () => h.cerrar();
    h.cuerpo.querySelector('[data-si]').onclick = async (e) => {
      e.currentTarget.disabled = true;
      const vacio = { hechos: [], fechas: {} };
      try { localStorage.setItem(PRODUCTO + ':progreso', JSON.stringify(vacio)); } catch {}
      try { window.Cobro && Cobro.guardar && await Cobro.guardar('progreso', vacio); } catch {}
      location.reload();
    };
  }
  function ponerBoton() {
    const rehacer = document.querySelector('#app [data-ir="rehacer"]');
    if (!rehacer || document.querySelector('#app [data-reiniciar]')) return;
    const btn = document.createElement('button');
    btn.className = 'fila';
    btn.setAttribute('data-reiniciar', '');
    btn.innerHTML = '<span class="cuerpo"><span style="font-weight:600">Empezar mi reto de nuevo</span><span class="suave chico">Vuelve al Día 1 cuando quieras repetirlo</span></span><span class="flecha">›</span>';
    btn.addEventListener('click', (e) => { e.stopPropagation(); toque(); reiniciar(); });
    rehacer.after(btn);
  }
  // ───────── Pantalla de cada día más liviana ─────────
  // Reparte el texto: intro, la práctica (sin notas largas: esas salen en el modo guiado), el porqué, la tarea y el consejo.
  const minSeg = (t) => { const n = parseInt(t, 10); return isNaN(n) ? t : `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`; };
  const etiqueta = (texto) => { const e = document.createElement('span'); e.className = 'rg-etq'; e.textContent = texto; return e; };
  function mejorarDetalle() {
    const art = document.querySelector('#app article');
    if (!art || art.dataset.rg) return;
    art.dataset.rg = '1';
    art.querySelectorAll('p[style*="font-size:19px"]').forEach((p) => {
      p.removeAttribute('style');
      const t = p.textContent.trim();
      if (t.startsWith('💡')) {
        let cuerpo = t.replace(/^💡\s*(Por qué funciona:)?\s*/u, '');
        cuerpo = cuerpo.charAt(0).toUpperCase() + cuerpo.slice(1);
        const caja = document.createElement('div');
        caja.className = 'rg-porque';
        const txt = document.createElement('p'); txt.textContent = cuerpo;
        caja.append(etiqueta('💡 Por qué funciona'), txt);
        p.replaceWith(caja);
      } else p.className = 'rg-lead';
    });
    art.querySelectorAll('[data-guiado]').forEach((btn) => {
      const card = btn.closest('.tarjeta'); if (!card) return;
      card.classList.add('rg-rutina');
      card.querySelectorAll('.lista .suave.chico').forEach((n) => n.remove());
      card.querySelectorAll('.lista li > span.suave').forEach((n) => { if (/^\d+\s*s$/.test(n.textContent.trim())) n.textContent = minSeg(n.textContent); });
      const sub = document.createElement('p'); sub.className = 'rg-sub'; sub.textContent = 'Te guío paso a paso: solo sigue el círculo.';
      card.firstElementChild && card.firstElementChild.after(sub);
    });
    art.querySelectorAll('.aviso').forEach((av) => {
      const ok = av.classList.contains('ok');
      if (ok) {
        const t = av.textContent.replace(/^💡\s*/u, '');
        av.className = 'rg-consejo'; av.textContent = '';
        const p = document.createElement('span'); p.textContent = t;
        av.append(etiqueta('✨ Un consejo'), p);
      } else {
        const fuerte = av.querySelector('strong'); if (fuerte) fuerte.remove();
        const t = av.textContent.trim();
        av.className = 'rg-tarea'; av.textContent = '';
        const p = document.createElement('span'); p.textContent = t;
        av.append(etiqueta('🌱 Tu tarea de hoy'), p);
      }
    });
  }

  const iniciar = () => {
    const app = document.getElementById('app');
    if (!app) return;
    const todo = () => { ponerBoton(); mejorarDetalle(); };
    new MutationObserver(todo).observe(app, { childList: true, subtree: true });
    todo();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
