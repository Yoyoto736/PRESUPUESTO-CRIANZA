import { BudgetItem, FoodItem, WeeklyMealPlan } from './types';

export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [
  // Alimentación
  {
    id: 'b1',
    name: 'Supermercado & Lácteos',
    category: 'Alimentación',
    frequency: 'Mensual',
    cost: 80,
    quantity: 12,
    comment: 'Compra general de víveres, leche entera de crecimiento, cereales fortificados, huevos y víveres para el niño.'
  },
  {
    id: 'b2',
    name: 'Proteínas Especiales (Pollo y Carne)',
    category: 'Alimentación',
    frequency: 'Mensual',
    cost: 40,
    quantity: 12,
    comment: 'Pollo fresco desmechado, carne de res magra tierna y pescado sin espinas para sus almuerzos/cenas semanales.'
  },
  {
    id: 'b3',
    name: 'Frutas y Verduras Frescas',
    category: 'Alimentación',
    frequency: 'Mensual',
    cost: 20,
    quantity: 12,
    comment: 'Suministro semanal de cambur, manzana, auyama, espinacas, plátano, zanahorias y papas.'
  },
  {
    id: 'b4',
    name: 'Agua Filtrada / Mineral',
    category: 'Alimentación',
    frequency: 'Mensual',
    cost: 10,
    quantity: 12,
    comment: 'Agua de alta pureza necesaria para la hidratación libre y preparación de avenas y jugos.'
  },

  // Salud
  {
    id: 'b5',
    name: 'Seguro Médico Pediátrico',
    category: 'Salud y Seguro Médico',
    frequency: 'Mensual',
    cost: 130,
    quantity: 12,
    comment: 'Póliza de salud con cobertura de emergencias, hospitalización y consultas pediátricas integrales.'
  },
  {
    id: 'b6',
    name: 'Consulta Pediátrica Mensual',
    category: 'Salud y Seguro Médico',
    frequency: 'Trimestral',
    cost: 20,
    quantity: 12,
    comment: 'Control rutinario mensual del Niño Sano (monitoreo de peso, talla, desarrollo cognitivo y motor).'
  },
  {
    id: 'b7',
    name: 'Esquema de Vacunas Anual',
    category: 'Salud y Seguro Médico',
    frequency: 'Anual',
    cost: 80,
    quantity: 1,
    comment: 'Refuerzos anuales sugeridos a los 3 años: Neumococo, Meningococo, Influenza anual y Varicela.'
  },
  {
    id: 'b8',
    name: 'Botiquín de Primeros Auxilios',
    category: 'Salud y Seguro Médico',
    frequency: 'Trimestral',
    cost: 20,
    quantity: 4,
    comment: 'Medicamentos básicos: Acetaminofén (antipirético), sueros de rehidratación oral, parches y cremas protectoras cutáneas.'
  },

  // Educación
  {
    id: 'b9',
    name: 'Inscripción Anual Preescolar',
    category: 'Educación y Colegio',
    frequency: 'Anual',
    cost: 150,
    quantity: 1,
    comment: 'Derechos de matrícula anual en centro de educación inicial / maternal para el año lectivo.'
  },
  {
    id: 'b10',
    name: 'Mensualidad del Colegio (Maternal)',
    category: 'Educación y Colegio',
    frequency: 'Mensual',
    cost: 50,
    quantity: 11, // Generalmente 11 meses escolares
    comment: 'Servicio de educación inicial matutina de lunes a viernes, socialización temprana y estimulación de psicomotricidad.'
  },
  {
    id: 'b11',
    name: 'Útiles Escolares y Manualidades',
    category: 'Educación y Colegio',
    frequency: 'Trimestral',
    cost: 50,
    quantity: 4,
    comment: 'Plastilina no tóxica, colores gruesos de cera, block de dibujo, carpetas, temperas escolares y pega de barra.'
  },
  {
    id: 'b12',
    name: 'Uniformes del Colegio',
    category: 'Educación y Colegio',
    frequency: 'Anual',
    cost: 100,
    quantity: 1,
    comment: 'Par de camisas de diario, monos de educación física, shorts de repuesto y morral pequeño adaptado a su espalda.'
  },
  {
    id: 'b15',
    name: 'Transporte',
    category: 'Transporte y Movilidad',
    frequency: 'Mensual',
    cost: 20,
    quantity: 2,
    comment: 'Reserva para cambio de aceite, filtros y amortización por uso urbano dedicado al infante.'
  },
  {
    id: 'b16',
    name: 'Renovación Trimestral de Ropa',
    category: 'Ropa y Vestimenta',
    frequency: 'Trimestral',
    cost: 60,
    quantity: 6,
    comment: 'Adquisición de franelas, shorts y mudas cómodas. Los niños de 3 años cambian de talla aproximadamente cada 2-3 meses.'
  },
  {
    id: 'b17',
    name: 'Calzado de Diario',
    category: 'Ropa y Vestimenta',
    frequency: 'Semestral',
    cost: 50,
    quantity: 4,
    comment: 'Zapatos con suela flexible y soporte adecuado para evitar tropiezos y permitir el correcto desarrollo del arco plantar.'
  },
  {
    id: 'b18',
    name: 'Papel Higienico y Toallas',
    category: 'Ropa y Vestimenta',
    frequency: 'Mensual',
    cost: 5,
    quantity: 12,
    comment: 'Pañales tipo calzón para entrenamiento diurno/nocturno mientras consolida el control de esfínteres definitivo.'
  },
  {
    id: 'b19',
    name: 'Mantenimientos y Arreglos',
    category: 'Mantenimiento y Hogar',
    frequency: 'Semestral',
    cost: 75,
    quantity: 2,
    comment: 'Mantenimiento preventivo de nevera (recarga de gas, limpieza profunda de serpentines y filtros de agua) indispensable para preservar carnes, frutas y papillas higiénicas para el niño.'
  },
  {
    id: 'b22',
    name: 'Detergente Ropa',
    category: 'Mantenimiento y Hogar',
    frequency: 'Mensual',
    cost: 10,
    quantity: 12,
    comment: 'Detergente con pH neutro, libre de perfumes agresivos y colorantes para lavar ropa infantil y frazadas.'
  },
  {
    id: 'b23',
    name: 'Juguetes de Estimulación y Libros',
    category: 'Recreación y Estimulación',
    frequency: 'Trimestral',
    cost: 20,
    quantity: 12,
    comment: 'Rompecabezas de piezas grandes, bloques de construcción de madera, libros sensoriales Ilustrados de cartón grueso.'
  },
  {
    id: 'b24',
    name: 'Natación Inicial / o similar',
    category: 'Recreación y Estimulación',
    frequency: 'Mensual',
    cost: 25,
    quantity: 12,
    comment: 'Curso semanal de natación infantil o matrogimnasia para afianzar la coordinación física y la seguridad acuática.'
  },
  {
    id: 'b25',
    name: 'Salidas al Parque y Recreación',
    category: 'Recreación y Estimulación',
    frequency: 'Mensual',
    cost: 10,
    quantity: 12,
    comment: 'Gastos de parque inflable, helados, entradas a museos infantiles y salidas familiares de fin de semana.'
  }
];

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  { id: 'cambur', name: 'Cambur (Banana)', category: 'Fruta', unit: 'unidad', costPerUnit: 0.15 },
  { id: 'auyama', name: 'Auyama (Calabaza)', category: 'Vegetal', unit: 'g', costPerUnit: 0.0015 }, // per gram, i.e., $1.50 per kg
  { id: 'pollo', name: 'Pollo (Pechuga magra)', category: 'Proteína', unit: 'g', costPerUnit: 0.006 }, // per gram, i.e., $6.00 per kg
  { id: 'carne', name: 'Carne de Res (Magra/Fina)', category: 'Proteína', unit: 'g', costPerUnit: 0.008 }, // per gram, i.e., $8.00 per kg
  { id: 'manzana', name: 'Manzana (Roja/Verde)', category: 'Fruta', unit: 'unidad', costPerUnit: 0.35 },
  { id: 'huevo', name: 'Huevo de Gallina', category: 'Proteína', unit: 'unidad', costPerUnit: 0.20 },
  { id: 'leche', name: 'Leche entera', category: 'Lácteo/Otro', unit: 'ml', costPerUnit: 0.0018 }, // per ml, i.e., $1.80 per Liter
  { id: 'avena', name: 'Avena en Hojuelas', category: 'Carbohidrato', unit: 'g', costPerUnit: 0.003 }, // per g, i.e., $3.00 per kg
  { id: 'arroz', name: 'Arroz blanco selecto', category: 'Carbohidrato', unit: 'g', costPerUnit: 0.0015 },
  { id: 'papa', name: 'Papa blanca (Patata)', category: 'Carbohidrato', unit: 'g', costPerUnit: 0.0012 },
  { id: 'zanahoria', name: 'Zanahoria fresca', category: 'Vegetal', unit: 'g', costPerUnit: 0.0016 },
  { id: 'yogurt', name: 'Yogurt natural sin azúcar', category: 'Lácteo/Otro', unit: 'g', costPerUnit: 0.004 }
];

