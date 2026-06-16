import * as XLSX from 'xlsx';
import { BudgetItem, WeeklyMealPlan, FoodItem, MealType, DayOfWeek } from './types';

export function exportBudgetToExcel(
  budgetItems: BudgetItem[],
  mealPlan: WeeklyMealPlan,
  foodItems: FoodItem[],
  consolidatedIngredients: Array<{
    id: string;
    name: string;
    category: string;
    weeklyQty: number;
    monthlyQty: number;
    unit: string;
    totalCost: number;
  }>
) {
  const wb = XLSX.utils.book_new();

  // --- Calculate Key Dashboard Metrics ---
  const totalMonthly = budgetItems.reduce((acc, item) => acc + getMonthlyCost(item), 0);
  const totalAnnual = budgetItems.reduce((acc, item) => acc + getAnnualCost(item), 0);

  let camburQty = 0;
  let auyamaQty = 0;
  let polloQty = 0;
  let carneQty = 0;
  let manzanaQty = 0;

  Object.values(mealPlan).forEach((dayPlan: any) => {
    Object.values(dayPlan).forEach((meal: any) => {
      if (meal.ingredients) {
        meal.ingredients.forEach((i: any) => {
          if (i.foodItemId === 'cambur') camburQty += i.quantityInMeal;
          if (i.foodItemId === 'auyama') auyamaQty += i.quantityInMeal;
          if (i.foodItemId === 'pollo') polloQty += i.quantityInMeal;
          if (i.foodItemId === 'carne') carneQty += i.quantityInMeal;
          if (i.foodItemId === 'manzana') manzanaQty += i.quantityInMeal;
        });
      }
    });
  });

  // --- SHEET 0: DASHBOARD INTERACTIVO DE CRIANZA ---
  const dashboardRows: any[][] = [
    ['DASHBOARD DE CONTROL DE CRIANZA - NIÑO DE 3 AÑOS'],
    ['Centro de Comando Financiero y Alimentario para la Crianza Saludable'],
    [],
    ['1. INDICADORES CLAVE DE RENDIMIENTO (KPIs)'],
    ['Métrica / Indicador', 'Valor Registrado', 'Unidad de Medida', 'Impacto y Justificación del Indicador'],
    ['Presupuesto Mensual Equivalente', Number(totalMonthly.toFixed(2)), 'USD / mes', 'Prone a amortizar todos los pagos fijos, escolares y compras de supermercado.'],
    ['Presupuesto Anual Proyectado', Number(totalAnnual.toFixed(2)), 'USD / año', 'Suma acumulada anual previendo colegios, seguros, calzados y mantenimiento.'],
    ['Consumo Semanal de Cambur (Banana)', Number(camburQty.toFixed(1)), 'Unidades', 'Fruta esencial rica en potasio y de digestión autónoma óptima.'],
    ['Consumo Semanal de Auyama (Calabaza)', Number(auyamaQty.toFixed(1)), 'Gramos', 'Carbohidrato complejo de bajo índice glucémico y excelente tolerancia.'],
    ['Consumo Semanal de Proteína de Pollo', Number(polloQty.toFixed(1)), 'Gramos', 'Fuente principal de aminoácidos esenciales para el desarrollo muscular.'],
    ['Consumo Semanal de Proteína de Carne', Number(carneQty.toFixed(1)), 'Gramos', 'Aporte de hierro hemínico indispensable para prevenir la anemia infantil.'],
    ['Consumo Semanal de Manzana', Number(manzanaQty.toFixed(1)), 'Unidades', 'Aporta quercetina, pectina y mejora la limpieza dental del infante.'],
    ['Mantenimiento Preventivo Higiénico', 'Neveras, Licuadoras & Aire Acond.', 'Servicios Semestrales', 'Previene el desarrollo bacteriano (Salmonella/Listeria) y alérgenos respiratorios.'],
    [],
    ['2. RESUMEN DE GASTOS POR CATEGORÍA DE CONTROL'],
    ['Categoría de Gasto', 'Gasto Mensual ($)', 'Distribución (%)', 'Justificación de Relevancia'],
  ];

  // Populate categories dynamically inside Dashboard sheet
  const categories: string[] = [
    'Alimentación',
    'Salud y Seguro Médico',
    'Educación y Colegio',
    'Transporte y Movilidad',
    'Ropa y Vestimenta',
    'Mantenimiento y Hogar',
    'Recreación y Estimulación'
  ];

  categories.forEach(category => {
    const categoryCost = budgetItems
      .filter(i => i.category === category)
      .reduce((sum, i) => sum + getMonthlyCost(i), 0);
    const percentage = totalMonthly > 0 ? (categoryCost / totalMonthly) * 100 : 0;
    
    let advice = '';
    if (category === 'Alimentación') advice = 'Alimentación saludable balanceada con porciones de pollo, carne, cambur y auyama.';
    else if (category === 'Salud y Seguro Médico') advice = 'Garantía de vacunas, consultas pediatra del niño sano y urgencias.';
    else if (category === 'Educación y Colegio') advice = 'Preescolar para socialización temprana y desarrollo de motricidad.';
    else if (category === 'Transporte y Movilidad') advice = 'Combustible de traslado escolar y silla para auto homologada obligatoria.';
    else if (category === 'Ropa y Vestimenta') advice = 'Renovación constante de calzado y ropa infantil por rápido crecimiento.';
    else if (category === 'Mantenimiento y Hogar') advice = 'Mantenimiento preventivo de neveras, licuadoras, AC e insumos de aseo neutros.';
    else if (category === 'Recreación y Estimulación') advice = 'Natación infantil inicial, juegos de lógica y salidas de fin de semana.';

    dashboardRows.push([
      category,
      Number(categoryCost.toFixed(2)),
      Number(percentage.toFixed(1)) + '%',
      advice
    ]);
  });

  dashboardRows.push([]);
  dashboardRows.push(['3. DICTÁMENES DE HIGIENE Y NUTRICIÓN RELEVANTES A LOS 3 AÑOS']);
  dashboardRows.push(['- Higiene Frigorífica:', 'El mantenimiento semestral de la nevera asegura una temperatura física idónea menor a 4°C, vital para prevenir la listeria en sopas de auyama o pollo desmechado.']);
  dashboardRows.push(['- Licuadora & Procesador:', 'Humedad remanente de cambures e ingredientes paperos promueve moho microscópico si no se desinfecta de forma regular.']);
  dashboardRows.push(['- Racionamiento Diario:', 'Las manzanas y cambures acumulados en el consolidado ayudan a vigilar el estreñimiento típico del desarrollo preescolar.']);

  const wsDashboard = XLSX.utils.aoa_to_sheet(dashboardRows);
  
  // Design column layout sizes
  wsDashboard['!cols'] = [
    { wch: 38 }, // Aspect
    { wch: 25 }, // Registered Value
    { wch: 22 }, // Unit/Distribution
    { wch: 75 }  // Impact and Advice
  ];
  XLSX.utils.book_append_sheet(wb, wsDashboard, 'Dashboard de Resumen');

  // 1. sheet: Presupuesto General
  const budgetSheetData: any[] = budgetItems.map((item, index) => {
    const monthlyCost = getMonthlyCost(item);
    const annualCost = getAnnualCost(item);
    return {
      'No.': index + 1,
      'Categoría': item.category,
      'Gasto / Rubro': item.name,
      'Frecuencia de Pago': item.frequency,
      'Costo de Referencia (USD)': item.cost,
      'Ocurrencias / Cantidad al Año': item.quantity,
      'Costo Mensual Equiv. (USD)': Number(monthlyCost.toFixed(2)),
      'Costo Anual Total (USD)': Number(annualCost.toFixed(2)),
      'Justificación y Recomendaciones': item.comment,
    };
  });

  budgetSheetData.push({
    'No.': 0,
    'Categoría': 'TOTAL GENERAL',
    'Gasto / Rubro': 'Consolidado de Gastos de Crianza',
    'Frecuencia de Pago': '-',
    'Costo de Referencia (USD)': 0,
    'Ocurrencias / Cantidad al Año': 0,
    'Costo Mensual Equiv. (USD)': Number(totalMonthly.toFixed(2)),
    'Costo Anual Total (USD)': Number(totalAnnual.toFixed(2)),
    'Justificación y Recomendaciones': 'Incluye mantenimiento de nevera, seguro de salud, colegio, proteínas específicas, etc.'
  });

  const wsBudget = XLSX.utils.json_to_sheet(budgetSheetData);
  
  // Set column widths
  wsBudget['!cols'] = [
    { wch: 5 },   // No
    { wch: 25 },  // Category
    { wch: 35 },  // Name
    { wch: 18 },  // Frequency
    { wch: 22 },  // Cost
    { wch: 25 },  // Quantity/Year
    { wch: 22 },  // Monthly cost
    { wch: 20 },  // Annual cost
    { wch: 60 }   // Comment
  ];
  XLSX.utils.book_append_sheet(wb, wsBudget, 'Presupuesto de Crianza');

  // 2. sheet: Menú Semanal Detallado
  const mealSheetData: any[] = [];
  const days: DayOfWeek[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const meals: MealType[] = ['Desayuno', 'Merienda Mañana', 'Almuerzo', 'Merienda Tarde', 'Cena'];

  days.forEach((day) => {
    meals.forEach((mealType) => {
      const meal = mealPlan[day][mealType];
      const ingredientDetails = meal.ingredients.map(ing => {
        const food = foodItems.find(f => f.id === ing.foodItemId);
        if (!food) return '';
        return `${food.name}: ${ing.quantityInMeal}${food.unit}`;
      }).filter(Boolean).join(', ');

      mealSheetData.push({
        'Día': day,
        'Momento del Día': mealType,
        'Descripción del Menú': meal.description,
        'Ingredientes Exhaustivos': ingredientDetails || 'Sin ingredientes pesados'
      });
    });
  });

  const wsMeals = XLSX.utils.json_to_sheet(mealSheetData);
  wsMeals['!cols'] = [
    { wch: 12 }, // Day
    { wch: 18 }, // Meal time
    { wch: 55 }, // Description
    { wch: 45 }  // Ingredients
  ];
  XLSX.utils.book_append_sheet(wb, wsMeals, 'Agenda de Alimentación');

  // 3. sheet: Consolidado de Nutrientes (Cambur, Auyama, Pollo...)
  const ingredientSheetData = consolidatedIngredients.map((item) => {
    return {
      'Ingrediente': item.name,
      'Categoría Nutricional': item.category,
      'Cantidad Semanal total': `${Number(item.weeklyQty.toFixed(2))} ${item.unit}`,
      'Cantidad Mensual total (Estimada)': `${Number(item.monthlyQty.toFixed(2))} ${item.unit}`,
      'Costo Aprox Unitario ($)': item.category === 'Fruta' || item.category === 'Lácteo/Otro' && item.unit === 'unidad' ? `$${item.totalCost / Math.max(item.weeklyQty, 1)}` : `Costo calculado`,
      'Costo Total Semanal Est. (USD)': `$${Number((item.weeklyQty * getCostFactor(item.id, foodItems)).toFixed(2))}`,
      'Costo Total Mensual Est. (USD)': `$${Number((item.monthlyQty * getCostFactor(item.id, foodItems)).toFixed(2))}`
    };
  });

  const wsIngredients = XLSX.utils.json_to_sheet(ingredientSheetData);
  wsIngredients['!cols'] = [
    { wch: 25 }, // Ingredient
    { wch: 20 }, // Category
    { wch: 22 }, // Weekly Qty
    { wch: 25 }, // Monthly Qty
    { wch: 25 }, // Unit Cost
    { wch: 24 }, // Weekly Total Cost
    { wch: 24 }  // Monthly Total Cost
  ];
  XLSX.utils.book_append_sheet(wb, wsIngredients, 'Consolidado de Comida');

  // Generate Excel file and trigger download
  XLSX.writeFile(wb, 'Presupuesto_Completo_Crianza_3_Anos.xlsx');
}

// Utility functions
export function getMonthlyCost(item: BudgetItem): number {
  switch (item.frequency) {
    case 'Mensual':
      return item.cost;
    case 'Bimensual':
      return item.cost / 2;
    case 'Trimestral':
      return item.cost / 3;
    case 'Semestral':
      return item.cost / 6;
    case 'Anual':
      return item.cost / 12;
    case 'Única vez':
      return item.cost / 12; // Amortized in typical annual budget
    default:
      return 0;
  }
}

export function getAnnualCost(item: BudgetItem): number {
  switch (item.frequency) {
    case 'Mensual':
      return item.cost * item.quantity;
    case 'Bimensual':
      return (item.cost * 6);
    case 'Trimestral':
      return (item.cost * 4);
    case 'Semestral':
      return (item.cost * 2);
    case 'Anual':
      return item.cost * item.quantity;
    case 'Única vez':
      return item.cost;
    default:
      return 0;
  }
}

function getCostFactor(foodItemId: string, foodItems: FoodItem[]): number {
  const food = foodItems.find(f => f.id === foodItemId);
  return food ? food.costPerUnit : 0;
}
