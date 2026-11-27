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

  const PRODUCTO_SONIDO = (window.CONFIG && CONFIG.PRODUCTO) || 'app';
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

    // Sonido: el celular (sobre todo iPhone) solo deja sonar si el audio se "despierta" con un toque de la persona.
    let audio = null, salida = null;
    const CLAVE_SONIDO = PRODUCTO_SONIDO + ':sonido';
    let conSonido = (() => { try { return localStorage.getItem(CLAVE_SONIDO) !== 'off'; } catch { return true; } })();
    const destino = () => { if (!salida) { salida = audio.createGain(); salida.gain.value = conSonido ? 1 : 0; salida.connect(audio.destination); } return salida; };
    const despertarAudio = () => {
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        if (audio.state === 'suspended') audio.resume();
        const silencio = audio.createBuffer(1, 1, 22050), fuente = audio.createBufferSource();
        fuente.buffer = silencio; fuente.connect(audio.destination); fuente.start(0);
      } catch {}
    };
    const tono = (freq, dur, vol) => { try {
      if (!audio) return;
      if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(destino()); o.start(t); o.stop(t + dur + 0.05);
    } catch {} };
    const pitido = (alto) => tono(alto ? 1046 : 784, .25, .3);

    // Sonido de aire: entra al inhalar, sale al exhalar (ruido suave filtrado, dura lo mismo que cada fase).
    let ruido = null, aireActual = null;
    const pararAire = () => {
      if (!aireActual || !audio) return;
      try { const t = audio.currentTime; aireActual.g.gain.cancelScheduledValues(t); aireActual.g.gain.setTargetAtTime(0.0001, t, 0.08); aireActual.src.stop(t + 0.35); } catch {}
      aireActual = null;
    };
    const aire = (tipo, dur) => { try {
      if (!audio) return;
      pararAire();
      if (audio.state === 'suspended') audio.resume();
      if (!ruido) {
        ruido = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
        const d = ruido.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;   // ruido rosado: más cálido y suave que el blanco
        for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1;
          b0 = 0.99765 * b0 + w * 0.0990460; b1 = 0.96300 * b1 + w * 0.2965164; b2 = 0.57000 * b2 + w * 1.0526913;
          d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.18; }
      }
      // Un suspiro corto y muy suave al empezar cada fase (no suena toda la fase): aire liviano, sin graves.
      const t = audio.currentTime, vol = 0.07;   // volumen del suspiro (más bajo = más suave)
      const D = tipo === 'entra' ? Math.min(2.2, Math.max(0.9, dur * 0.6)) : Math.min(2.8, Math.max(1.1, dur * 0.5));
      const src = audio.createBufferSource(); src.buffer = ruido; src.loop = true;
      const filtro = audio.createBiquadFilter(); filtro.type = 'bandpass'; filtro.Q.value = 1.1;
      const suave = audio.createBiquadFilter(); suave.type = 'highpass'; suave.frequency.value = 500;
      const g = audio.createGain();
      // curva suave (sube y baja como una campana) para que no tenga golpe
      const curva = new Float32Array(64);
      for (let i = 0; i < curva.length; i++) { const x = i / (curva.length - 1); curva[i] = vol * Math.pow(Math.sin(Math.PI * Math.pow(x, tipo === 'entra' ? 0.8 : 0.6)), 2) + 0.00001; }
      g.gain.setValueAtTime(0.00001, t);
      g.gain.setValueCurveAtTime(curva, t + 0.01, D);
      if (tipo === 'entra') { filtro.frequency.setValueAtTime(1100, t); filtro.frequency.linearRampToValueAtTime(1900, t + D); }
      else { filtro.frequency.setValueAtTime(1700, t); filtro.frequency.linearRampToValueAtTime(900, t + D); }
      src.connect(filtro).connect(suave).connect(g).connect(destino());
      src.start(t); src.stop(t + D + 0.1);
      aireActual = { src, g };
    } catch {} };

    // Mar de fondo, muy suave: olas que suben y bajan lento (se genera aquí mismo, sin archivos de audio).
    let mar = null;
    const CON_MAR = false;   // mar de fondo apagado (a Val no le gustó). true = vuelve a sonar.
    const VOL_MAR = 0.16;
    const iniciarMar = () => { try {
      if (!CON_MAR || !audio || mar) return;
      const sr = audio.sampleRate, buf = audio.createBuffer(2, sr * 6, sr);
      for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); let ultimo = 0;
        for (let i = 0; i < d.length; i++) { const blanco = Math.random() * 2 - 1; ultimo = (ultimo + 0.02 * blanco) / 1.02; d[i] = ultimo * 3.2; } }
      const src = audio.createBufferSource(); src.buffer = buf; src.loop = true;
      const filtro = audio.createBiquadFilter(); filtro.type = 'lowpass'; filtro.frequency.value = 900;
      const ola = audio.createGain(); ola.gain.value = 0.55;
      const lfo = audio.createOscillator(); lfo.frequency.value = 0.09;            // una ola cada ~11 segundos
      const lfoVol = audio.createGain(); lfoVol.gain.value = 0.45;
      lfo.connect(lfoVol).connect(ola.gain);
      const master = audio.createGain(); const t = audio.currentTime;
      master.gain.setValueAtTime(0.0001, t); master.gain.exponentialRampToValueAtTime(VOL_MAR, t + 3);
      src.connect(filtro).connect(ola).connect(master).connect(destino());
      src.start(t); lfo.start(t);
      mar = { src, lfo, master };
    } catch {} };
    const volumenMar = (v) => { if (!mar) return; try { const t = audio.currentTime; mar.master.gain.cancelScheduledValues(t); mar.master.gain.setTargetAtTime(Math.max(v, 0.0001), t, 0.6); } catch {} };
    const pararMar = () => { if (!mar) return; try { const t = audio.currentTime; volumenMar(0); mar.src.stop(t + 2.5); mar.lfo.stop(t + 2.5); } catch {} mar = null; };
    const iconoSonido = () => conSonido ? '🔊' : '🔇';
    const botonSonido = () => `<button class="boton texto gris" data-g="sonido" aria-label="Sonido" style="font-size:20px;letter-spacing:0">${iconoSonido()}</button>`;

    const cerrar = () => { clearInterval(timer); cancelAnimationFrame(anim.raf); pararAire(); pararMar(); capa.remove(); try { wake && wake.release(); } catch {} };

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
          <span style="display:flex;align-items:center;gap:10px"><span class="suave chico" style="font-variant-numeric:tabular-nums">${x.ronda && rondas > 1 ? `Ronda ${x.ronda} de ${rondas}` : ''}</span>${botonSonido()}</span></div>
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

    // El círculo se mueve con JavaScript (cuadro por cuadro): así funciona en todos los celulares,
    // incluso los que tienen activado "reducir movimiento", que apaga las animaciones de CSS.
    const anim = { raf: 0, escala: 0.45 };
    const suavizar = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
    function animar(bola, desde, hacia, segundos) {
      cancelAnimationFrame(anim.raf);
      const t0 = performance.now(), D = Math.max(0.05, segundos) * 1000;
      bola.style.transition = 'none';
      const paso = (ahora) => {
        const p = Math.min(1, (ahora - t0) / D);
        anim.escala = desde + (hacia - desde) * suavizar(p);
        bola.style.transform = `scale(${anim.escala})`;
        if (p < 1) anim.raf = requestAnimationFrame(paso);
      };
      bola.style.transform = `scale(${desde})`;
      anim.escala = desde;
      anim.raf = requestAnimationFrame(paso);
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
        const inicio = (!bola.dataset.vivo || (cambio && dentro === 0)) ? desde : anim.escala;
        bola.dataset.vivo = '1';
        animar(bola, inicio, hacia, queda);
      }
      if (!pausa) {
        if (hacia > desde) aire('entra', queda);
        else if (hacia < desde) aire('sale', queda);
        else pararAire();
        if (cambio) toque(12);
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
      pararAire(); restante = fases[f].segundos; pitido(true); toque(30); pintar();
    }
    function terminar() {
      clearInterval(timer); cancelAnimationFrame(anim.raf); pararAire(); pararMar(); pitido(true);
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
      despertarAudio();
      const g = e.target.closest('[data-g]'); if (!g) return;
      const a = g.dataset.g;
      if (a === 'cerrar') cerrar();
      else if (a === 'empezar') { toque(); iniciarMar(); arrancar(); }
      else if (a === 'sonido') {
        conSonido = !conSonido; toque();
        try { localStorage.setItem(CLAVE_SONIDO, conSonido ? 'on' : 'off'); } catch {}
        if (salida) { const t = audio.currentTime; salida.gain.cancelScheduledValues(t); salida.gain.setTargetAtTime(conSonido ? 1 : 0, t, 0.15); }
        capa.querySelectorAll('[data-g="sonido"]').forEach((el) => { el.textContent = iconoSonido(); });
      }
      else if (a === 'repetir') { toque(); f = 0; restante = fases[0].segundos; pausa = false; iniciarMar(); arrancar(); }
      else if (a === 'hecho') { cerrar(); op.alTerminar && op.alTerminar(); }
      else if (a === 'pausa') {
        pausa = !pausa; toque(); g.textContent = pausa ? '▶︎ Seguir' : '❚❚ Pausa';
        const v = capa.querySelector('video'); if (v) pausa ? v.pause() : v.play().catch(() => {});
        const bola = capa.querySelector('[data-bola]');
        if (!bola) volumenMar(pausa ? 0 : VOL_MAR);
        if (bola) {
          if (pausa) { pararAire(); volumenMar(0); cancelAnimationFrame(anim.raf); }
          else { volumenMar(VOL_MAR); respirar(true); }
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
        <div class="barra"><button class="boton texto gris" data-g="cerrar">Cerrar</button>${botonSonido()}</div>
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
    // Orden: intro → por qué → consejo → tarea → la práctica al final (con el botón Empezar).
    const cont = art.querySelector('.rg-lead') ? art.querySelector('.rg-lead').parentElement : art.lastElementChild;
    if (cont) {
      cont.querySelectorAll(':scope > .rg-porque, :scope > .rg-consejo, :scope > .rg-tarea').forEach((n) => cont.appendChild(n));
      const tarjetas = cont.querySelectorAll(':scope > .tarjeta');
      if (tarjetas.length) {
        const titulo = document.createElement('p'); titulo.className = 'rg-seccion'; titulo.textContent = 'Tu práctica de hoy';
        cont.appendChild(titulo);
        tarjetas.forEach((n) => cont.appendChild(n));
      }
    }
    // Sin botón fijo abajo: el día se marca como hecho al terminar la práctica guiada.
    const fijo = document.querySelector('#app [data-hecho]');
    if (fijo && fijo.closest('.tabs')) fijo.closest('.tabs').style.display = 'none';
    const pantalla = art.closest('.pantalla');
    if (pantalla) pantalla.style.paddingBottom = 'calc(56px + env(safe-area-inset-bottom))';
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
