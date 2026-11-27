// app.js · el motor de la mini app (no se edita: el contenido está en contenido.js).
(function () {
  const A = window.APP, C = window.CONFIG, esc = UI.esc;
  const app = document.getElementById('app');
  const U = A.unidad || { singular: 'día', plural: 'días' };
  const LIBRE = A.orden === 'libre';
  let user = null, perfil = null, progreso = { hechos: [], fechas: {} }, items = A.items || [], acceso = !C.DE_PAGO;
  let paso = 0, respuestas = {}, pestana = 'hoy', filtro = '', busqueda = '';

  // ---------- Ayudas ----------
  const mayus = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const personalizar = (t) => esc(t).replace(/\{(\w+)\}/g, (m, id) => (perfil && perfil[id] != null ? esc(perfil[id]) : m));
  const hecho = (i) => progreso.hechos.includes(i);
  const abierto = (i) => acceso || items[i].gratis;
  const siguiente = () => { const i = items.findIndex((_, k) => !hecho(k)); return i < 0 ? -1 : i; };
  const sugerencia = () => { // modo libre: una sugerencia distinta cada día, entre las abiertas y no hechas
    const opciones = items.map((_, i) => i).filter((i) => abierto(i) && !hecho(i));
    const lista = opciones.length ? opciones : items.map((_, i) => i).filter(abierto);
    return lista.length ? lista[Math.floor(Date.now() / 864e5) % lista.length] : 0;
  };
  const saludo = () => { const h = new Date().getHours(); return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches'; };
  const guardarProgreso = () => Cobro.guardar('progreso', progreso).catch((e) => console.warn(e));
  const anillo = (pct, tam, grosor) => UI.anillo(pct, tam, grosor);
  const ICONOS = {
    hoy: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0-5a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm0 17.5a1 1 0 0 1 1 1V22a1 1 0 1 1-2 0v-1.5a1 1 0 0 1 1-1ZM2 12a1 1 0 0 1 1-1h1.5a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1Zm17.5 0a1 1 0 0 1 1-1H22a1 1 0 1 1 0 2h-1.5a1 1 0 0 1-1-1ZM4.9 4.9a1 1 0 0 1 1.4 0l1.1 1.1A1 1 0 0 1 6 7.4L4.9 6.3a1 1 0 0 1 0-1.4Zm12.4 12.4a1 1 0 0 1 1.4 0l1.1 1.1a1 1 0 0 1-1.4 1.4l-1.1-1.1a1 1 0 0 1 0-1.4ZM19.1 4.9a1 1 0 0 1 0 1.4L18 7.4A1 1 0 0 1 16.6 6l1.1-1.1a1 1 0 0 1 1.4 0ZM6.7 17.3a1 1 0 0 1 0 1.4l-1.1 1.1a1 1 0 0 1-1.4-1.4l1.1-1.1a1 1 0 0 1 1.4 0Z"/></svg>',
    programa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h3A1.5 1.5 0 0 1 10 5.5v3A1.5 1.5 0 0 1 8.5 10h-3A1.5 1.5 0 0 1 4 8.5v-3Zm10 0A1.5 1.5 0 0 1 15.5 4h3A1.5 1.5 0 0 1 20 5.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 14 8.5v-3Zm-10 10A1.5 1.5 0 0 1 5.5 14h3a1.5 1.5 0 0 1 1.5 1.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3Zm10 0a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3a1.5 1.5 0 0 1-1.5-1.5v-3Z"/></svg>',
    perfil: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.4-8 5.3 0 .9.7 1.7 1.7 1.7h12.6c1 0 1.7-.8 1.7-1.7 0-2.9-3.6-5.3-8-5.3Z"/></svg>',
  };

  // ---------- Piezas ----------
  function tabs() {
    const t = [['hoy', 'Hoy'], ['programa', LIBRE ? 'Explorar' : 'Programa'], ['perfil', 'Perfil']];
    return `<div class="tabs"><nav>${t.map(([id, txt]) => `<button class="tab ${pestana === id ? 'activa' : ''}" data-tab="${id}" aria-current="${pestana === id ? 'page' : 'false'}">${ICONOS[id]}<span>${txt}</span></button>`).join('')}</nav></div>`;
  }
  function filaItem(x, i) {
    const estado = hecho(i) ? '<span class="chequeo si" aria-label="Hecho"></span>'
      : abierto(i) ? `<span class="chequeo" aria-hidden="true" style="font-size:13px;font-weight:700;color:var(--suave)">${LIBRE ? '' : i + 1}</span>`
      : '<span aria-label="Bloqueado" style="width:26px;text-align:center">🔒</span>';
    return `<button class="fila" data-item="${i}">${estado}
      <span class="cuerpo"><span style="font-weight:600">${esc(x.titulo)}</span>
      <span class="suave chico">${[x.duracion, x.categoria].filter(Boolean).map(esc).join(' · ') || personalizar(x.resumen || '')}</span></span>
      <span class="flecha" aria-hidden="true">›</span></button>`;
  }
  function tarjetaItem(x, i) { // modo libre: tarjetas con imagen
    return `<button class="tarjeta" data-item="${i}" style="padding:0;overflow:hidden;text-align:left;border:0;cursor:pointer;margin:0">
      <div style="aspect-ratio:4/3;background:${x.imagen ? `center/cover url('${esc(x.imagen)}')` : 'linear-gradient(140deg,color-mix(in srgb,var(--principal) 70%,#fff),var(--acento))'};position:relative">
        ${!abierto(i) ? '<span style="position:absolute;top:10px;right:10px;background:var(--vidrio);border-radius:99px;padding:4px 8px;font-size:13px">🔒</span>' : ''}
        ${hecho(i) ? '<span class="chequeo si" style="position:absolute;top:10px;left:10px"></span>' : ''}
      </div>
      <div style="padding:12px 14px 14px"><div style="font-weight:650;line-height:1.25">${esc(x.titulo)}</div>
      ${x.duracion ? `<div class="suave chico" style="margin-top:2px">${esc(x.duracion)}</div>` : ''}</div></button>`;
  }

  // ---------- Pantallas ----------
  function bienvenida() {
    app.innerHTML = `<div class="pantalla contenedor">
      <div class="barra"><span class="marca">${esc(A.marca)}</span>${Cobro.activo && !user ? '<button class="boton texto" data-ir="entrar">Entrar</button>' : ''}</div>
      <div class="centro">
        ${A.imagen ? `<img src="${esc(A.imagen)}" alt="" class="aparece" style="border-radius:var(--radio);margin-bottom:28px;box-shadow:var(--sombra-alta)">` : `<div class="aparece" style="margin-bottom:28px">${anillo(.68, 88, 10)}</div>`}
        <h1 class="aparece-2">${esc(A.titulo)}</h1>
        <p class="suave aparece-3" style="font-size:19px">${esc(A.promesa)}</p>
      </div>
      <div class="aparece-3">
        <button class="boton ancho" data-ir="preguntas">${esc(A.botonEmpezar || 'Empezar')}</button>
        ${A.aviso ? `<p class="suave chico" style="text-align:center;margin:14px 0 0">${esc(A.aviso)}</p>` : ''}
      </div></div>`;
  }

  function pregunta() {
    const q = A.preguntas[paso];
    app.innerHTML = `<div class="pantalla contenedor">
      <div class="barra"><button class="boton texto" data-ir="${paso ? 'atras' : 'bienvenida'}">‹ Atrás</button><span class="suave chico">${paso + 1} de ${A.preguntas.length}</span></div>
      <div class="progreso" aria-hidden="true"><i style="width:${Math.round(((paso + 1) / A.preguntas.length) * 100)}%"></i></div>
      <div class="centro"><h2 class="aparece">${esc(q.texto)}</h2><div class="opciones aparece-2">
        ${q.opciones.map((o, i) => `<button class="opcion ${respuestas[q.id] === o.valor ? 'elegida' : ''}" data-op="${i}">${o.emoji ? `<span class="emoji" aria-hidden="true">${esc(o.emoji)}</span>` : ''}<span>${esc(o.texto)}</span></button>`).join('')}
      </div></div></div>`;
    app.querySelectorAll('[data-op]').forEach((b) => b.onclick = async () => {
      UI.toque(); respuestas[q.id] = q.opciones[Number(b.dataset.op)].valor;
      app.querySelectorAll('.opcion').forEach((o) => o.classList.remove('elegida')); b.classList.add('elegida');
      await new Promise((r) => setTimeout(r, 220));
      if (++paso < A.preguntas.length) return UI.ir(pregunta);
      perfil = { ...respuestas };
      await Cobro.guardar('perfil', perfil).catch((e) => console.warn(e));
      pestana = 'hoy'; UI.ir(principal);
      if (Cobro.activo && !user) setTimeout(() => cuenta(null, `Guarda tu progreso`), 500);
    });
  }

  function principal() {
    const html = pestana === 'programa' ? vistaPrograma() : pestana === 'perfil' ? vistaPerfil() : vistaHoy();
    app.innerHTML = `<div class="pantalla con-tabs contenedor">${html}</div>${tabs()}`;
    const buscar = app.querySelector('#buscar');
    if (buscar) buscar.oninput = () => { busqueda = buscar.value; const pos = buscar.selectionStart; principal(); const b = app.querySelector('#buscar'); b.focus(); b.setSelectionRange(pos, pos); };
  }

  function vistaHoy() {
    const n = progreso.hechos.length, total = items.length, i = LIBRE ? sugerencia() : siguiente(), x = items[i];
    const listo = !LIBRE && i < 0;
    return `<div style="margin-top:18px" class="aparece">
      <p class="micro" style="margin:0">${new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <h1 class="titulo-grande">${saludo()}</h1>
    </div>
    <div class="tarjeta aparece-2" style="display:flex;align-items:center;gap:18px">
      <div style="position:relative;display:grid;place-items:center">${anillo(total ? n / total : 0, 72, 8)}
        <span style="position:absolute;font-weight:750;font-size:17px">${total ? Math.round((n / total) * 100) : 0}%</span></div>
      <div><div style="font-weight:650;font-size:19px">${n} de ${total} ${total === 1 ? U.singular : U.plural}</div>
      <div class="suave chico">${n === 0 ? 'Empiezas hoy.' : listo ? '¡Completaste todo!' : 'Vas muy bien. Sin culpa, a tu ritmo.'}</div></div>
    </div>
    ${listo ? `<div class="tarjeta aparece-3" style="text-align:center;padding:28px 20px"><div style="font-size:44px" aria-hidden="true">🏆</div>
        <h2>${esc(A.final.titulo)}</h2><p class="suave">${esc(A.final.texto)}</p>
        ${A.final.cta ? `<a class="boton ancho" href="${esc(A.final.cta.link)}">${esc(A.final.cta.texto)}</a>` : ''}</div>`
      : `<p class="micro aparece-3" style="margin:26px 4px 8px">${LIBRE ? 'Sugerencia para hoy' : esc(A.textos?.hoy || 'Hoy toca')}</p>
        <button class="tarjeta aparece-3" data-item="${i}" style="display:block;width:100%;border:0;text-align:left;cursor:pointer;padding:0;overflow:hidden">
          <div style="height:120px;background:${x.imagen ? `center/cover url('${esc(x.imagen)}')` : 'linear-gradient(140deg,color-mix(in srgb,var(--principal) 75%,#fff),var(--acento))'};position:relative">
            <span style="position:absolute;left:16px;bottom:12px;color:#fff;font-weight:700;font-size:15px;text-shadow:0 1px 8px rgba(0,0,0,.25)">${LIBRE ? '' : `${mayus(U.singular)} ${i + 1}`}${x.duracion ? `${LIBRE ? '' : ' · '}${esc(x.duracion)}` : ''}</span></div>
          <div style="padding:16px 18px 18px"><h2 style="margin-bottom:4px">${esc(x.titulo)}</h2><p class="suave" style="margin:0 0 14px">${personalizar(x.resumen || '')}</p>
          <span class="boton ancho">${abierto(i) ? (hecho(i) ? 'Repetir' : 'Empezar') : '🔒 Desbloquear'}</span></div>
        </button>`}
    ${!UI.instalada() ? `<div class="aviso aparece-3" style="margin-top:18px;display:flex;gap:12px;align-items:center"><span style="font-size:22px" aria-hidden="true">📲</span>
      <span class="chico"><strong>Tenla como app.</strong> ${esc(UI.instruccionesInstalar())}</span></div>` : ''}`;
  }

  function vistaPrograma() {
    const q = busqueda.trim().toLowerCase();
    const lista = items.map((x, i) => [x, i]).filter(([x]) => (!filtro || x.categoria === filtro) && (!q || `${x.titulo} ${x.resumen || ''}`.toLowerCase().includes(q)));
    return `<h1 class="titulo-grande aparece" style="margin-top:18px">${LIBRE ? 'Explorar' : esc(A.textos?.programa || 'Programa')}</h1>
      ${LIBRE ? `<input id="buscar" class="campo" type="search" placeholder="Buscar" value="${esc(busqueda)}" aria-label="Buscar" style="margin-bottom:12px">
        ${(A.categorias || []).length ? `<div class="chips">
          ${['', ...A.categorias].map((c) => `<button class="boton ${filtro === c ? '' : 'secundario'}" data-filtro="${esc(c)}" style="min-height:36px;padding:0 14px;font-size:15px;flex:none;border-radius:99px">${esc(c || 'Todo')}</button>`).join('')}</div>` : ''}
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:12px" class="aparece-2">${lista.map(([x, i]) => tarjetaItem(x, i)).join('') || '<p class="suave">Nada por aquí.</p>'}</div>`
      : `<p class="suave" style="margin-top:-8px">${items.length} ${U.plural} · ${progreso.hechos.length} ${progreso.hechos.length === 1 ? 'hecho' : 'hechos'}</p>
        <div class="grupo aparece-2">${lista.map(([x, i]) => filaItem(x, i)).join('')}</div>`}`;
  }

  function vistaPerfil() {
    return `<h1 class="titulo-grande aparece" style="margin-top:18px">Perfil</h1>
      <div class="grupo aparece-2">
        ${Cobro.activo ? (user
          ? `<div class="fila"><span class="cuerpo"><span style="font-weight:600">${esc(user.email)}</span><span class="suave chico">${C.DE_PAGO ? (acceso ? 'Acceso completo ✓' : 'Versión gratis') : 'Tu progreso se guarda en tu cuenta'}</span></span></div>`
          : `<button class="fila" data-ir="entrar"><span class="cuerpo"><span style="font-weight:600;color:var(--principal)">Entrar o crear cuenta</span><span class="suave chico">Para guardar tu progreso en la nube</span></span><span class="flecha">›</span></button>`) : ''}
        ${C.DE_PAGO && !acceso ? `<button class="fila" data-ir="muro"><span class="cuerpo"><span style="font-weight:600">${esc(A.pago.titulo)}</span><span class="suave chico">${esc(A.pago.texto)}</span></span><span class="flecha">›</span></button>` : ''}
        <button class="fila" data-ir="rehacer"><span class="cuerpo"><span style="font-weight:600">Cambiar mis respuestas</span><span class="suave chico">${A.preguntas.map((q) => perfil && perfil[q.id] ? esc(perfil[q.id]) : '').filter(Boolean).join(' · ')}</span></span><span class="flecha">›</span></button>
        <button class="fila" data-ir="instalar"><span class="cuerpo"><span style="font-weight:600">Agregar a la pantalla de inicio</span><span class="suave chico">Ábrela como una app</span></span><span class="flecha">›</span></button>
        <button class="fila" data-ir="compartir"><span class="cuerpo"><span style="font-weight:600">Compartir con alguien</span></span><span class="flecha">›</span></button>
        ${user ? '<button class="fila" data-ir="salir"><span class="cuerpo"><span style="font-weight:600;color:var(--error)">Cerrar sesión</span></span></button>' : ''}
      </div>
      ${A.aviso ? `<p class="suave chico" style="margin:18px 4px">${esc(A.aviso)}</p>` : ''}`;
  }

  // ---------- Detalle ----------
  function bloque(b, k) {
    switch (b.tipo) {
      case 'texto': return `<p style="font-size:19px;line-height:1.5">${personalizar(b.texto)}</p>`;
      case 'lista': return `<div class="tarjeta">${b.titulo ? `<h3>${personalizar(b.titulo)}</h3>` : ''}<ul class="lista">${(b.items || []).map((t) => `<li><span aria-hidden="true" style="color:var(--principal)">●</span><span>${personalizar(t)}</span></li>`).join('')}</ul></div>`;
      case 'pasos': return `<div class="tarjeta">${b.titulo ? `<h3>${personalizar(b.titulo)}</h3>` : ''}<ol class="lista">${(b.items || []).map((t, n) => `<li><span style="flex:none;width:26px;height:26px;border-radius:50%;background:var(--relleno);display:grid;place-items:center;font-size:14px;font-weight:700">${n + 1}</span><span>${personalizar(t)}</span></li>`).join('')}</ol></div>`;
      case 'rutina': {
        const ej = b.ejercicios || [], rondas = b.rondas || 1;
        const seg = rondas * ej.reduce((s, e) => s + (e.segundos || 0), 0) + (rondas * ej.length - 1) * (b.descanso || 0);
        return `<div class="tarjeta"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px"><h3>${personalizar(b.titulo || 'Rutina')}</h3>
          <span class="suave chico" style="flex:none">${rondas > 1 ? `${rondas} rondas · ` : ''}${Math.round(seg / 60)} min</span></div>
          <ul class="lista">${ej.map((e) => `<li><span style="flex:1"><span style="display:block;font-weight:600">${esc(e.nombre)}</span>${e.nota ? `<span class="suave chico">${esc(e.nota)}</span>` : ''}</span><span class="suave" style="flex:none;font-variant-numeric:tabular-nums">${e.segundos ? `${e.segundos} s` : esc(e.repeticiones || '')}</span></li>`).join('')}</ul>
          <button class="boton ancho" data-guiado="${k}" style="margin-top:8px">▶︎ Empezar</button></div>`;
      }
      case 'tarea': return `<div class="aviso" style="margin-top:14px"><strong>Tu tarea:</strong> ${personalizar(b.texto)}</div>`;
      case 'consejo': return `<div class="aviso ok" style="margin-top:14px">💡 ${personalizar(b.texto)}</div>`;
      case 'imagen': return `<img data-src="${esc(b.src)}" alt="${esc(b.alt || '')}" style="border-radius:var(--radio);margin:14px 0;width:100%">`;
      case 'video': return `<video data-src="${esc(b.src)}" controls playsinline style="width:100%;border-radius:var(--radio);margin:14px 0;background:#000"></video>`;
      case 'audio': return `<audio data-src="${esc(b.src)}" controls style="width:100%;margin:14px 0"></audio>`;
      default: return '';
    }
  }
  async function cargarMedios(raiz) {
    for (const el of raiz.querySelectorAll('[data-src]')) {
      const src = el.dataset.src;
      el.src = src.startsWith('pago:') ? (await Cobro.contenidoDePago(src.slice(5))) || '' : src;
    }
  }

  function detalle(i) {
    if (!abierto(i)) return muro();
    const x = items[i];
    app.innerHTML = `<div class="pantalla contenedor" style="padding-bottom:calc(120px + env(safe-area-inset-bottom))">
      <div class="barra"><button class="boton texto" data-ir="volver">‹ ${pestana === 'programa' ? (LIBRE ? 'Explorar' : 'Programa') : 'Hoy'}</button></div>
      <article>
        <p class="micro aparece" style="margin:6px 0 4px">${LIBRE ? esc(x.categoria || '') : `${mayus(U.singular)} ${i + 1} de ${items.length}`}${x.duracion ? ` · ${esc(x.duracion)}` : ''}</p>
        <h1 class="aparece" style="font-size:clamp(30px,8vw,40px)">${esc(x.titulo)}</h1>
        <div class="aparece-2">${(x.bloques || []).length ? x.bloques.map(bloque).join('') : '<p class="aviso error">Esta parte todavía no tiene contenido.</p>'}</div>
      </article></div>
      <div class="tabs" style="padding-top:10px;padding-bottom:calc(10px + env(safe-area-inset-bottom))"><nav>
        <button class="boton ancho ${hecho(i) ? 'secundario' : ''}" data-hecho="${i}">${hecho(i) ? '✓ Hecho' : esc(A.textos?.hecho || 'Marcar como hecho')}</button></nav></div>`;
    app.querySelectorAll('[data-guiado]').forEach((b) => b.onclick = () => guiado(x.bloques[Number(b.dataset.guiado)], i));
    cargarMedios(app);
  }

  async function marcarHecho(i) {
    UI.toque(15);
    if (!hecho(i)) {
      progreso.hechos.push(i); progreso.fechas[i] = new Date().toISOString();
      guardarProgreso();
      UI.toast(progreso.hechos.length >= items.length ? '¡Completaste todo! 🏆' : '¡Listo! 🎉');
    }
    pestana = 'hoy'; UI.ir(principal);
  }

  // ---------- Modo guiado (rutina con temporizador): vive en ui.js ----------
  function guiado(b, i) {
    UI.rutinaGuiada(b, {
      botonFinal: hecho(i) ? 'Volver' : (A.textos?.hecho || 'Marcar como hecho'),
      alTerminar: () => marcarHecho(i),
      resolverMedio: (src) => (src.startsWith('pago:') ? Cobro.contenidoDePago(src.slice(5)) : src),
    });
  }

  // ---------- Muro y cuenta (hojas inferiores) ----------
  function muro() {
    const P = A.pago || {};
    const h = UI.hoja(`<div style="text-align:center;padding:8px 0 4px">
        <div style="font-size:44px" aria-hidden="true">🔓</div>
        <h2>${esc(P.titulo || 'Desbloquea todo')}</h2>
        <p class="suave">${esc(P.texto || '')}</p>
        <button class="boton ancho" data-h="pagar" style="margin-top:6px">${esc(P.boton || 'Desbloquear')}</button>
        ${user ? '' : '<p class="suave chico" style="margin:14px 0 0">Primero creas tu cuenta y luego pagas.</p><button class="boton texto" data-h="entrar">Ya compré: entrar</button>'}
      </div>`);
    h.cuerpo.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-h]')?.dataset.h; if (!a) return;
      if (a === 'entrar') { h.cerrar(); return cuenta(); }
      if (!user) { h.cerrar(); return cuenta(() => (acceso ? principal() : Cobro.irAPagar()), 'Crea tu cuenta'); }
      try { await Cobro.irAPagar(); } catch (err) { UI.toast(err.message); }
    });
  }

  function cuenta(despues, titulo) {
    const h = UI.hoja('<div id="form"></div>');
    UI.formularioCuenta(h.cuerpo.querySelector('#form'), {
      titulo: titulo || 'Entra a tu cuenta',
      texto: 'Tu progreso queda guardado y sigues desde cualquier teléfono.',
      alCancelar: h.cerrar,
      alListo: async (u) => {
        user = u; h.cerrar();
        const local = { perfil, progreso };
        await cargarTodo();
        if (!perfil && local.perfil) { perfil = local.perfil; Cobro.guardar('perfil', perfil).catch(() => {}); }
        if (local.progreso.hechos.length > progreso.hechos.length) { progreso = local.progreso; guardarProgreso(); }
        UI.toast('Sesión iniciada ✓');
        despues ? despues() : (perfil ? principal() : bienvenida());
      },
    });
  }

  // ---------- Datos ----------
  async function cargarTodo() {
    perfil = await Cobro.cargar('perfil');
    progreso = Object.assign({ hechos: [], fechas: {} }, (await Cobro.cargar('progreso')) || {});
    acceso = await Cobro.tieneAcceso();
    items = A.items || [];
    if (C.DE_PAGO && acceso) {
      const completo = await Cobro.contenidoDePago('contenido.json');
      if (completo && Array.isArray(completo.items)) items = items.map((d, i) => ({ ...d, ...(completo.items[i] || {}) }));
      else console.warn('Tienes acceso, pero no encontré contenido.json en Supabase → Storage → contenido/' + C.PRODUCTO + '/');
    }
  }

  async function confirmarPago() {
    Cobro.limpiarUrl();
    app.innerHTML = `<div class="pantalla contenedor"><div class="centro" style="align-items:center;text-align:center">
      <span class="girando" style="width:34px;height:34px;border-radius:50%;border:3px solid var(--principal);border-right-color:transparent;animation:girar .7s linear infinite;margin-bottom:18px"></span>
      <h2>Confirmando tu pago…</h2><p class="suave">Esto tarda unos segundos.</p></div></div>`;
    if (await Cobro.esperarAcceso()) { await cargarTodo(); UI.toast('¡Pago confirmado! Todo desbloqueado 🎉'); pestana = 'hoy'; perfil ? principal() : bienvenida(); }
    else app.innerHTML = `<div class="pantalla contenedor"><div class="centro"><h2>Aún no llega la confirmación</h2>
      <p class="suave">A veces tarda un par de minutos. Si pagaste con otro correo, entra con ese correo.</p>
      <button class="boton ancho" data-ir="reintentar">Revisar otra vez</button></div></div>`;
  }

  // ---------- Navegación ----------
  app.addEventListener('click', async (ev) => {
    const t = ev.target.closest('[data-tab]'); if (t) { UI.toque(); pestana = t.dataset.tab; return UI.ir(principal); }
    const it = ev.target.closest('[data-item]'); if (it) { UI.toque(); return UI.ir(() => detalle(Number(it.dataset.item))); }
    const h = ev.target.closest('[data-hecho]'); if (h) return marcarHecho(Number(h.dataset.hecho));
    const fl = ev.target.closest('[data-filtro]'); if (fl) { filtro = fl.dataset.filtro; return principal(); }
    const b = ev.target.closest('[data-ir]'); if (!b) return;
    const ir = b.dataset.ir;
    if (ir === 'bienvenida') UI.ir(bienvenida);
    else if (ir === 'preguntas' || ir === 'rehacer') { paso = 0; respuestas = { ...(perfil || {}) }; UI.ir(pregunta); }
    else if (ir === 'atras') { paso = Math.max(0, paso - 1); UI.ir(pregunta); }
    else if (ir === 'volver') UI.ir(principal);
    else if (ir === 'entrar') cuenta();
    else if (ir === 'muro') muro();
    else if (ir === 'instalar') UI.hoja(`<h2>Tenla como app</h2><p>${esc(UI.instruccionesInstalar())}</p><p class="suave chico">Así la abres con un toque desde tu pantalla de inicio, a pantalla completa.</p>`);
    else if (ir === 'compartir') UI.compartir(A.marca, A.promesa);
    else if (ir === 'reintentar') confirmarPago();
    else if (ir === 'salir') { await Cobro.salir(); user = null; await cargarTodo(); UI.toast('Sesión cerrada'); perfil ? principal() : bienvenida(); }
  });

  // ---------- Arranque ----------
  (async () => {
    document.title = A.marca;
    UI.modoSinConexion();
    app.innerHTML = '<div class="pantalla contenedor"><div class="esqueleto" style="height:28px;width:40%;margin-top:28px"></div><div class="esqueleto" style="height:40px;width:70%;margin-top:12px"></div><div class="esqueleto" style="height:110px;margin-top:22px;border-radius:var(--radio)"></div></div>';
    user = await Cobro.usuario();
    Cobro.alCambiarSesion((u) => { user = u; });
    if (Cobro.volvioDePagar()) return confirmarPago();
    await cargarTodo();
    perfil ? principal() : bienvenida();
  })();
})();
