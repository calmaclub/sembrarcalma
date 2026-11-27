// ui.js · utilidades de pantalla compartidas por las plantillas (no se edita).
window.UI = (function () {
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let toastTimer = null;
  function toast(texto, ms = 2600) {
    document.querySelectorAll('.toast').forEach((t) => t.remove()); // uno a la vez, y se re-anima
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = texto;
    document.body.appendChild(el);
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.remove(), ms);
  }

  // Vibración corta en Android al tocar algo importante (iPhone no la permite en la web).
  const toque = (ms = 8) => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch {} };

  // Cambia de pantalla con transición suave (si el navegador la soporta) y vuelve arriba.
  function ir(pintar, { arriba = true } = {}) {
    const hacer = () => { pintar(); if (arriba) window.scrollTo(0, 0); };
    const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (document.startViewTransition && !quieto) {
      const t = document.startViewTransition(hacer);
      // Si se toca muy rápido, una transición interrumpe a otra: no es un error.
      [t.ready, t.finished, t.updateCallbackDone].forEach((p) => p && p.catch(() => {}));
    } else hacer();
  }

  // Hoja inferior estilo iOS. Devuelve { cuerpo, cerrar }.
  function hoja(html, { alCerrar } = {}) {
    const velo = document.createElement('div');
    velo.className = 'velo';
    velo.innerHTML = `<div class="hoja" role="dialog" aria-modal="true"><div class="agarre" aria-hidden="true"></div><div data-cuerpo>${html}</div></div>`;
    const cerrar = () => { velo.remove(); document.removeEventListener('keydown', esc_); alCerrar && alCerrar(); };
    const esc_ = (e) => { if (e.key === 'Escape') cerrar(); };
    velo.addEventListener('click', (e) => { if (e.target === velo) cerrar(); });
    document.addEventListener('keydown', esc_);
    document.body.appendChild(velo);
    return { cuerpo: velo.querySelector('[data-cuerpo]'), cerrar };
  }

  // ¿Está abierta como app instalada? ¿Es iPhone?
  const instalada = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const instruccionesInstalar = () => esIOS()
    ? 'En Safari, toca el botón Compartir (el cuadrado con la flecha) y luego "Agregar a inicio".'
    : 'En Chrome, toca el menú ⋮ y luego "Instalar app" o "Agregar a la pantalla principal".';

  // Registra el modo sin conexión (sw.js), solo si la página se sirve desde internet.
  function modoSinConexion() {
    if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  async function compartir(titulo, texto) {
    const url = location.origin + location.pathname;
    try {
      if (navigator.share) { await navigator.share({ title: titulo, text: texto, url }); return; }
      await navigator.clipboard.writeText(`${texto}\n${url}`);
      toast('Copiado. Pégalo donde quieras.');
    } catch { /* la persona canceló */ }
  }

  async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); toast('Copiado ✓'); }
    catch { toast('No se pudo copiar. Mantén presionado para copiar a mano.'); }
  }

  // Formulario de cuenta (entrar / crear cuenta / recuperar). Llama a alListo() cuando hay sesión.
  function formularioCuenta(contenedor, { titulo = 'Entra a tu cuenta', texto = '', alListo, alCancelar } = {}) {
    let modo = 'entrar', ultimoEmail = '';
    const pintar = (msg = '', tipo = '') => {
      const registro = modo === 'registrar', recuperar = modo === 'recuperar';
      contenedor.innerHTML = `
        <div class="aparece">
          <h2>${esc(registro ? 'Crea tu cuenta' : recuperar ? 'Recupera tu contraseña' : titulo)}</h2>
          ${texto && !recuperar ? `<p class="suave">${esc(texto)}</p>` : ''}
          ${window.CONFIG.LOGIN_GOOGLE && !recuperar ? `
            <button class="boton contorno ancho" data-a="google" style="margin-top:8px">
              <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
              Continuar con Google
            </button>
            <p class="suave chico" style="text-align:center;margin:12px 0 0">o con tu correo</p>` : ''}
          <form data-f>
            <label class="etiqueta" for="c-email">Correo</label>
            <input class="campo" id="c-email" type="email" autocomplete="email" required value="${esc(ultimoEmail)}">
            ${recuperar ? '' : `
              <label class="etiqueta" for="c-clave">Contraseña</label>
              <input class="campo" id="c-clave" type="password" minlength="6" autocomplete="${registro ? 'new-password' : 'current-password'}" required>`}
            ${msg ? `<p class="aviso ${tipo}" style="margin-top:14px">${esc(msg)}</p>` : ''}
            <button class="boton ancho" type="submit" style="margin-top:18px">${registro ? 'Crear cuenta' : recuperar ? 'Enviarme el enlace' : 'Entrar'}</button>
          </form>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:4px;margin-top:10px">
            ${modo !== 'entrar' ? '<button class="boton texto" data-a="entrar">Ya tengo cuenta</button>' : '<button class="boton texto" data-a="registrar">Crear cuenta nueva</button>'}
            ${modo === 'entrar' ? '<button class="boton texto" data-a="recuperar">Olvidé mi contraseña</button>' : ''}
            ${alCancelar ? '<button class="boton texto" data-a="cancelar">Volver</button>' : ''}
          </div>
        </div>`;
      contenedor.querySelectorAll('[data-a]').forEach((b) => b.onclick = async () => {
        const a = b.dataset.a;
        if (a === 'google') { try { await Cobro.entrarConGoogle(); } catch (e) { pintar(e.message, 'error'); } return; }
        if (a === 'cancelar') return alCancelar();
        modo = a; pintar();
      });
      contenedor.querySelector('[data-f]').onsubmit = async (ev) => {
        ev.preventDefault();
        const boton = ev.target.querySelector('button[type=submit]');
        const email = contenedor.querySelector('#c-email').value; ultimoEmail = email;
        const clave = contenedor.querySelector('#c-clave')?.value;
        boton.disabled = true;
        try {
          if (modo === 'recuperar') { await Cobro.recuperarClave(email); return pintar('Te enviamos un enlace a tu correo para crear una contraseña nueva.', 'ok'); }
          if (modo === 'registrar') {
            const r = await Cobro.registrarse(email, clave);
            if (r.necesitaConfirmar) { modo = 'entrar'; return pintar('¡Listo! Revisa tu correo y toca el enlace para confirmar tu cuenta. Luego vuelve aquí y entra.', 'ok'); }
          } else {
            await Cobro.entrar(email, clave);
          }
          alListo && alListo(await Cobro.usuario());
        } catch (e) { pintar(e.message, 'error'); }
        finally { if (boton.isConnected) boton.disabled = false; }
      };
    };
    pintar();
  }

  // Anillo de progreso (SVG). pct de 0 a 1.
  function anillo(pct, tam = 64, grosor = 7, color = 'var(--principal)') {
    const r = (tam - grosor) / 2, c = 2 * Math.PI * r;
    return `<svg width="${tam}" height="${tam}" viewBox="0 0 ${tam} ${tam}" aria-hidden="true" style="transform:rotate(-90deg)">
      <circle cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="var(--relleno)" stroke-width="${grosor}"/>
      <circle class="arco" data-c="${c}" cx="${tam / 2}" cy="${tam / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${grosor}" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - pct)}" style="transition:stroke-dashoffset .8s var(--ease)"/></svg>`;
  }

  // Rutina guiada a pantalla completa: cuenta regresiva, anillo, el que sigue, pausa/saltar, pitidos y pantalla encendida.
  // b = { titulo, rondas, descanso, ejercicios: [{ nombre, segundos, nota, video }] }
  // op = { botonFinal, alTerminar, resolverMedio(src) → url }
  function rutinaGuiada(b, op = {}) {
    const resolver = op.resolverMedio || ((src) => src);
    const ej = b.ejercicios || [], rondas = b.rondas || 1, descanso = b.descanso || 0;
    const fases = [{ tipo: 'listo', nombre: 'Prepárate', segundos: 5, siguiente: ej[0] }];
    for (let r = 0; r < rondas; r++) ej.forEach((e, k) => {
      fases.push({ tipo: 'ejercicio', ...e, ronda: r + 1, segundos: e.segundos || 30 });
      const ultimo = r === rondas - 1 && k === ej.length - 1;
      if (!ultimo && descanso) fases.push({ tipo: 'descanso', nombre: 'Descansa', segundos: descanso, siguiente: ej[(k + 1) % ej.length] });
    });
    let f = 0, restante = fases[0].segundos, pausa = false, timer = null, wake = null;
    const capa = document.createElement('div');
    capa.style.cssText = 'position:fixed;inset:0;z-index:70;background:var(--fondo);display:flex;flex-direction:column;padding:max(14px,env(safe-area-inset-top)) 20px calc(24px + env(safe-area-inset-bottom));animation:aparece .3s var(--ease) both';
    document.body.appendChild(capa);
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then((w) => { wake = w; }).catch(() => {}); } catch {}
    let audio = null;
    const pitido = (alto) => { try { audio = audio || new (window.AudioContext || window.webkitAudioContext)(); const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = alto ? 1046 : 784; g.gain.setValueAtTime(.18, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .18);
      o.connect(g).connect(audio.destination); o.start(); o.stop(audio.currentTime + .2); } catch {} };
    const cerrar = () => { clearInterval(timer); capa.remove(); try { wake && wake.release(); } catch {} };

    function pintar() {
      const x = fases[f], pct = restante / x.segundos, tam = Math.min(280, innerWidth - 80);
      const color = x.tipo === 'descanso' ? 'var(--ok)' : x.tipo === 'listo' ? 'var(--acento)' : 'var(--principal)';
      const sig = x.tipo === 'ejercicio' ? fases.slice(f + 1).find((y) => y.tipo === 'ejercicio') : x.siguiente;
      capa.innerHTML = `
        <div class="barra"><button class="boton texto gris" data-g="cerrar">Cerrar</button>
          <span class="suave chico" style="font-variant-numeric:tabular-nums">${x.ronda ? `Ronda ${x.ronda} de ${rondas}` : ''}</span></div>
        <div class="progreso" style="margin:6px 0 0"><i style="width:${Math.round((f / fases.length) * 100)}%"></i></div>
        <div class="centro" style="align-items:center;text-align:center">
          ${x.video ? `<video data-src="${esc(x.video)}" autoplay muted loop playsinline style="width:100%;max-width:360px;border-radius:var(--radio);margin-bottom:18px;background:#000"></video>` : ''}
          <p class="micro" style="color:${color};margin:0 0 6px">${x.tipo === 'descanso' ? 'Descanso' : x.tipo === 'listo' ? 'Empezamos en' : 'Ahora'}</p>
          <h1 style="margin-bottom:${x.video ? '8px' : '22px'}">${esc(x.nombre)}</h1>
          <div style="position:relative;display:grid;place-items:center">
            ${anillo(pct, tam, 14, color)}
            <span data-num style="position:absolute;font:800 ${Math.round(tam / 3.2)}px/1 var(--fuente-titulos);font-variant-numeric:tabular-nums;letter-spacing:-0.04em">${restante}</span>
          </div>
          ${x.nota && x.tipo === 'ejercicio' ? `<p class="suave" style="margin:18px 0 0;max-width:340px">${esc(x.nota)}</p>` : ''}
          ${sig ? `<p class="suave chico" style="margin:14px 0 0">Sigue: <strong style="color:var(--texto)">${esc(sig.nombre)}</strong></p>` : ''}
        </div>
        <div style="display:flex;gap:12px;max-width:var(--ancho);width:100%;margin:0 auto">
          <button class="boton secundario" data-g="atras" aria-label="Anterior" style="width:64px">⏮</button>
          <button class="boton" data-g="pausa" style="flex:1">${pausa ? '▶︎ Seguir' : '❚❚ Pausa'}</button>
          <button class="boton secundario" data-g="saltar" aria-label="Siguiente" style="width:64px">⏭</button>
        </div>`;
      capa.querySelectorAll('[data-src]').forEach(async (el) => { el.src = (await resolver(el.dataset.src)) || ''; });
    }
    // Cada segundo solo cambian el número y el anillo (el video sigue corriendo sin reiniciarse).
    function tic() {
      const x = fases[f], arco = capa.querySelector('.arco'), num = capa.querySelector('[data-num]');
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
      capa.innerHTML = `<div class="centro" style="align-items:center;text-align:center">
        <div style="font-size:72px;animation:caer .6s var(--resorte) both" aria-hidden="true">🎉</div>
        <h1>¡Lo lograste!</h1><p class="suave" style="font-size:19px">${esc(b.titulo || 'Rutina')} completada.</p></div>
        <div style="max-width:var(--ancho);width:100%;margin:0 auto;display:grid;gap:10px">
          <button class="boton ancho" data-g="hecho">${esc(op.botonFinal || 'Listo')}</button>
          <button class="boton texto gris" data-g="cerrar">Cerrar</button></div>`;
    }
    capa.addEventListener('click', (e) => {
      const g = e.target.closest('[data-g]'); if (!g) return;
      const a = g.dataset.g;
      if (a === 'cerrar') cerrar();
      else if (a === 'hecho') { cerrar(); op.alTerminar && op.alTerminar(); }
      else if (a === 'pausa') { pausa = !pausa; toque(); g.textContent = pausa ? '▶︎ Seguir' : '❚❚ Pausa'; const v = capa.querySelector('video'); if (v) pausa ? v.pause() : v.play().catch(() => {}); }
      else if (a === 'saltar') avanzar(1);
      else if (a === 'atras') avanzar(-1);
    });
    timer = setInterval(() => {
      if (pausa) return;
      restante--;
      if (restante <= 0) return avanzar(1);
      if (restante <= 3) pitido(false);
      tic();
    }, 1000);
    pintar();
  }


  return { esc, toast, anillo, rutinaGuiada, toque, ir, hoja, instalada, esIOS, instruccionesInstalar, modoSinConexion, compartir, copiar, formularioCuenta };
})();
