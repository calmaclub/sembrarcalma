// contenido.js · Sembrar Calma · 21 días para educar tu respiración
// respiracion: [['Inhala', segundos, tamaño del círculo], ['Sostén', segundos], ...] → círculo que respira (respiracion.js).
// Versión 1 para revisar en el teléfono: los 21 días están completos aquí.
// Antes de publicar en modo de pago, los días 3 a 21 se pasan a contenido.json (Supabase) y aquí quedan solo sus títulos.

window.APP = {
  marca: 'Sembrar Calma',
  titulo: '21 días para educar tu respiración',
  promesa: '5 minutos al día que sí vas a sostener. Cada técnica con su porqué, y tu avance a la vista.',
  imagen: '',
  botonEmpezar: 'Empezar mi reto',

  unidad: { singular: 'día', plural: 'días' },
  orden: 'secuencial',
  categorias: [],
  textos: { hecho: 'Hoy respiré' },

  // Intro de cada práctica guiada (antes de empezar). Abajo de este texto se ve la lista de pasos con sus tiempos.
  introRutina: 'Busca un lugar cómodo, siéntate con la espalda derecha y suelta los hombros. Sigue el círculo: cuando crece, inhalas; cuando se queda quieto, sostienes; cuando se hace pequeño, exhalas. Si en algún momento te falta el aire, vuelve a tu ritmo.',

  // Frases para el último momento de cada práctica (sale una al azar). Agrega, quita o cambia las que quieras.
  frasesCierre: [
    'Lo estás haciendo bien. Cada respiración cuenta.',
    'Gracias por regalarte este momento.',
    'Hoy sembraste un poquito de calma.',
    'No tiene que ser perfecto. Solo tiene que ser tuyo.',
    'Recuerda agradecer: a tu cuerpo, a tu respiración, a ti.',
    'La calma no es quedarse quieta: es lo que te impulsa a crecer.',
    'Volver a ti también es avanzar.',
    'Tu respiración siempre va contigo.',
    'Lo que siembras hoy, florece después.',
    'Nota cómo estás ahora. Ese cambio lo hiciste tú.',
    'Ser constante contigo es poderosísimo.',
    'Respira, agradece y sigue tu día con calma.',
  ],

  preguntas: [
    { id: 'momento', texto: '¿Cuándo vas a practicar?', opciones: [
      { valor: 'al despertar', texto: 'Al despertar', emoji: '🌅' },
      { valor: 'al llegar a casa', texto: 'Al llegar a casa', emoji: '🏡' },
      { valor: 'antes de dormir', texto: 'Antes de dormir', emoji: '🌙' },
    ] },
    { id: 'intencion', texto: '¿Qué quieres sentir más?', opciones: [
      { valor: 'más calma', texto: 'Más calma', emoji: '🌊' },
      { valor: 'más energía', texto: 'Más energía', emoji: '⚡' },
      { valor: 'más claridad', texto: 'Más claridad', emoji: '🎯' },
      { valor: 'reconectarte contigo', texto: 'Reconectarme conmigo', emoji: '💗' },
    ] },
  ],

  items: [
    // ───────── SEMANA 1 · RESPIRA ─────────
    {
      titulo: 'Tu exhalación es tu freno', resumen: 'La técnica base de todo el reto.', duracion: '4 min', gratis: true,
      bloques: [
        { tipo: 'texto', texto: 'Bienvenida a tu primer día. Hoy das el primer paso hacia {intencion}. Solo necesitas 4 minutos y un lugar donde sentarte.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 30, nota: 'Cierra los ojos o mira un punto fijo. Solo observa cómo entra y sale el aire.' },
          { nombre: 'Inhala 4 · exhala 6', segundos: 120, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Inhala por la nariz contando 4. Exhala suave contando 6. ¿Te falta el aire? Cuenta 3 y 5: está perfecto.' },
          { nombre: 'Vuelve a tu ritmo', segundos: 30, nota: 'Suelta el conteo. Nota cómo te sientes ahora.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: cuando exhalas más largo de lo que inhalas, le dices a tu cuerpo que puede bajar el ritmo. Tu corazón se desacelera un poquito con cada exhalación. No es magia: es tu sistema nervioso escuchándote.' },
        { tipo: 'tarea', texto: 'Hazla otra vez {momento}. Aunque sea 1 minuto, cuenta.' },
        { tipo: 'consejo', texto: 'No se trata de respirar más profundo, sino más lento.' },
      ],
    },
    {
      titulo: 'Respira con la barriga', resumen: 'Tu mejor aliado está debajo de tus pulmones.', duracion: '4 min', gratis: true,
      bloques: [
        { tipo: 'texto', texto: 'Todas respiramos, pero casi nadie respira con intención. Hoy aprendes a usar tu mejor aliado.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Una mano en el pecho, otra en la barriga', segundos: 30, nota: 'Respira normal y nota cuál de las dos se mueve más.' },
          { nombre: 'Infla la barriga', segundos: 150, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Inhala por la nariz y siente cómo sube la mano de la barriga, mientras la del pecho casi no se mueve. Exhala lento y la barriga baja.' },
          { nombre: 'Descansa', segundos: 30, nota: 'Suelta las manos y quédate un momento aquí.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: cuando vivimos de afán respiramos con el pecho, corto y rápido. El diafragma es el músculo grande que está debajo de tus pulmones. Cuando lo usas, cada respiración es más amplia y más lenta, y tu cuerpo lo lee como “estoy a salvo”.' },
        { tipo: 'tarea', texto: 'Hoy, {momento}, revisa: ¿estás respirando con el pecho o con la barriga? Solo nótalo.' },
        { tipo: 'consejo', texto: 'Si te cuesta, hazlo acostada con un libro sobre la barriga y mira cómo sube y baja.' },
      ],
    },
    {
      titulo: 'La respiración cuadrada', resumen: 'Para recuperar el foco en segundos.', duracion: '4 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy dibujas un cuadrado con tu respiración. Es la técnica que vas a querer tener a mano antes de una tarea difícil.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 30, nota: 'Siéntate derecha, con los hombros sueltos.' },
          { nombre: 'Cuadrado 4 · 4 · 4 · 4', segundos: 160, respiracion: [['Inhala', 4, 1], ['Sostén', 4], ['Exhala', 4, 0.45], ['Sostén', 4]], nota: 'Inhala 4, sostén 4, exhala 4, sostén 4. Si sostener te incomoda, cuenta 3 o quita las pausas.' },
          { nombre: 'Vuelve a tu ritmo', segundos: 30, nota: 'Suelta el conteo y nota tu mente ahora.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: contar le da a tu mente algo concreto que seguir. Mientras cuentas, no hay espacio para la lista de pendientes. Por eso esta técnica se usa para recuperar el foco.' },
        { tipo: 'tarea', texto: 'Úsala hoy antes de abrir el correo o de empezar algo que te cuesta.' },
        { tipo: 'consejo', texto: 'Si te mareas, vuelve a tu respiración normal. Siempre manda tu cuerpo, no el conteo.' },
      ],
    },
    {
      titulo: 'El suspiro doble', resumen: 'El suspiro que tu cuerpo ya conoce.', duracion: '4 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Tu cuerpo ya sabe hacer esto: lo hace solo cuando lloras o cuando por fin descansas. Hoy lo haces a propósito.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 30, nota: 'Respira normal y suelta la mandíbula.' },
          { nombre: 'Suspiro doble', segundos: 144, respiracion: [['Inhala', 2, 0.82], ['Un sorbito más', 1, 1], ['Exhala lento', 6, 0.45]], nota: 'Inhala por la nariz y, al final, toma un segundo sorbito de aire. Luego exhala largo y lento por la boca, como un suspiro.' },
          { nombre: 'Descansa', segundos: 30, nota: 'Vuelve a tu ritmo y nota los hombros.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: la segunda inhalación abre tus pulmones un poquito más, y la exhalación larga le pone el freno al cuerpo. Es de las formas más rápidas de bajar revoluciones.' },
        { tipo: 'tarea', texto: 'La próxima vez que notes los hombros pegados a las orejas, haz 3 suspiros dobles.' },
      ],
    },
    {
      titulo: 'Suelta el día', resumen: 'Un ritual corto para cerrar la puerta del trabajo.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Saliste de la oficina, pero tu cabeza sigue allá. Hoy creas un ritual para marcar el cambio.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Suelta los hombros', segundos: 30, nota: 'Súbelos a las orejas al inhalar y déjalos caer al exhalar.' },
          { nombre: 'Inhala 4 · exhala 6', segundos: 150, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Tu técnica del Día 1. Exhala como si soltaras el día.' },
          { nombre: '3 suspiros dobles', segundos: 27, respiracion: [['Inhala', 2, 0.82], ['Un sorbito más', 1, 1], ['Exhala lento', 6, 0.45]], nota: 'Dos sorbitos de aire por la nariz, una exhalación larga por la boca.' },
          { nombre: 'Llegaste', segundos: 30, nota: 'Di por dentro: “el día de trabajo terminó”.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: tu cuerpo no sabe que saliste de la oficina. Sigue en modo pendientes. Un ritual corto le marca el cambio, como cerrar una puerta.' },
        { tipo: 'tarea', texto: 'Hoy, al llegar a casa, haz este ritual antes de sentarte o de abrir el celular.' },
      ],
    },
    {
      titulo: 'Tenla lista para un momento tenso', resumen: 'Un simulacro para cuando la necesites.', duracion: '4 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy entrenas para un momento que todavía no llega: una reunión, una conversación difícil, un trancón eterno.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Recuerda un momento tenso', segundos: 30, nota: 'Piensa en una situación que te pone un poquito nerviosa. Solo un poquito.' },
          { nombre: 'Inhala 4 · exhala 6', segundos: 150, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Respira así mientras la imaginas. Nota cómo tu cuerpo se acomoda.' },
          { nombre: 'Vuelve al presente', segundos: 30, nota: 'Abre los ojos y mira a tu alrededor. Estás aquí.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: si intentas respirar por primera vez en pleno momento difícil, casi nunca alcanza, porque el cuerpo en alerta no la reconoce. Por eso se entrena en calma, como un simulacro. Hoy estás haciendo justo eso.' },
        { tipo: 'tarea', texto: 'Practícala otra vez {momento}, imaginando el mismo momento.' },
        { tipo: 'consejo', texto: 'En el momento real nadie tiene que notarlo: exhala lento por la nariz, con la boca cerrada.' },
      ],
    },
    {
      titulo: 'Tu favorita de la semana', resumen: 'Eliges la técnica que te llevas.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Esta semana probaste varias formas de respirar. Hoy eliges la tuya.' },
        { tipo: 'lista', titulo: 'Tus técnicas de la semana', items: [
          'Inhala 4 · exhala 6 (tu freno)',
          'Respiración con la barriga',
          'Respiración cuadrada (tu foco)',
          'Suspiro doble (bajar revoluciones)',
        ] },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 30, nota: 'Elige tu técnica favorita antes de empezar.' },
          { nombre: 'Tu técnica favorita', segundos: 240, nota: 'Hazla a tu ritmo. Si te distraes, vuelve.' },
          { nombre: 'Cierra', segundos: 30, nota: 'Nota la diferencia con el Día 1.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: repetir la misma técnica es lo que la vuelve automática. El día que la necesites, tu cuerpo ya la va a conocer.' },
        { tipo: 'tarea', texto: 'Escribe en una nota del celular el nombre de tu favorita. Es tu primera semilla 🌱' },
      ],
    },

    // ───────── SEMANA 2 · TU MENTE ─────────
    {
      titulo: 'Mira tus pensamientos pasar', resumen: 'No es dejar la mente en blanco.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Bienvenida a la semana 2. Ya sabes respirar con intención. Ahora usamos la respiración para mirar tu mente.' },
        { tipo: 'rutina', titulo: 'Respira y observa', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Respira con la barriga', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Una mano en la barriga. Lento.' },
          { nombre: 'Observa', segundos: 180, nota: 'Cada vez que aparezca un pensamiento, ponle una etiqueta: “pendiente”, “recuerdo”, “preocupación”. Y vuelve a la respiración.' },
          { nombre: 'Vuelve', segundos: 60, nota: 'Suelta las etiquetas y quédate solo con el aire.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: nadie puede dejar la mente en blanco. Lo que entrenas es darte cuenta de que estás pensando, y volver. Cada vez que vuelves es una repetición, como en el gimnasio.' },
        { tipo: 'tarea', texto: 'Hoy, {momento}, nota cuál etiqueta apareció más. Solo nótalo.' },
        { tipo: 'consejo', texto: 'Si te distrajiste 20 veces, volviste 20 veces. Eso es practicar bien.' },
      ],
    },
    {
      titulo: 'Ponle nombre a lo que sientes', resumen: 'Dos minutos de escritura que ordenan.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'A veces solo sabemos que estamos cansadas. Hoy vamos un poquito más adentro.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Inhala 4 · exhala 6', segundos: 120, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Prepara tu mente para escribir.' },
        ] },
        { tipo: 'lista', titulo: 'Escribe 2 minutos', items: [
          'Hoy me siento…',
          'Lo siento en el cuerpo en…',
          'Lo que necesito ahora es…',
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: ponerle nombre a una emoción le baja el volumen. Cuando escribes “estoy cansada” en vez de solo sentirlo, tu mente lo ordena y deja de dar vueltas.' },
        { tipo: 'tarea', texto: 'Escríbelo en tu celular o en un papel. No tiene que ser bonito.' },
      ],
    },
    {
      titulo: 'Respiración alterna', resumen: 'Una técnica del yoga para equilibrarte.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy aprendes una técnica que traje de mi formación en yoga. Se llama nadi shodhana.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Prepárate', segundos: 30, nota: 'Con el pulgar derecho vas a tapar la fosa derecha. Con el anular, la izquierda.' },
          { nombre: 'Respiración alterna', segundos: 208, respiracion: [['Inhala por la izquierda', 4, 1], ['Exhala por la derecha', 4, 0.45], ['Inhala por la derecha', 4, 1], ['Exhala por la izquierda', 4, 0.45]], nota: 'Inhala por la izquierda, tapa, exhala por la derecha. Inhala por la derecha, tapa, exhala por la izquierda. Eso es una vuelta.' },
          { nombre: 'Descansa', segundos: 60, nota: 'Baja la mano y respira normal por las dos.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: al ir de un lado al otro, la respiración se vuelve lenta y pareja sin que tengas que contar, y tu atención queda ocupada en algo simple. Por eso deja una sensación de equilibrio.' },
        { tipo: 'tarea', texto: 'Hazla otra vez {momento}, aunque sea 5 vueltas.' },
        { tipo: 'consejo', texto: 'Si tienes la nariz tapada, hazla imaginando el recorrido del aire. También funciona.' },
      ],
    },
    {
      titulo: 'Del automático a la intención', resumen: 'Tus sentidos te traen de vuelta.', duracion: '4 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Vivir en automático es estar en el siguiente pendiente y no en donde estás. Hoy vuelves.' },
        { tipo: 'rutina', titulo: 'Respira y aterriza', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Respira con la barriga', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Lento, con intención.' },
          { nombre: '5 cosas que ves', segundos: 40, nota: 'Nómbralas por dentro, sin juzgarlas.' },
          { nombre: '4 cosas que puedes tocar', segundos: 40, nota: 'Siente su textura: la silla, tu ropa, tu piel.' },
          { nombre: '3 sonidos', segundos: 40, nota: 'Cerca y lejos.' },
          { nombre: '2 olores', segundos: 30, nota: 'Aunque sean sutiles.' },
          { nombre: '1 respiración larga', segundos: 12, respiracion: [['Inhala lento', 4, 1], ['Exhala todavía más lento', 8, 0.45]], nota: 'Inhala lento y exhala todavía más lento.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: tus sentidos solo funcionan en el presente. Cuando los usas a propósito, te sacan del piloto automático y te traen a donde estás.' },
        { tipo: 'tarea', texto: 'Hoy haz este ejercicio en un momento cualquiera: en la fila, en el trancón o esperando el café.' },
      ],
    },
    {
      titulo: '¿Qué te dio energía hoy?', resumen: 'Entrenar los ojos para ver lo que sí te gusta.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Cuando sientes que ya no te gusta nada, casi nunca es verdad. Es que dejaste de notar lo que sí te gusta.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Suspiro doble', segundos: 90, respiracion: [['Inhala', 2, 0.82], ['Un sorbito más', 1, 1], ['Exhala lento', 6, 0.45]], nota: 'Suelta el día con cada exhalación.' },
        ] },
        { tipo: 'lista', titulo: 'Escribe 2 minutos', items: [
          'Algo que hoy me dio energía…',
          'Algo que me la quitó…',
          'Mañana quiero un poquito más de…',
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: tu mente se acostumbra a buscar lo que falta. Preguntarte a propósito qué te dio energía entrena tus ojos para ver lo que sí te llena.' },
        { tipo: 'tarea', texto: 'Lee tus respuestas mañana {momento}.' },
      ],
    },
    {
      titulo: 'Recorre tu cuerpo', resumen: 'Apaga las luces que dejaste prendidas.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'El estrés se queda guardado en el cuerpo, y muchas veces ni lo notas. Hoy lo recorres con tu respiración.' },
        { tipo: 'rutina', titulo: 'Respira y recorre', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Respira con la barriga', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Puedes hacerlo sentada o acostada.' },
          { nombre: 'Pies y piernas', segundos: 60, nota: 'Lleva la atención ahí. Al exhalar, imagina que se aflojan.' },
          { nombre: 'Barriga y espalda', segundos: 60, nota: 'Deja que la barriga se suelte por completo.' },
          { nombre: 'Hombros y cuello', segundos: 60, nota: 'Bájalos un centímetro más con cada exhalación.' },
          { nombre: 'Cara y mandíbula', segundos: 60, nota: 'Separa un poquito los dientes. Suelta la frente.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: la mandíbula apretada y los hombros arriba son tensión que sigue prendida sin que te des cuenta. Recorrer el cuerpo con la respiración es como ir apagando luces.' },
        { tipo: 'consejo', texto: 'Revisa tu mandíbula ahora mismo. ¿Estaba apretada?' },
      ],
    },
    {
      titulo: 'Tu favorita de la semana', resumen: 'Tu segunda semilla.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Dos semanas. Mira todo lo que ya sembraste. Hoy eliges tu favorita de la semana 2.' },
        { tipo: 'lista', titulo: 'Tus prácticas de la semana', items: [
          'Mirar tus pensamientos pasar',
          'Ponerle nombre a lo que sientes',
          'Respiración alterna',
          'Del automático a la intención (5 sentidos)',
          'Recorrer tu cuerpo',
        ] },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 30, nota: 'Elige tu práctica favorita antes de empezar.' },
          { nombre: 'Tu práctica favorita', segundos: 240, nota: 'Hazla a tu ritmo.' },
          { nombre: 'Cierra', segundos: 30, nota: '¿Qué notas distinto en tu mente hoy?' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: la constancia no es hacerlo perfecto, es volver. Ya llevas 14 días volviendo.' },
        { tipo: 'tarea', texto: 'Agrega a tu nota del celular tu favorita de esta semana. Ya llevas dos semillas 🌱🌱' },
      ],
    },

    // ───────── SEMANA 3 · SIEMBRA ─────────
    {
      titulo: 'Ujjayi, el sonido del mar', resumen: 'Una respiración con sonido propio.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Bienvenida a la última semana. Hoy aprendes la respiración que acompaña toda una clase de yoga.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Practica el sonido', segundos: 60, nota: 'Exhala por la boca como si empañaras un espejo: “haaa”. Ahora hazlo igual, con la boca cerrada.' },
          { nombre: 'Ujjayi', segundos: 180, respiracion: [['Inhala con sonido', 4, 1], ['Exhala con sonido', 6, 0.45]], nota: 'Inhala y exhala por la nariz con ese sonido suave en la garganta, como olas.' },
          { nombre: 'Vuelve a tu ritmo', segundos: 60, nota: 'Suelta el sonido y escucha el silencio.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: al cerrar un poquito la garganta, el aire sale más lento sin que tengas que contar. Y el sonido le da a tu mente un ancla para no irse.' },
        { tipo: 'tarea', texto: 'Úsala hoy {momento}, aunque sea 10 respiraciones.' },
      ],
    },
    {
      titulo: 'Lo que te hacía feliz', resumen: 'Un ejercicio para reconectar contigo.', duracion: '6 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Piensa en ti de niña. ¿Qué te hacía perder la noción del tiempo?' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Inhala 4 · exhala 6', segundos: 120, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Con los ojos cerrados, imagínate de niña jugando.' },
        ] },
        { tipo: 'lista', titulo: 'Escribe 3 minutos', items: [
          'De niña me encantaba…',
          'Me sentía libre cuando…',
          'Una forma pequeña de volver a eso esta semana es…',
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: si sientes que ya no te gusta nada, no es que no te guste nada. Es que te desconectaste de ti. Lo que te hacía feliz de niña dice mucho de lo que te llena hoy.' },
        { tipo: 'tarea', texto: 'Elige una cosa de tu lista y hazla esta semana, aunque sea 10 minutos.' },
      ],
    },
    {
      titulo: 'Suelta el cuerpo', resumen: 'Movimiento suave con respiración.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy respiras moviéndote. Puedes hacerlo sentada en una silla.' },
        { tipo: 'rutina', titulo: 'Muévete y respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Hombros arriba y abajo', segundos: 45, nota: 'Súbelos al inhalar, déjalos caer al exhalar.' },
          { nombre: 'Círculos suaves de cuello', segundos: 45, nota: 'Lentos, hacia un lado y luego hacia el otro.' },
          { nombre: 'Gato-vaca sentada', segundos: 60, nota: 'Al inhalar abre el pecho. Al exhalar redondea la espalda.' },
          { nombre: 'Torsión suave', segundos: 60, nota: 'Gira hacia un lado al exhalar, vuelve al inhalar. Cambia de lado.' },
          { nombre: 'Inhala 4 · exhala 6', segundos: 90, respiracion: [['Inhala', 4, 1], ['Exhala', 6, 0.45]], nota: 'Quieta. Siente el cuerpo después de moverlo.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: la mente y el cuerpo se hablan en las dos direcciones. Mover el cuerpo al ritmo de la respiración le avisa a la mente que también puede soltar.' },
        { tipo: 'consejo', texto: 'Muévete solo hasta donde se sienta bien. Nunca hasta el dolor.' },
      ],
    },
    {
      titulo: 'Cierra tu día', resumen: 'Deja los pendientes afuera del cuarto.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy practicas la exhalación más larga del reto. Es tu forma de cerrar el día.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Inhala 4 · exhala 8', segundos: 180, respiracion: [['Inhala', 4, 1], ['Exhala', 8, 0.45]], nota: 'Si 8 es mucho, haz 6. Lo importante es que la exhalación sea más larga.' },
          { nombre: 'Suspiro doble', segundos: 63, respiracion: [['Inhala', 2, 0.82], ['Un sorbito más', 1, 1], ['Exhala lento', 6, 0.45]], nota: 'Unos cuantos, sin prisa.' },
          { nombre: 'Quietud', segundos: 60, nota: 'Respira normal y no hagas nada más.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: una exhalación muy larga es la señal más clara de “ya puedes bajar el ritmo”. Por eso es buena para cerrar el día y dejar los pendientes afuera del cuarto.' },
        { tipo: 'tarea', texto: 'Hazla hoy antes de dormir, ya en la cama y con el celular lejos.' },
      ],
    },
    {
      titulo: 'Respira y agradece', resumen: 'Equilibra la balanza.', duracion: '4 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Hoy cada exhalación lleva un “gracias”.' },
        { tipo: 'rutina', titulo: 'Respira', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Respira con la barriga', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Llega a tu cuerpo.' },
          { nombre: 'Una gracias en cada exhalación', segundos: 120, respiracion: [['Inhala', 4, 1], ['Exhala y agradece', 6, 0.45]], nota: 'Piensa en algo pequeño que agradeces: el café, una canción, alguien.' },
          { nombre: 'Quietud', segundos: 60, nota: 'Quédate con la sensación.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: tu mente busca primero lo que falta. Agradecer a propósito no niega lo difícil: equilibra la balanza.' },
        { tipo: 'tarea', texto: 'Escríbele hoy a alguien que agradeces. Un mensaje corto basta.' },
      ],
    },
    {
      titulo: 'Arma tu rutina de 5 minutos', resumen: 'La que te llevas después del reto.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Ya tienes tus semillas. Hoy armas la rutina que te llevas para seguir.' },
        { tipo: 'lista', titulo: 'Tu rutina', items: [
          'Minuto 1: llega y respira con la barriga',
          'Minutos 2 a 4: tu técnica favorita',
          'Minuto 5: una pregunta para escribir o una gracias',
        ] },
        { tipo: 'rutina', titulo: 'Pruébala', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Respira con la barriga.' },
          { nombre: 'Tu técnica favorita', segundos: 180, nota: 'La que elegiste en el Día 7 o en el Día 14.' },
          { nombre: 'Cierra', segundos: 60, nota: 'Una pregunta o una gracias.' },
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: un hábito se sostiene cuando es tuyo, corto y siempre a la misma hora. No necesitas más.' },
        { tipo: 'tarea', texto: 'Escribe tu rutina en la nota del celular y ponle una alarma diaria {momento}.' },
      ],
    },
    {
      titulo: 'Tu cosecha', resumen: 'Mira todo lo que sembraste.', duracion: '5 min', gratis: false,
      bloques: [
        { tipo: 'texto', texto: 'Llegaste al día 21. No por perfecta: por volver cada día. Eso es sembrar calma.' },
        { tipo: 'rutina', titulo: 'Tu rutina', rondas: 1, descanso: 0, ejercicios: [
          { nombre: 'Llega a este momento', segundos: 60, respiracion: [['Inhala, sube la barriga', 4, 1], ['Exhala, baja la barriga', 6, 0.45]], nota: 'Respira con la barriga.' },
          { nombre: 'Tu técnica favorita', segundos: 180, nota: 'Hoy con todo lo que aprendiste.' },
          { nombre: 'Gracias', segundos: 60, nota: 'A ti, por estos 21 días.' },
        ] },
        { tipo: 'lista', titulo: 'Mira tu cosecha', items: [
          '¿Qué cambió desde el Día 1?',
          '¿Qué técnica te llevas?',
          '¿Cuándo la vas a seguir usando?',
        ] },
        { tipo: 'texto', texto: '💡 Por qué funciona: un hábito no se termina en 21 días. Ahí empieza. Lo que sigue es no practicar sola.' },
        { tipo: 'tarea', texto: 'Comparte tu cosecha conmigo en Instagram. Me encantaría leerte 🌷' },
      ],
    },
  ],

  final: {
    titulo: '¡Completaste tus 21 días!',
    texto: 'Sembraste calma, un respiro a la vez. Si quieres seguir practicando acompañada, con prácticas nuevas cada semana y un encuentro presencial al mes en Bogotá, te espero en Calma Club.',
    cta: { texto: 'Quiero seguir en Calma Club', link: 'https://instagram.com/calmaclubco' },
  },

  pago: {
    titulo: 'Sigue con tu reto',
    texto: 'Desbloquea los 19 días que faltan. Un solo pago, sin suscripción.',
    boton: 'Desbloquear mi reto',
  },

  aviso: 'Estas prácticas son para tu bienestar diario y no reemplazan la orientación de un profesional de la salud. Si te mareas, vuelve a tu respiración normal.',
};
