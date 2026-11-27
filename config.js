// Configuración de tu producto. Es el único archivo que se edita para conectar cuentas y cobros.
// Todo lo que va aquí es PÚBLICO (se puede ver en el navegador). Nunca pongas aquí una clave secreta.
// Si dejas SUPABASE_URL vacío, el producto funciona sin cuentas (versión sin backend).
window.CONFIG = {
  // Supabase → botón "Connect" (o Project Settings → API Keys): la Project URL y la Publishable key.
  SUPABASE_URL: '',            // ej.: 'https://abcdefgh.supabase.co'
  SUPABASE_PUBLIC_KEY: '',     // ej.: 'sb_publishable_…'

  // El mismo slug que registraste en la tabla productos (2-mi-producto.sql).
  PRODUCTO: 'sembrar-calma',

  // ¿Se cobra? false = gratis (freebie). true = hay que pagar para ver el contenido completo.
  // Versión 1 para revisar: false (los 21 días abiertos). En la Lección 5C cambia a true.
  DE_PAGO: false,

  // 'hotmart' o 'stripe', y el link de pago: pay.hotmart.com/… o buy.stripe.com/…
  PLATAFORMA: 'hotmart',
  LINK_PAGO: '',

  // Entrar con Google (solo si lo activaste en Supabase → Authentication → Sign In / Providers → Google).
  LOGIN_GOOGLE: false,
};
