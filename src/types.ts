export interface BudgetItem {
  id: string;
  name: string;
  category: BudgetCategory;
  frequency: 'Mensual' | 'Bimensual' | 'Trimestral' | 'Semestral' | 'Anual' | 'Única vez';
  cost: number; // Cost in USD
  quantity: number; // e.g. times per year or units per month
  comment: string;
}

export type BudgetCategory =
  | 'Alimentación'
  | 'Salud y Seguro Médico'
  | 'Educación y Colegio'
  | 'Transporte y Movilidad'
  | 'Ropa y Vestimenta'
  | 'Mantenimiento y Hogar'
  | 'Recreación y Estimulación';

export interface FoodItem {
  id: string;
  name: string;
  category: 'Fruta' | 'Proteína' | 'Vegetal' | 'Carbohidrato' | 'Lácteo/Otro';
  unit: 'g' | 'unidad' | 'ml' | 'porción';
  costPerUnit: number; // For cost estimations
}

// Map of food item to quantity in a meal
export interface IngredientPortion {
  foodItemId: string; // references FoodItem id, e.g. 'cambur', 'pollo', 'carne', 'auyama', 'manzana'
  quantityInMeal: number; // numerical quantity
}

export interface Meal {
  description: string;
  ingredients: IngredientPortion[];
}

export type DayOfWeek = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo';
export type MealType = 'Desayuno' | 'Merienda Mañana' | 'Almuerzo' | 'Merienda Tarde' | 'Cena';

export type DailyMealPlan = Record<MealType, Meal>;

export type WeeklyMealPlan = Record<DayOfWeek, DailyMealPlan>;
