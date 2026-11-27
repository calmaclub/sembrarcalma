// cobro.js · cuentas, acceso de pago, datos guardados y correos del freebie.
// Se carga después de supabase.js y config.js:
//   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
//   <script src="config.js"></script>
//   <script src="cobro.js"></script>
// Deja disponible window.Cobro. No se edita: todo lo que cambia está en config.js.
// Si config.js no tiene Supabase, todo funciona sin cuentas (Cobro.activo === false).
window.Cobro = (function () {
  const CONFIG = window.CONFIG || {};
  const activo = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_PUBLIC_KEY && window.supabase);
  const sb = activo ? window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_PUBLIC_KEY) : null;
  const PRODUCTO = CONFIG.PRODUCTO || 'mi-producto';

  function necesitaSupabase() {
    if (!sb) throw new Error('Falta conectar Supabase: pega la URL y la clave pública en config.js.');
  }
  // Dirección a la que vuelve la persona después de confirmar su correo o entrar con Google.
  const aqui = () => location.origin + location.pathname;

  // ---------- Cuenta ----------
  async function usuario() {
    if (!sb) return null;
    const { data } = await sb.auth.getSession();
    return (data.session && data.session.user) || null;
  }
  function alCambiarSesion(fn) {
    if (sb) sb.auth.onAuthStateChange((_evento, sesion) => fn((sesion && sesion.user) || null));
  }
  async function registrarse(email, clave) {
    necesitaSupabase();
    const { data, error } = await sb.auth.signUp({ email: limpiar(email), password: clave, options: { emailRedirectTo: aqui() } });
    if (error) throw traducir(error);
    return { necesitaConfirmar: !data.session }; // si Supabase pide confirmar el correo, aún no hay sesión
  }
  async function entrar(email, clave) {
    necesitaSupabase();
    const { error } = await sb.auth.signInWithPassword({ email: limpiar(email), password: clave });
    if (error) throw traducir(error);
  }
  async function entrarConGoogle() {
    necesitaSupabase();
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: aqui() } });
    if (error) throw traducir(error);
  }
  async function recuperarClave(email) {
    necesitaSupabase();
    const { error } = await sb.auth.resetPasswordForEmail(limpiar(email), { redirectTo: aqui() });
    if (error) throw traducir(error);
  }
  async function salir() { if (sb) await sb.auth.signOut(); }

  // ---------- Acceso de pago ----------
  async function tieneAcceso(producto = PRODUCTO) {
    if (!CONFIG.DE_PAGO) return true;          // producto gratis: todos tienen acceso
    if (!sb || !(await usuario())) return false;
    const { data, error } = await sb.rpc('tiene_acceso', { p_producto: producto });
    if (error) { console.warn('tiene_acceso:', error.message); return false; }
    return data === true;
  }
  // El link de pago con el correo ya escrito y el ID de la cuenta, para que el webhook desbloquee la cuenta correcta.
  function linkDePago(user) {
    if (!CONFIG.LINK_PAGO) throw new Error('Falta el link de pago en config.js (LINK_PAGO).');
    const url = new URL(CONFIG.LINK_PAGO);
    const stripe = CONFIG.PLATAFORMA === 'stripe';
    if (user && user.email) url.searchParams.set(stripe ? 'prefilled_email' : 'email', user.email);
    if (user && user.id) {
      if (stripe) url.searchParams.set('client_reference_id', user.id);
      else { url.searchParams.set('xcod', user.id); url.searchParams.set('sck', user.id); }
    }
    return url.toString();
  }
  async function irAPagar() { location.href = linkDePago(await usuario()); }
  // Después de pagar, el webhook tarda unos segundos: pregunta cada 3 s durante 1 minuto.
  async function esperarAcceso(producto = PRODUCTO, segundos = 60) {
    for (let t = 0; t < segundos; t += 3) {
      if (await tieneAcceso(producto)) return true;
      await new Promise((r) => setTimeout(r, 3000));
    }
    return false;
  }
  const volvioDePagar = () => new URLSearchParams(location.search).has('pago');
  function limpiarUrl() { if (location.search) history.replaceState(null, '', location.pathname + location.hash); }

  // Contenido de pago: archivos en la carpeta privada "contenido/<producto>/" de Supabase Storage.
  async function contenidoDePago(archivo = 'contenido.json', producto = PRODUCTO) {
    necesitaSupabase();
    const { data, error } = await sb.storage.from('contenido').download(producto + '/' + archivo);
    if (error || !data) return null; // sin acceso o el archivo no existe
    return archivo.endsWith('.json') ? JSON.parse(await data.text()) : URL.createObjectURL(data);
  }

  // ---------- Datos de la persona (resultados, progreso) ----------
  // Con cuenta se guardan en Supabase; sin cuenta, en este teléfono.
  async function guardar(clave, valor, producto = PRODUCTO) {
    const user = await usuario();
    if (!user) { local.set(producto + ':' + clave, valor); return 'telefono'; }
    const { error } = await sb.from('datos_usuario').upsert(
      { user_id: user.id, producto, clave, valor, actualizado: new Date().toISOString() },
      { onConflict: 'user_id,producto,clave' },
    );
    if (error) throw traducir(error);
    return 'cuenta';
  }
  async function cargar(clave, producto = PRODUCTO) {
    const user = await usuario();
    if (!user) return local.get(producto + ':' + clave);
    const { data } = await sb.from('datos_usuario').select('valor').eq('producto', producto).eq('clave', clave).maybeSingle();
    return data ? data.valor : null;
  }
  const local = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- Freebie ----------
  async function guardarContacto(email, producto = PRODUCTO) {
    const e = limpiar(email);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error('Revisa el correo: parece que está mal escrito.');
    local.set(producto + ':contacto', e);
    if (!sb) return; // sin Supabase, solo se recuerda en este teléfono
    const { error } = await sb.from('contactos').insert({ email: e, producto });
    if (error && error.code !== '23505') throw traducir(error); // 23505 = ese correo ya estaba: no es un error
  }

  // ---------- Utilidades ----------
  const limpiar = (email) => String(email || '').trim().toLowerCase();
  function traducir(error) {
    const m = String((error && error.message) || error);
    const tabla = [
      [/invalid login credentials/i, 'Correo o contraseña incorrectos.'],
      [/email not confirmed/i, 'Confirma tu correo: te enviamos un enlace.'],
      [/user already registered/i, 'Ese correo ya tiene cuenta. Entra con tu contraseña.'],
      [/password should be at least/i, 'La contraseña debe tener al menos 6 caracteres.'],
      [/rate limit|too many/i, 'Demasiados intentos. Espera un minuto y vuelve a probar.'],
      [/valid email|invalid email|check constraint/i, 'Revisa el correo: parece que está mal escrito.'],
      [/failed to fetch|network/i, 'No hay conexión. Revisa tu internet.'],
    ];
    const hit = tabla.find(([re]) => re.test(m));
    return new Error(hit ? hit[1] : m);
  }

  return {
    activo, sb, config: CONFIG, producto: PRODUCTO,
    usuario, alCambiarSesion, registrarse, entrar, entrarConGoogle, recuperarClave, salir,
    tieneAcceso, linkDePago, irAPagar, esperarAcceso, volvioDePagar, limpiarUrl, contenidoDePago,
    guardar, cargar, guardarContacto,
  };
})();
