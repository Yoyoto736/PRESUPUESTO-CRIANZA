import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Baby,
  Calendar,
  DollarSign,
  Download,
  Edit2,
  Plus,
  Trash2,
  Wrench,
  Activity,
  Apple,
  Clock,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle,
  HelpCircle,
  Shield,
  UtensilsCrossed,
  Layers,
  Check
} from 'lucide-react';
import { BudgetItem, WeeklyMealPlan, FoodItem, BudgetCategory, DayOfWeek, MealType, Meal } from './types';
import { INITIAL_BUDGET_ITEMS, INITIAL_FOOD_ITEMS, INITIAL_WEEKLY_MEAL_PLAN } from './initialData';
import { exportBudgetToExcel, getMonthlyCost, getAnnualCost } from './excelUtils';

export default function App() {
  // State
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    const saved = localStorage.getItem('budget_data');
    return saved ? JSON.parse(saved) : INITIAL_BUDGET_ITEMS;
  });

  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan>(() => {
    const saved = localStorage.getItem('meal_plan_data');
    return saved ? JSON.parse(saved) : INITIAL_WEEKLY_MEAL_PLAN;
  });

  const [foodItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);

  useEffect(() => {
    localStorage.setItem('budget_data', JSON.stringify(budgetItems));
  }, [budgetItems]);

  useEffect(() => {
    localStorage.setItem('meal_plan_data', JSON.stringify(mealPlan));
  }, [mealPlan]);
  
  // UI States
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'meals' | 'totals'>('dashboard');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Lunes');
  const [selectedMealType, setSelectedMealType] = useState<MealType>('Almuerzo');
  const [filterCategory, setFilterCategory] = useState<BudgetCategory | 'Todos'>('Todos');
  
  // Editing State for Budget
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BudgetItem>>({});
  
  // Adding State for Budget
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState<Omit<BudgetItem, 'id'>>({
    name: '',
    category: 'Alimentación',
    frequency: 'Mensual',
    cost: 10,
    quantity: 12,
    comment: '',
  });

  // Ingredient Editing State
  const [isEditingMealIngredients, setIsEditingMealIngredients] = useState(false);
  const [mealEditDescription, setMealEditDescription] = useState('');
  const [mealIngredientsList, setMealIngredientsList] = useState<Array<{ foodItemId: string; quantity: number }>>([]);

  // Toast / Status Message
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Calculations ---
  
  // Total costs
  const totalMonthlyCost = useMemo(() => {
    return budgetItems.reduce((acc, item) => acc + getMonthlyCost(item), 0);
  }, [budgetItems]);

  const totalAnnualCost = useMemo(() => {
    return budgetItems.reduce((acc, item) => acc + getAnnualCost(item), 0);
  }, [budgetItems]);

  // Consolidate ingredient quantities dynamically across the entire weekly meal plan!
  // E.g., if cambur is used on Monday and Thursday, accumulate them.
  const consolidatedIngredients = useMemo(() => {
    const accumulator: Record<string, number> = {};

    // Prime the accumulator with 0s for all known food items to ensure they show up in statistics
    foodItems.forEach(item => {
      accumulator[item.id] = 0;
    });

    // Loop through all days and meals in the plan
    Object.keys(mealPlan).forEach((dayKey) => {
      const dayPlan = mealPlan[dayKey as DayOfWeek];
      Object.keys(dayPlan).forEach((mealKey) => {
        const meal = dayPlan[mealKey as MealType];
        meal.ingredients.forEach((ing) => {
          if (accumulator[ing.foodItemId] !== undefined) {
            accumulator[ing.foodItemId] += ing.quantityInMeal;
          } else {
            accumulator[ing.foodItemId] = ing.quantityInMeal;
          }
        });
      });
    });

    // Format results with names and units
    return Object.entries(accumulator).map(([id, weeklyQty]) => {
      const foodItem = foodItems.find(f => f.id === id);
      const name = foodItem ? foodItem.name : id;
      const category = foodItem ? foodItem.category : 'Otros';
      const unit = foodItem ? foodItem.unit : 'g';
      const costPerUnit = foodItem ? foodItem.costPerUnit : 0;

      return {
        id,
        name,
        category,
        weeklyQty,
        monthlyQty: weeklyQty * 4.33, // 4.33 weeks per average month
        unit,
        totalCost: weeklyQty * costPerUnit,
      };
    }).sort((a, b) => b.weeklyQty - a.weeklyQty);
  }, [mealPlan, foodItems]);

  // Budget items filtered
  const filteredBudgetItems = useMemo(() => {
    if (filterCategory === 'Todos') return budgetItems;
    return budgetItems.filter(item => item.category === filterCategory);
  }, [budgetItems, filterCategory]);

  // --- Budget CRUD Actions ---
  
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemForm.name.trim()) return;

    const newItem: BudgetItem = {
      id: `custom_${Date.now()}`,
      ...newItemForm
    };

    setBudgetItems(prev => [newItem, ...prev]);
    setIsAddingItem(false);
    setNewItemForm({
      name: '',
      category: 'Alimentación',
      frequency: 'Mensual',
      cost: 10,
      quantity: 12,
      comment: '',
    });
    showNotification(`Elemento "${newItem.name}" añadido exitosamente.`);
  };

  const handleStartEdit = (item: BudgetItem) => {
    setEditingItemId(item.id);
    setEditForm(item);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.id) return;

    setBudgetItems(prev => prev.map(item => item.id === editForm.id ? (editForm as BudgetItem) : item));
    setEditingItemId(null);
    setEditForm({});
    showNotification('Gasto actualizado correctamente.');
  };

  const handleDeleteItem = (id: string, name: string) => {
    if (confirm(`¿Estás seguro de eliminar "${name}" del presupuesto?`)) {
      setBudgetItems(prev => prev.filter(item => item.id !== id));
      showNotification(`"${name}" ha sido eliminado.`, 'info');
    }
  };

  const resetToDefaults = () => {
    if (confirm('¿Deseas restaurar todos los valores del presupuesto y menú por defecto? Se perderán tus cambios.')) {
      setBudgetItems(INITIAL_BUDGET_ITEMS);
      setMealPlan(INITIAL_WEEKLY_MEAL_PLAN);
      showNotification('Restaurados valores originales de crianza.', 'info');
    }
  };

  // --- Meal Plan Editing Actions ---
  
  const openEditMealModal = () => {
    const currentMeal = mealPlan[selectedDay][selectedMealType];
    setMealEditDescription(currentMeal.description);
    
    // Map current ingredients
    const mapped = foodItems.map(food => {
      const active = currentMeal.ingredients.find(i => i.foodItemId === food.id);
      return {
        foodItemId: food.id,
        quantity: active ? active.quantityInMeal : 0
      };
    });
    setMealIngredientsList(mapped);
    setIsEditingMealIngredients(true);
  };

  const handleSaveMealIngredients = () => {
    // Filter out 0 quantity ingredients
    const activeIngredients = mealIngredientsList
      .filter(item => item.quantity > 0)
      .map(item => ({
        foodItemId: item.foodItemId,
        quantityInMeal: item.quantity
      }));

    const updatedMealPlan = { ...mealPlan };
    updatedMealPlan[selectedDay][selectedMealType] = {
      description: mealEditDescription,
      ingredients: activeIngredients
    };

    setMealPlan(updatedMealPlan);
    setIsEditingMealIngredients(false);
    showNotification(`Se actualizó el menú del ${selectedDay} (${selectedMealType}). Los totales nutricionales se recalcularon de inmediato.`);
  };

  const updateMealIngredientDirectly = (foodId: string, value: number) => {
    setMealIngredientsList(prev => prev.map(item => {
      if (item.foodItemId === foodId) {
        return { ...item, quantity: Math.max(0, value) };
      }
      return item;
    }));
  };

  // --- Excel Export Trigger ---
  const handleExport = () => {
    try {
      exportBudgetToExcel(budgetItems, mealPlan, foodItems, consolidatedIngredients);
      showNotification('¡Archivo Excel generado correctamente y listo para descargar!', 'success');
    } catch (error) {
      console.error(error);
      showNotification('Sucedió un error al generar el archivo Excel.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#2C2C2A] font-sans selection:bg-[#E5E5E0] selection:text-[#1C1C1A]" id="app-root">
      
      {/* Header Panel */}
      <header className="sticky top-0 z-40 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-[#EBEBE8] py-4 px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#EFEFEA] rounded-xl text-emerald-700 shadow-sm border border-[#E1E1DC]" id="app-logo">
              <Baby className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-[#1A1A18]">Presupuesto Integral de Crianza</h1>
                <span className="text-xs bg-[#E8F0EB] text-emerald-800 font-medium px-2 py-0.5 rounded-full border border-[#D5E5DC]">
                  3 Años
                </span>
              </div>
              <p className="text-xs md:text-sm text-gray-500">Estimación de gastos detallada, alimentación diaria, e instrumental para control de porciones</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              id="btn-restore"
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F2F2EC] text-[#555550] border border-[#DCDCD8] rounded-xl text-xs font-medium cursor-pointer transition-all duration-200"
              title="Restablecer todos los datos originales"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restaurar Original
            </button>
            <button
              id="btn-export-excel"
              onClick={handleExport}
              className="flex items-center gap-2 px-4.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm hover:shadow-md rounded-xl text-xs md:text-sm font-semibold cursor-pointer transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Descargar Excel (.xlsx)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        
        {/* Dynamic Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 mx-auto max-w-2xl bg-[#1A1A17] text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg border border-[#333330]"
              id="notification-toast"
            >
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Check className="w-4 h-4" />
              </div>
              <p className="text-xs md:text-sm font-medium flex-1">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white text-xs px-2 py-1">
                Cerrar
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Stats Overview Dashboard */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8" id="overview-widgets">
          
          <div className="bg-white p-5 rounded-2xl border border-[#EBEBE8] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Presupuesto Mensual</span>
              <p className="text-2xl md:text-3xl font-bold text-[#1A1A18] tracking-tight">
                ${totalMonthlyCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-gray-500 font-medium">Equivalencia mensual total prorrateada</p>
            </div>
            <div className="p-3 bg-[#f0f8ff] text-blue-700 rounded-xl border border-[#e1efff]">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEBE8] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Presupuesto Anual</span>
              <p className="text-2xl md:text-3xl font-bold text-[#1A1A18] tracking-tight">
                ${totalAnnualCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-700 font-medium">Suma anual consolidada</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <Activity className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEBE8] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Consumo de Cambur</span>
              <p className="text-2xl md:text-3xl font-bold text-[#1A1A18] tracking-tight">
                {consolidatedIngredients.find(i => i.id === 'cambur')?.weeklyQty || 0} u.
              </p>
              <p className="text-[11px] text-amber-700 font-medium">
                Semanal ({((consolidatedIngredients.find(i => i.id === 'cambur')?.weeklyQty || 0) * 4.33).toFixed(1)} u/mes)
              </p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
              <Apple className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EBEBE8] shadow-xs flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Mantenimiento Preventivo</span>
              <p className="text-lg font-semibold text-[#1A1A18] leading-tight">Neveras, Licuadora, AC</p>
              <p className="text-[11px] text-[#71716A] leading-relaxed">Preservación microbiológica e higiene crucial para 3 años.</p>
            </div>
            <div className="p-3 bg-[#FAF8F5] text-amber-900 rounded-xl border border-[#EAE6DF]">
              <Wrench className="w-6 h-6" />
            </div>
          </div>

        </section>

        {/* Modular Tabs Navigation */}
        <nav className="flex border-b border-[#EBEBE8] mb-8 gap-1 overflow-x-auto pb-px" id="tab-navigation">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-5 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer transition-all duration-150 ${
              activeTab === 'dashboard'
                ? 'border-[#2C2C2A] text-[#1A1A18]'
                : 'border-transparent text-gray-400 hover:text-[#555550]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              Tablero de Resumen
            </div>
          </button>
          <button
            onClick={() => setActiveTab('budget')}
            className={`px-5 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer transition-all duration-150 ${
              activeTab === 'budget'
                ? 'border-[#2C2C2A] text-[#1A1A18]'
                : 'border-transparent text-gray-400 hover:text-[#555550]'
            }`}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Presupuesto Exhaustivo ({budgetItems.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('meals')}
            className={`px-5 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer transition-all duration-150 ${
              activeTab === 'meals'
                ? 'border-[#2C2C2A] text-[#1A1A18]'
                : 'border-transparent text-gray-400 hover:text-[#555550]'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Distribución Nutricional Diaria
            </div>
          </button>
          <button
            onClick={() => setActiveTab('totals')}
            className={`px-5 py-3 text-xs md:text-sm font-medium border-b-2 whitespace-nowrap cursor-pointer transition-all duration-150 ${
              activeTab === 'totals'
                ? 'border-[#2C2C2A] text-[#1A1A18]'
                : 'border-transparent text-gray-400 hover:text-[#555550]'
            }`}
          >
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4" />
              Consolidado de Comida Semanal / Mensual
            </div>
          </button>
        </nav>

        {/* Screen 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
            id="screen-dashboard"
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Cost Breakdown Charts */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-[#EBEBE8] space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A18]">Estructura de Costes de Crianza</h3>
                  <p className="text-xs text-gray-500">Distribución porcentual de los costos mensuales para un niño de 3 años</p>
                </div>

                <div className="space-y-4">
                  {([
                    { category: 'Alimentación', color: 'bg-emerald-600', text: 'text-emerald-700' },
                    { category: 'Salud y Seguro Médico', color: 'bg-blue-600', text: 'text-blue-700' },
                    { category: 'Educación y Colegio', color: 'bg-purple-600', text: 'text-purple-700' },
                    { category: 'Transporte y Movilidad', color: 'bg-amber-600', text: 'text-amber-700' },
                    { category: 'Ropa y Vestimenta', color: 'bg-rose-600', text: 'text-rose-700' },
                    { category: 'Mantenimiento y Hogar', color: 'bg-gray-600', text: 'text-gray-700' },
                    { category: 'Recreación y Estimulación', color: 'bg-teal-600', text: 'text-teal-700' }
                  ] as const).map((catObj) => {
                    const categoryCost = budgetItems
                      .filter(i => i.category === catObj.category)
                      .reduce((sum, i) => sum + getMonthlyCost(i), 0);
                    const percentage = totalMonthlyCost > 0 ? (categoryCost / totalMonthlyCost) * 100 : 0;
                    
                    return (
                      <div key={catObj.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-gray-700">{catObj.category}</span>
                          <span className={`${catObj.text}`}>
                            ${categoryCost.toFixed(2)}/mes ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#EFEFEA] h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`${catObj.color} h-full rounded-full`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#F2F2EC] flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Los costes se calculan en dólares ($) para mantener estabilidad analítica.</span>
                  </div>
                  <button
                    onClick={() => setActiveTab('budget')}
                    className="text-emerald-800 font-semibold hover:underline flex items-center gap-0.5"
                  >
                    Ver detalles del presupuesto
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Column: Nutrition Quick Info and Advice */}
              <div className="space-y-6">
                
                <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#EAE6DF] space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-700" />
                    <h4 className="text-sm font-bold uppercase tracking-wider text-amber-900">Requerimiento a los 3 Años</h4>
                  </div>
                  <h3 className="text-base font-semibold text-[#1A1A18]">Alimentación & Crecimiento</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    A los 3 años de edad, los niños se encuentran en una transición psicomotora clave. El menú propuesto cubre las <strong>1,200 - 1,400 calorías diarias</strong> recomendadas, distribuidas en 5 tiempos de comida.
                  </p>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-[#E8E2D9] text-center">
                      <span className="text-[10px] text-gray-400 block font-medium">MICROBIOMA</span>
                      <strong className="text-sm text-amber-950 font-bold">Auyama & Frutas</strong>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-[#E8E2D9] text-center">
                      <span className="text-[10px] text-gray-400 block font-medium">PROTEÍNAS</span>
                      <strong className="text-sm text-emerald-950 font-bold">Magra & Pollo</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-[#EBEBE8] space-y-4">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#8F8F87]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Higiene de Nevera y Alimentos</h4>
                  </div>
                  <h3 className="text-md font-semibold text-[#1A1A18]">Mantenimiento Preventivo</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    ¿Por qué incluir la nevera? Los alimentos perecederos del infante (pollo picado, purés de auyama, compotas) son propensos a bacterias como <em>Listeria</em> o <em>Salmonella</em>. Una mantención e higienización bianual es obligatoria para garantizar la cadena de frío.
                  </p>
                  <div className="p-3 bg-[#FAF9F5] border border-[#EDEAE3] rounded-xl flex items-start gap-2.5">
                    <div className="p-1 bg-[#F1EADA] text-amber-800 rounded">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-gray-600">
                      <strong>Tip Nutricional:</strong> Evita congelar el cambur pelado directamente. La auyama cocida dura un máximo de 3 días refrigerada a menos de 4°C.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Quick Summary Grid of Specific Ingredients */}
            <div className="bg-white p-6 rounded-3xl border border-[#EBEBE8] space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-md font-semibold text-[#1A1A18]">Consolidado de Ingredientes Prototipo</h3>
                  <p className="text-xs text-gray-500">Totalización de ingredientes claves consumidos por semana y mes, sumados a partir de los tiempos de comida individuales</p>
                </div>
                <button
                  onClick={() => setActiveTab('totals')}
                  className="text-xs bg-[#EFEFEA] hover:bg-[#E5E5DF] text-[#1A1A18] font-medium px-3 py-1.5 rounded-lg border border-[#DCDCD8]"
                >
                  Ver Consolidador Completo
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {consolidatedIngredients.slice(0, 5).map((ing) => (
                  <div key={ing.id} className="bg-[#FAFBF9] p-4 rounded-xl border border-[#EAECE6] text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">{ing.name}</span>
                    <strong className="text-lg text-emerald-800 block">
                      {ing.weeklyQty.toFixed(1)} {ing.unit} <span className="text-xs text-gray-400">/sem</span>
                    </strong>
                    <span className="text-[11px] text-gray-500 block">
                      ~ {ing.monthlyQty.toFixed(1)} {ing.unit} <span className="text-[10px] text-gray-400">/mes</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}

        {/* Screen 2: Detailed Budget Grid */}
        {activeTab === 'budget' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="screen-budget"
          >
            
            {/* Category Filter bar and Action line */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                <span className="text-xs font-semibold text-gray-400 mr-2 uppercase tracking-wide">Filtrar:</span>
                {(['Todos', 'Alimentación', 'Salud y Seguro Médico', 'Educación y Colegio', 'Transporte y Movilidad', 'Ropa y Vestimenta', 'Mantenimiento y Hogar', 'Recreación y Estimulación'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      filterCategory === cat
                        ? 'bg-[#1A1A17] text-white'
                        : 'bg-white hover:bg-[#F2F2EC] text-gray-600 border border-[#DCDCD8]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <button
                id="btn-add-expense"
                onClick={() => setIsAddingItem(!isAddingItem)}
                className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200"
              >
                {isAddingItem ? 'Cerrar Formulario' : 'Añadir Nuevo Gasto'}
                <Plus className="w-4 h-4" />
              </button>

            </div>

            {/* Animation Expansion for Adding New Expense */}
            <AnimatePresence>
              {isAddingItem && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <form
                    onSubmit={handleAddNewItem}
                    className="bg-[#FAFBF9] border border-[#DFE2D9] p-6 rounded-3xl space-y-4"
                  >
                    <div className="flex items-center gap-2 pb-2 border-b border-[#EAECE6]">
                      <Plus className="w-4 h-4 text-emerald-800" />
                      <h4 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider">Añadir Nuevo Rubro al Presupuesto</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Nombre del Rubro/Gasto:</label>
                        <input
                          type="text"
                          required
                          value={newItemForm.name}
                          onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                          placeholder="Ej. Colegiatura, Vacunas de Refuerzo..."
                          className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Categoría:</label>
                        <select
                          value={newItemForm.category}
                          onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value as BudgetCategory })}
                          className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-3 py-2 focus:outline-none"
                        >
                          <option>Alimentación</option>
                          <option>Salud y Seguro Médico</option>
                          <option>Educación y Colegio</option>
                          <option>Transporte y Movilidad</option>
                          <option>Ropa y Vestimenta</option>
                          <option>Mantenimiento y Hogar</option>
                          <option>Recreación y Estimulación</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Frecuencia:</label>
                          <select
                            value={newItemForm.frequency}
                            onChange={(e) => setNewItemForm({ ...newItemForm, frequency: e.target.value as any })}
                            className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-2 py-2 focus:outline-none"
                          >
                            <option>Mensual</option>
                            <option>Bimensual</option>
                            <option>Trimestral</option>
                            <option>Semestral</option>
                            <option>Anual</option>
                            <option>Única vez</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500">Costo de Referencia ($):</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newItemForm.cost}
                            onChange={(e) => setNewItemForm({ ...newItemForm, cost: parseFloat(e.target.value) || 0 })}
                            className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-2 py-2 focus:outline-none"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Ocurrencias / Cantidad al año:</label>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={newItemForm.quantity}
                          onChange={(e) => setNewItemForm({ ...newItemForm, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-3 py-2 focus:outline-none"
                        />
                        <span className="text-[10px] text-gray-400 block font-medium">Ej: si es mensual son 12 veces, si es anual es 1 vez.</span>
                      </div>

                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Justificación Técnica / Comentarios:</label>
                        <input
                          type="text"
                          value={newItemForm.comment}
                          onChange={(e) => setNewItemForm({ ...newItemForm, comment: e.target.value })}
                          placeholder="Justificar este gasto en relación con las necesidades específicas del niño a los 3 años..."
                          className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-3 py-2 focus:outline-none"
                        />
                      </div>

                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingItem(false)}
                        className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100 border border-gray-350 rounded-xl text-xs font-semibold"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                      >
                        Guardar Rubro
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Table Layout */}
            <div className="bg-white rounded-3xl border border-[#EBEBE8] overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#FAFBF9] border-b border-[#EBEBE8] text-xs font-bold text-[#555550]">
                      <th className="py-4 px-5">Categoría</th>
                      <th className="py-4 px-4">Gasto / Rubro</th>
                      <th className="py-4 px-3">Frecuencia</th>
                      <th className="py-4 px-3 text-right">Costo Ref. ($)</th>
                      <th className="py-4 px-3 text-center">Cant/Año</th>
                      <th className="py-4 px-3 text-right">Mensual Prorrateado</th>
                      <th className="py-4 px-3 text-right">Anual Consolidado</th>
                      <th className="py-4 px-5 w-[30%]">Comentarios de Utilidad (3 Años)</th>
                      <th className="py-4 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F2EC] text-xs md:text-sm">
                    {filteredBudgetItems.map((item) => {
                      const isEditing = editingItemId === item.id;
                      const calculatedMonthly = getMonthlyCost(item);
                      const calculatedAnnual = getAnnualCost(item);

                      return (
                        <tr key={item.id} className="hover:bg-[#FCFCFA]/70 transition-colors">
                          <td className="py-3 px-5">
                            <span className="inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#F2F2EC] text-gray-700 border border-[#E1E1DC]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1A1A18]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.name || ''}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                className="w-full text-xs bg-white border border-[#DCDCD8] rounded px-1.5 py-1"
                              />
                            ) : (
                              item.name
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {isEditing ? (
                              <select
                                value={editForm.frequency || 'Mensual'}
                                onChange={(e) => setEditForm({ ...editForm, frequency: e.target.value as any })}
                                className="text-xs bg-white border border-[#DCDCD8] rounded px-1 py-1"
                              >
                                <option>Mensual</option>
                                <option>Bimensual</option>
                                <option>Trimestral</option>
                                <option>Semestral</option>
                                <option>Anual</option>
                                <option>Única vez</option>
                              </select>
                            ) : (
                              item.frequency
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.cost || 0}
                                onChange={(e) => setEditForm({ ...editForm, cost: parseFloat(e.target.value) || 0 })}
                                className="w-16 text-right text-xs bg-white border border-[#DCDCD8] rounded px-1.5 py-1"
                              />
                            ) : (
                              `$${item.cost.toFixed(2)}`
                            )}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editForm.quantity || 1}
                                onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                                className="w-12 text-center text-xs bg-white border border-[#DCDCD8] rounded px-1.5 py-1"
                              />
                            ) : (
                              item.quantity
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-emerald-800">
                            ${calculatedMonthly.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-medium text-gray-500">
                            ${calculatedAnnual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-5 text-gray-600 leading-relaxed text-xs">
                            {isEditing ? (
                              <textarea
                                value={editForm.comment || ''}
                                onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                                className="w-full text-xs bg-white border border-[#DCDCD8] rounded p-1"
                                rows={2}
                              />
                            ) : (
                              item.comment
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={handleSaveEdit}
                                    className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold cursor-pointer"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={() => setEditingItemId(null)}
                                    className="px-2 py-1 bg-[#FAFBF9] text-gray-500 hover:bg-[#F2F2EC] border border-[#DCDCD8] rounded text-[11px] cursor-pointer"
                                  >
                                    Cancelar
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(item)}
                                    className="p-1.5 hover:bg-[#F2F2EC] rounded-lg text-gray-500 hover:text-[#1A1A18] transition-colors"
                                    title="Editar fila"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(item.id, item.name)}
                                    className="p-1.5 hover:bg-rose-50 rounded-lg text-gray-400 hover:text-rose-600 transition-colors"
                                    title="Eliminar fila"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredBudgetItems.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-gray-500">
                          Ningún rubro coincide con el filtro seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Bottom Totals Summary bar */}
              <div className="bg-[#FAFBF9] py-4.5 px-6 border-t border-[#EBEBE8] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                  <span>Total de Rubros Visualizados: <strong>{filteredBudgetItems.length}</strong></span>
                </div>
                <div className="flex flex-col md:flex-row gap-4 text-xs md:text-sm font-semibold">
                  <span>Suma Mensual: <strong className="text-emerald-800 text-base font-bold">${totalMonthlyCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                  <span className="hidden md:inline text-gray-300">|</span>
                  <span>Suma Anual: <strong className="text-[#1A1A18] text-base font-bold">${totalAnnualCost.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* Screen 3: Meal Plan */}
        {activeTab === 'meals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="screen-meals"
          >
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Left Column: Day selector (vertical timeline style) */}
              <div className="bg-white p-5 rounded-3xl border border-[#EBEBE8] space-y-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-[#F2F2EC] mb-2">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">Planificador por Día</h4>
                </div>
                
                {(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] as DayOfWeek[]).map((day) => {
                  const isSelected = selectedDay === day;
                  
                  // Compute ingredients for this day to show small badge summary
                  const dayMeals = mealPlan[day];
                  let camburQty = 0;
                  let auyamaQty = 0;
                  let polloQty = 0;
                  let carneQty = 0;

                  (Object.values(dayMeals) as Meal[]).forEach(meal => {
                    meal.ingredients.forEach(i => {
                      if (i.foodItemId === 'cambur') camburQty += i.quantityInMeal;
                      if (i.foodItemId === 'auyama') auyamaQty += i.quantityInMeal;
                      if (i.foodItemId === 'pollo') polloQty += i.quantityInMeal;
                      if (i.foodItemId === 'carne') carneQty += i.quantityInMeal;
                    });
                  });

                  return (
                    <button
                      key={day}
                      onClick={() => {
                        setSelectedDay(day);
                        setIsEditingMealIngredients(false);
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl flex flex-col gap-1.5 transition-all text-xs font-semibold cursor-pointer border ${
                        isSelected
                          ? 'bg-[#1A1A17] text-white border-transparent shadow'
                          : 'bg-[#FAFBF9] hover:bg-[#F2F2EC] text-[#2C2C2A] border-[#EBEBE8]'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-sm font-medium">{day}</span>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>}
                      </div>
                      
                      {/* Ingredient summary for this day */}
                      <div className="flex flex-wrap gap-1 text-[9px]">
                        {camburQty > 0 && (
                          <span className={`px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'}`}>
                            🥛 {camburQty} Cambur
                          </span>
                        )}
                        {auyamaQty > 0 && (
                          <span className={`px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-orange-500/20 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                            🎃 {auyamaQty}g Auyama
                          </span>
                        )}
                        {(polloQty > 0 || carneQty > 0) && (
                          <span className={`px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-800'}`}>
                            🍖 {polloQty + carneQty}g Prot
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Center & Right Column: Meal Details Dashboard */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Meal Categories selector (Horizontal Tabs) */}
                <div className="bg-white p-3 rounded-2xl border border-[#EBEBE8] flex items-center justify-between gap-1 overflow-x-auto">
                  {(['Desayuno', 'Merienda Mañana', 'Almuerzo', 'Merienda Tarde', 'Cena'] as MealType[]).map((mealType) => {
                    const isSelected = selectedMealType === mealType;
                    return (
                      <button
                        key={mealType}
                        onClick={() => {
                          setSelectedMealType(mealType);
                          setIsEditingMealIngredients(false);
                        }}
                        className={`flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer whitespace-nowrap transition-all ${
                          isSelected
                            ? 'bg-emerald-700 text-white shadow-sm'
                            : 'hover:bg-[#F2F2EC] text-gray-500'
                        }`}
                      >
                        {mealType}
                      </button>
                    );
                  })}
                </div>

                {/* Grid showing Day contents and edit options */}
                <div className="bg-white p-6 rounded-3xl border border-[#EBEBE8] space-y-6">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#F2F2EC]">
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                        Menú Actualizado en Vivo
                      </span>
                      <h3 className="text-lg font-bold text-[#1A1A18] mt-1">
                        {selectedDay} — {selectedMealType}
                      </h3>
                      <p className="text-xs text-gray-500">Estudio y dosificación de ingredientes específicos para infantes de 3 años</p>
                    </div>

                    {!isEditingMealIngredients && (
                      <button
                        onClick={openEditMealModal}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F2F2EC] text-gray-600 hover:text-black border border-[#DCDCD8] rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Ajustar Menú e Ingredientes
                      </button>
                    )}
                  </div>

                  {/* Normal Non-Editing Mode */}
                  {!isEditingMealIngredients ? (
                    <div className="space-y-6">
                      
                      {/* Menu Description and Vibe */}
                      <div className="bg-[#FAFBF9] p-5 rounded-2xl border border-[#EAECE6] space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Platillo Servido
                        </span>
                        <p className="text-sm md:text-base font-semibold text-[#1A1A18] leading-relaxed">
                          {mealPlan[selectedDay][selectedMealType].description || 'Sin menú específico planificado para este momento.'}
                        </p>
                      </div>

                      {/* Ingredient list and quantities */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Ingredientes Claves Analizados</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          {mealPlan[selectedDay][selectedMealType].ingredients.map((ing) => {
                            const food = foodItems.find(f => f.id === ing.foodItemId);
                            if (!food) return null;

                            return (
                              <div key={ing.foodItemId} className="bg-white p-3.5 rounded-xl border border-[#EBEBE8] flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600"></div>
                                  <div>
                                    <span className="text-xs font-semibold text-[#1A1A18] block">{food.name}</span>
                                    <span className="text-[10px] text-gray-400 block">{food.category}</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <strong className="text-sm text-emerald-800 font-mono">
                                    {ing.quantityInMeal} {food.unit}
                                  </strong>
                                </div>
                              </div>
                            );
                          })}

                          {mealPlan[selectedDay][selectedMealType].ingredients.length === 0 && (
                            <div className="col-span-2 text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                              <p className="text-xs text-gray-500">Idealmente esta comida es ligera y no contiene los ingredientes de monitoreo estricto (pollo, carne, cambur, auyama, manzana).</p>
                            </div>
                          )}

                        </div>
                      </div>

                      {/* Educational Hint for Mother/Father */}
                      <div className="p-4 bg-[#FAF8F5] border border-[#EAE6DF] rounded-2xl flex gap-3 text-xs text-gray-600 leading-relaxed">
                        <Info className="w-5 h-5 text-amber-700 shrink-0" />
                        <div>
                          <strong>Porciones Recomendadas por la Asociación de Pediatría:</strong> A los 3 años, una porción de proteína (carne o pollo) equivale a unos 50-80 gramos. No obligues al infante a terminar su plato. Un cambur mediano representa todo el requerimiento de fruta del día.
                        </div>
                      </div>

                    </div>
                  ) : (
                    
                    // Editing Mode
                    <div className="space-y-6">
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Descripción del Plato:</label>
                        <input
                          type="text"
                          value={mealEditDescription}
                          onChange={(e) => setMealEditDescription(e.target.value)}
                          className="w-full text-sm bg-white border border-[#DCDCD8] rounded-xl px-3 py-2.5 focus:ring-1 focus:ring-emerald-700 focus:outline-none font-semibold text-[#1A1A18]"
                          placeholder="Ej. Sopa casera de pollo con arroz..."
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block">Dosificar Gramajes e Ingredientes:</label>
                        <p className="text-xs text-gray-500">Coloque la cantidad para cada ingrediente que participa en este plato (ponga 0 si no lleva dicho ingrediente):</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                          {mealIngredientsList.map((item) => {
                            const food = foodItems.find(f => f.id === item.foodItemId);
                            if (!food) return null;

                            return (
                              <div key={item.foodItemId} className="bg-[#FAFBF9] p-3.5 rounded-xl border border-[#EBEBE8] flex items-center justify-between gap-4">
                                <div>
                                  <span className="text-xs font-semibold text-[#1A1A18] block">{food.name}</span>
                                  <span className="text-[10px] text-gray-400 block">{food.category}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.1"
                                    value={item.quantity || ''}
                                    placeholder="0"
                                    onChange={(e) => updateMealIngredientDirectly(item.foodItemId, parseFloat(e.target.value) || 0)}
                                    className="w-18 text-center text-xs font-mono font-bold bg-white border border-[#DCDCD8] rounded-lg p-1"
                                  />
                                  <span className="text-xs text-gray-500">{food.unit}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-[#F2F2EC]">
                        <button
                          type="button"
                          onClick={() => setIsEditingMealIngredients(false)}
                          className="px-4 py-2 bg-white text-gray-600 hover:bg-gray-100 border border-gray-350 rounded-xl text-xs font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveMealIngredients}
                          className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold"
                        >
                          Guardar Dosificación
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>

            </div>

          </motion.div>
        )}

        {/* Screen 4: Ingredient Aggregator Totals */}
        {activeTab === 'totals' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
            id="screen-totals"
          >
            
            <div className="bg-white p-6 rounded-3xl border border-[#EBEBE8] space-y-4">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A18]">Consolidado Automático de Ingredientes Requeridos</h3>
                <p className="text-xs text-gray-500">
                  Totaliza las cantidades de los ingredientes que planificaste en el menú semanal. Por ejemplo, si pones un cambur el lunes, media manzana el martes y otro cambur el jueves, el sistema los suma y muestra los totales semanales y mensuales sugeridos para tu lista de compras.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visual Ingredient List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Totales Consolidados Semanal vs Mensual</h4>
                  
                  <div className="space-y-2.5">
                    {consolidatedIngredients.map((item) => {
                      const isTarget = ['cambur', 'pollo', 'carne', 'auyama', 'manzana'].includes(item.id);
                      
                      return (
                        <div
                          key={item.id}
                          className={`p-4 rounded-2xl border transition-all ${
                            isTarget
                              ? 'bg-[#FAFBF9] border-emerald-200/80 shadow-3xs'
                              : 'bg-white border-[#EBEBE8]'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-bold text-[#1A1A18]">{item.name}</span>
                                {isTarget && (
                                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded uppercase font-extrabold tracking-wider">
                                    Requerimiento Crítico
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-gray-400 block font-medium">{item.category}</span>
                            </div>

                            <div className="text-right space-y-0.5">
                              <span className="block text-xs font-extrabold text-[#1A1A18]">
                                Semanal: <span className="text-emerald-700 font-mono text-sm">{item.weeklyQty.toFixed(1)} {item.unit}</span>
                              </span>
                              <span className="block text-[10px] text-gray-500 font-medium">
                                Mensual Est: <span className="font-mono">{item.monthlyQty.toFixed(1)} {item.unit}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shopping Analysis Block & Guide */}
                <div className="space-y-6">
                  
                  <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#EAE6DF] space-y-4">
                    <div className="flex items-center gap-2">
                      <Apple className="w-5 h-5 text-amber-700" />
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">Análisis Nutricional de la Compra</h4>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      El volumen de carnes consolidadas (<strong>{consolidatedIngredients.find(i=>i.id==='pollo')?.weeklyQty.toFixed(0)}g pollo</strong> y <strong>{consolidatedIngredients.find(i=>i.id==='carne')?.weeklyQty.toFixed(0)}g carne</strong> semanalmente) representa un promedio ideal de <strong>20 a 25g de proteína pura digerida al día</strong>, óptimo para el recambio celular de tu niño.
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#EAE2D9]">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-gray-700">Auyama (Calabaza) Semanal:</span>
                        <span className="text-[#333]">
                          {consolidatedIngredients.find(i=>i.id==='auyama')?.weeklyQty.toFixed(0)}g
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Asegura vitamina A y betacarotenos claves para la protección ocular y dérmica del infante.</p>
                      
                      <div className="flex justify-between text-xs font-semibold pt-2">
                        <span className="text-gray-700">Cambur (Bananas) Semanal:</span>
                        <span className="text-[#333]">
                          {consolidatedIngredients.find(i=>i.id==='cambur')?.weeklyQty.toFixed(1)} Unidades
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400">Favorece un tránsito intestinal saludable y provee carbohidratos de asimilación rápida.</p>
                    </div>
                  </div>

                  {/* Excel Download CTA */}
                  <div className="bg-white p-6 rounded-3xl border border-[#EBEBE8] text-center space-y-4 bg-gradient-to-br from-emerald-50/20 to-white">
                    <div className="mx-auto p-3 bg-emerald-50 text-emerald-800 rounded-full w-fit">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1A1A18] uppercase tracking-wider">Exportar Todo a Excel Profesional</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                        Genera un documento oficial con múltiples hojas de cálculo conteniendo la agenda completa, rubros de mantenimiento del hogar y lista de compras consolidada.
                      </p>
                    </div>
                    <button
                      onClick={handleExport}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1A17] hover:bg-[#2C2C2A] text-white font-semibold rounded-2xl text-xs md:text-sm cursor-pointer transition-all duration-200 shadow"
                    >
                      Descargar Excel Listo para Guardar
                    </button>
                  </div>

                </div>

              </div>
            </div>

          </motion.div>
        )}

      </main>

      {/* Footer Design */}
      <footer className="border-t border-[#EBEBE8] py-8 mt-12 bg-white text-gray-500">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center space-y-3">
          <p className="text-xs leading-relaxed max-w-3xl mx-auto">
            Este modelo presupuestario y nutricional interactivo ha sido desarrollado de acuerdo con estándares comunes de pediatría y finanzas de crianza. Cubre gastos de mantenimiento de electrodomésticos para preservación de alimentos (neveras), seguro de salud pediátrico, colegio inicial y la totalización automatizada de gramos y unidades semanales.
          </p>
          <div className="text-[10px] text-gray-400 font-mono">
            Presupuesto de Crianza v1.0.0 • 2026 UTC
          </div>
        </div>
      </footer>
    </div>
  );
}
