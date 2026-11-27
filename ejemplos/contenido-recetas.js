// Ejemplo de mini app en modo CATÁLOGO ('libre'): recetas. Para usarlo, cópialo sobre contenido.js.
// Muestra que la unidad, la cantidad y el orden son a tu medida.
window.APP = {
  marca: 'Cena en 20',
  titulo: 'Cenas ricas en 20 minutos',
  promesa: 'Recetas fáciles con lo que ya tienes en la nevera.',
  imagen: '',
  botonEmpezar: 'Ver recetas',
  unidad: { singular: 'receta', plural: 'recetas' },
  orden: 'libre',
  categorias: ['Con pollo', 'Vegetarianas', 'Con huevo'],
  textos: { hecho: 'La preparé' },
  preguntas: [
    { id: 'personas', texto: '¿Para cuántas personas cocinas?', opciones: [
      { valor: '1 persona', texto: 'Solo para mí', emoji: '🙋' },
      { valor: '2 personas', texto: 'Para 2', emoji: '👫' },
      { valor: '4 personas', texto: 'Para la familia', emoji: '👨‍👩‍👧‍👦' },
    ] },
  ],
  items: [
    { titulo: 'Pollo al limón en sartén', resumen: 'Jugoso y con 5 ingredientes.', duracion: '20 min', categoria: 'Con pollo', gratis: true, bloques: [
      { tipo: 'lista', titulo: 'Ingredientes (para {personas})', items: ['Pechuga de pollo', '1 limón', '2 dientes de ajo', 'Aceite de oliva', 'Sal y pimienta'] },
      { tipo: 'pasos', titulo: 'Preparación', items: ['Corta el pollo en tiras.', 'Dora el ajo 1 minuto.', 'Agrega el pollo y cocina 8 minutos.', 'Exprime el limón y deja reducir 2 minutos.'] },
      { tipo: 'consejo', texto: 'Sirve con arroz del día anterior: queda perfecto.' },
    ] },
    { titulo: 'Tortilla de verduras', resumen: 'Para cuando no hay nada.', duracion: '15 min', categoria: 'Con huevo', gratis: true, bloques: [
      { tipo: 'lista', titulo: 'Ingredientes', items: ['4 huevos', 'Media cebolla', 'Lo que haya de verduras', 'Queso (opcional)'] },
      { tipo: 'pasos', titulo: 'Preparación', items: ['Sofríe la cebolla y las verduras.', 'Bate los huevos y viértelos.', 'Tapa y cocina a fuego bajo 6 minutos.'] },
    ] },
    { titulo: 'Bowl de garbanzos', resumen: 'Crujiente y lleno de sabor.', duracion: '15 min', categoria: 'Vegetarianas', gratis: false, bloques: [] },
    { titulo: 'Pasta cremosa de espinaca', resumen: 'Sin crema de leche.', duracion: '20 min', categoria: 'Vegetarianas', gratis: false, bloques: [] },
    { titulo: 'Wraps de pollo', resumen: 'Para comer con las manos.', duracion: '15 min', categoria: 'Con pollo', gratis: false, bloques: [] },
  ],
  final: { titulo: '¡Las probaste todas!', texto: 'Ya tienes tu repertorio de cenas rápidas.', cta: null },
  pago: { titulo: 'Desbloquea todas las recetas', texto: 'Más de 40 cenas en 20 minutos, para siempre.', boton: 'Desbloquear por 9 USD' },
  aviso: '',
};