export const INITIAL_WEEKLY_MEAL_PLAN: WeeklyMealPlan = {
  Lunes: {
    Desayuno: {
      description: 'Avena caliente con leche entera y 1/2 cambur picado en círculos.',
      ingredients: [
        { foodItemId: 'avena', quantityInMeal: 35 },
        { foodItemId: 'leche', quantityInMeal: 150 },
        { foodItemId: 'cambur', quantityInMeal: 0.5 }
      ]
    },
    'Merienda Mañana': {
      description: '1/2 manzana roja cocida con canela, picada en cubos tiernos.',
      ingredients: [
        { foodItemId: 'manzana', quantityInMeal: 0.5 }
      ]
    },
    Almuerzo: {
      description: 'Pechuga de pollo desmechada tierna con puré de auyama suave y una porción pequeña de arroz.',
      ingredients: [
        { foodItemId: 'pollo', quantityInMeal: 75 },
        { foodItemId: 'auyama', quantityInMeal: 100 },
        { foodItemId: 'arroz', quantityInMeal: 80 }
      ]
    },
    'Merienda Tarde': {
      description: 'Yogurt natural sin azúcar con la otra mitad del cambur triturada.',
      ingredients: [
        { foodItemId: 'yogurt', quantityInMeal: 100 },
        { foodItemId: 'cambur', quantityInMeal: 0.5 }
      ]
    },
    Cena: {
      description: 'Tortilla suave de huevo batido con espinacas picaditas y puré de papa templado.',
      ingredients: [
        { foodItemId: 'huevo', quantityInMeal: 1 },
        { foodItemId: 'papa', quantityInMeal: 80 }
      ]
    }
  },
  Martes: {
    Desayuno: {
      description: 'Arepita con aguacate, queso fresco y huevo revuelto suave.',
      ingredients: [
        { foodItemId: 'huevo', quantityInMeal: 1 }
      ]
    },
    'Merienda Mañana': {
      description: '1 cambur entero mediano listo para sostener con su mano.',
      ingredients: [
        { foodItemId: 'cambur', quantityInMeal: 1 }
      ]
    },
    Almuerzo: {
      description: 'Lomito de carne molida magra de res, pasta corta de dedales y bastones de zanahoria al vapor.',
      ingredients: [
        { foodItemId: 'carne', quantityInMeal: 70 },
        { foodItemId: 'zanahoria', quantityInMeal: 50 }
      ]
    },
    'Merienda Tarde': {
      description: '1/2 manzana rallada fresca, rociada con gotas de limón para no oxidar.',
      ingredients: [
        { foodItemId: 'manzana', quantityInMeal: 0.5 }
      ]
    },
    Cena: {
      description: 'Crema espesa de auyama con trozos de queso blanco fresco y una cucharadita de aceite de oliva.',
      ingredients: [
        { foodItemId: 'auyama', quantityInMeal: 150 }
      ]
    }
  },
  Miércoles: {
    Desayuno: {
      description: 'Pancakes de avena molida y 1 cambur maduro con leche.',
      ingredients: [
        { foodItemId: 'avena', quantityInMeal: 40 },
        { foodItemId: 'cambur', quantityInMeal: 1 },
        { foodItemId: 'leche', quantityInMeal: 100 }
      ]
    },
    'Merienda Mañana': {
      description: 'Yogurt natural con rodajas de fresas frescas picaditas para motricidad.',
      ingredients: [
        { foodItemId: 'yogurt', quantityInMeal: 120 }
      ]
    },
    Almuerzo: {
      description: 'Filete de pollo picado en cubos a la plancha con arroz blanco y flores de brócoli al vapor.',
      ingredients: [
        { foodItemId: 'pollo', quantityInMeal: 75 },
        { foodItemId: 'arroz', quantityInMeal: 80 }
      ]
    },
    'Merienda Tarde': {
      description: 'Compota casera de 1 manzana verde cocida templada natural.',
      ingredients: [
        { foodItemId: 'manzana', quantityInMeal: 1 }
      ]
    },
    Cena: {
      description: 'Arepitas de maíz amarillo blando con mantequilla ligera y queso rallado bajo en sal.',
      ingredients: []
    }
  },
  Jueves: {
    Desayuno: {
      description: 'Huevo cocido cortado por la mitad, rebanadas de pan de avena untado con queso crema.',
      ingredients: [
        { foodItemId: 'huevo', quantityInMeal: 1 }
      ]
    },
    'Merienda Mañana': {
      description: '1 cambur entero para comer de forma independiente.',
      ingredients: [
        { foodItemId: 'cambur', quantityInMeal: 1 }
      ]
    },
    Almuerzo: {
      description: 'Albóndigas de carne de res molida, puré de papas con leche y judías verdes picaditas.',
      ingredients: [
        { foodItemId: 'carne', quantityInMeal: 70 },
        { foodItemId: 'papa', quantityInMeal: 100 },
        { foodItemId: 'leche', quantityInMeal: 30 }
      ]
    },
    'Merienda Tarde': {
      description: 'Palitos suaves de manzana helada para calmar las encías en crecimiento.',
      ingredients: [
        { foodItemId: 'manzana', quantityInMeal: 0.8 }
      ]
    },
    Cena: {
      description: 'Sopita reconfortante de verduras finas y fideos junto con crema de auyama.',
      ingredients: [
        { foodItemId: 'auyama', quantityInMeal: 100 }
      ]
    }
  },
  Viernes: {
    Desayuno: {
      description: 'Avena en hojuelas cocida en leche purificada con fresas cortadas por la mitad.',
      ingredients: [
        { foodItemId: 'avena', quantityInMeal: 35 },
        { foodItemId: 'leche', quantityInMeal: 150 }
      ]
    },
    'Merienda Mañana': {
      description: 'Puré de auyama horneada espolvoreado con una pisca de canela.',
      ingredients: [
        { foodItemId: 'auyama', quantityInMeal: 80 }
      ]
    },
    Almuerzo: {
      description: 'Pollo guisado suave con zanahoria, cebolla y papa, servido con puré de plátano.',
      ingredients: [
        { foodItemId: 'pollo', quantityInMeal: 80 },
        { foodItemId: 'papa', quantityInMeal: 60 },
        { foodItemId: 'zanahoria', quantityInMeal: 40 }
      ]
    },
    'Merienda Tarde': {
      description: 'Batido cremoso de leche entera y 1 cambur mediano sin azúcar añadido.',
      ingredients: [
        { foodItemId: 'leche', quantityInMeal: 180 },
        { foodItemId: 'cambur', quantityInMeal: 1 }
      ]
    },
    Cena: {
      description: 'Quesadilla blanda con tortilla de trigo integral, queso derretido y aguacate triturado.',
      ingredients: []
    }
  },
  Sábado: {
    Desayuno: {
      description: 'Arepitas de maíz rellenas de huevo revuelto con tomate picadito (huevo perico).',
      ingredients: [
        { foodItemId: 'huevo', quantityInMeal: 1 }
      ]
    },
    'Merienda Mañana': {
      description: 'Gajos finos de 1 manzana untados ligeramente con una película delgada de crema de maní pura.',
      ingredients: [
        { foodItemId: 'manzana', quantityInMeal: 1 }
      ]
    },
    Almuerzo: {
      description: 'Carne de res tierna a la plancha picada en tiritas cómodas, arroz y puré de auyama.',
      ingredients: [
        { foodItemId: 'carne', quantityInMeal: 75 },
        { foodItemId: 'arroz', quantityInMeal: 80 },
        { foodItemId: 'auyama', quantityInMeal: 100 }
      ]
    },
    'Merienda Tarde': {
      description: 'Yogurt natural con granola fina e higienizada.',
      ingredients: [
        { foodItemId: 'yogurt', quantityInMeal: 100 }
      ]
    },
    Cena: {
      description: 'Trocitos de pechuga de pollo asado con papas rústicas al horno muy suaves.',
      ingredients: [
        { foodItemId: 'pollo', quantityInMeal: 60 },
        { foodItemId: 'papa', quantityInMeal: 80 }
      ]
    }
  },
  Domingo: {
    Desayuno: {
      description: 'Waffles caseros de avena, plátano y huevo licuados, decorados con 1/2 cambur.',
      ingredients: [
        { foodItemId: 'avena', quantityInMeal: 40 },
        { foodItemId: 'huevo', quantityInMeal: 1 },
        { foodItemId: 'cambur', quantityInMeal: 0.5 }
      ]
    },
    'Merienda Mañana': {
      description: 'Ensalada festiva de frutas (trozos pequeños de cambur, manzana y papaya).',
      ingredients: [
        { foodItemId: 'cambur', quantityInMeal: 0.5 },
        { foodItemId: 'manzana', quantityInMeal: 0.4 }
      ]
    },
    Almuerzo: {
      description: 'Sopa casera de pollo criolla con trozos de papa, zanahoria, cilantro y abundante auyama tierna.',
      ingredients: [
        { foodItemId: 'pollo', quantityInMeal: 70 },
        { foodItemId: 'auyama', quantityInMeal: 120 },
        { foodItemId: 'papa', quantityInMeal: 60 },
        { foodItemId: 'zanahoria', quantityInMeal: 40 }
      ]
    },
    'Merienda Tarde': {
      description: 'Sándwich de pan de molde blanco tostado con una lonja fina de queso fresco derretido.',
      ingredients: []
    },
    Cena: {
      description: 'Croquetas de papa horneadas combinadas con atún al natural desmechado.',
      ingredients: [
        { foodItemId: 'papa', quantityInMeal: 100 }
      ]
    }
  }
};
