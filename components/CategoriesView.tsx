import React, { useState, useRef, useEffect } from 'react';
import { Account, Category, Transaction } from '@/hooks/useFinanceData';
import { Plus, Trash2, Edit2, Tags, ArrowUpRight, ArrowDownRight, MoreVertical, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoriesViewProps {
  categories: Category[];
  transactions: Transaction[];
  onAdd: (category: Omit<Category, 'id' | 'uid'>) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function CategoriesView({ categories, transactions, onAdd, onUpdate, onDelete }: CategoriesViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isCategoryUsed = (categoryId: string) => {
    return transactions.some(t => t.categoryId === categoryId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    if (editingCategory) {
      onUpdate({
        ...editingCategory,
        name,
        type
      });
    } else {
      onAdd({
        name,
        type
      });
    }
    
    setIsAdding(false);
    setEditingCategory(null);
    resetForm();
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setType(category.type);
    setIsAdding(true);
    setActiveMenuId(null);
  };

  const resetForm = () => {
    setName('');
    setType('expense');
    setEditingCategory(null);
  };

  const renderCategoryItem = (category: Category) => (
    <div key={category.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group relative">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          category.type === 'expense' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          <Tags className="w-5 h-5" />
        </div>
        <p className="font-bold text-gray-900">{category.name}</p>
      </div>
      
      <div className="relative">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenuId(activeMenuId === category.id ? null : category.id);
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Categoría
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Categoría</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="ej. Supermercado"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                required
              >
                <option value="expense">Gasto</option>
                <option value="income">Ingreso</option>
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-6 py-2 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Guardar Categoría
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowDownRight className="w-6 h-6 text-red-500" />
            Gastos
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categories.filter(c => c.type === 'expense').map(renderCategoryItem)}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
            Ingresos
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {categories.filter(c => c.type === 'income').map(renderCategoryItem)}
            </div>
          </div>
        </div>
      </div>

      {/* Global Context Menu (Bottom Sheet / Popover) */}
      <AnimatePresence>
        {activeMenuId && (
          (() => {
            const category = categories.find(c => c.id === activeMenuId);
            if (!category) return null;

            return (
              <>
                {/* Mobile Bottom Sheet Backdrop */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] md:hidden"
                  onClick={() => setActiveMenuId(null)}
                />
                
                {/* Mobile Bottom Sheet */}
                <motion.div 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 z-[101] shadow-2xl md:hidden"
                >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
                  <div className="space-y-2">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        handleEdit(category); 
                      }}
                      className="w-full flex items-center gap-4 p-4 text-gray-700 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                        <Edit2 className="w-5 h-5" />
                      </div>
                      Editar Categoría
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setCategoryToDelete(category); 
                        setActiveMenuId(null); 
                      }}
                      className="w-full flex items-center gap-4 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Eliminar Categoría
                    </button>
                    <button 
                      onClick={() => setActiveMenuId(null)}
                      className="w-full p-4 text-gray-400 font-bold mt-4"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>

                {/* Desktop Popover */}
                <motion.div 
                  ref={menuRef}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="hidden md:block absolute right-8 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50"
                >
                  <button 
                    onClick={() => handleEdit(category)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                    Editar Categoría
                  </button>
                  <button 
                    onClick={() => { setCategoryToDelete(category); setActiveMenuId(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    Eliminar Categoría
                  </button>
                </motion.div>
              </>
            );
          })()
        )}
      </AnimatePresence>

      {/* Confirmation/Warning Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            {isCategoryUsed(categoryToDelete.id) ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se puede eliminar</h3>
                <p className="text-gray-500 mb-6">Esta categoría tiene transacciones asociadas. Debes reasignar o eliminar los movimientos antes de borrar la categoría.</p>
                <button 
                  onClick={() => setCategoryToDelete(null)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar categoría?</h3>
                <p className="text-gray-500 mb-6">¿Estás seguro de que deseas eliminar la categoría <strong>{categoryToDelete.name}</strong>? Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setCategoryToDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      onDelete(categoryToDelete.id);
                      setCategoryToDelete(null);
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                  >
                    Eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
