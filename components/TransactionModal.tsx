'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Account, Category, Transaction } from '@/hooks/useFinanceData';
import { format } from 'date-fns';
import { X, Search, Calendar, CreditCard, Tag, DollarSign, ArrowRight, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'transfer';
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  onAdd: (tx: Omit<Transaction, 'id' | 'uid'>) => void;
  onUpdate?: (tx: Transaction) => void;
  onAddTransfer: (from: string, to: string, amount: number, date: string, desc: string) => void;
  initialData?: Transaction;
}

export function TransactionModal({ isOpen, onClose, type, accounts, categories, transactions, onAdd, onUpdate, onAddTransfer, initialData }: TransactionModalProps) {
  const [defaultDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [desc, setDesc] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState(initialData?.issueDate || defaultDate);
  const [completed, setCompleted] = useState(initialData ? initialData.completed : true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const suggestionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Extract unique descriptions and their most frequent category
  const suggestions = React.useMemo(() => {
    if (type === 'transfer') return [];
    
    const descMap = new Map<string, { categoryId: string, count: number }[]>();
    
    transactions
      .filter(t => t.type === type && t.description)
      .forEach(t => {
        const existing = descMap.get(t.description) || [];
        const catIndex = existing.findIndex(e => e.categoryId === t.categoryId);
        if (catIndex >= 0) {
          existing[catIndex].count++;
        } else {
          existing.push({ categoryId: t.categoryId, count: 1 });
        }
        descMap.set(t.description, existing);
      });

    return Array.from(descMap.entries()).map(([description, cats]) => {
      // Sort categories by frequency to pick the most common one
      const bestCat = cats.sort((a, b) => b.count - a.count)[0].categoryId;
      return { description, categoryId: bestCat };
    });
  }, [transactions, type]);

  const filteredSuggestions = React.useMemo(() => {
    if (!desc || !showSuggestions) return [];
    return suggestions
      .filter(s => s.description.toLowerCase().includes(desc.toLowerCase()) && s.description.toLowerCase() !== desc.toLowerCase())
      .slice(0, 5);
  }, [desc, suggestions, showSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
      e.preventDefault();
      const selected = filteredSuggestions[activeSuggestionIndex];
      setDesc(selected.description);
      setCategoryId(selected.categoryId);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const isEditing = !!initialData;

  // Smart default for transfer description
  useEffect(() => {
    if (type === 'transfer' && !desc && accountId && toAccountId) {
      const from = accounts.find(a => a.id === accountId)?.name;
      const to = accounts.find(a => a.id === toAccountId)?.name;
      if (from && to) {
        // We don't set it directly to allow user to type, but we could use it as placeholder
      }
    }
  }, [type, accountId, toAccountId, accounts, desc]);

  if (!isOpen) return null;

  const hasChanges = () => {
    const initialDesc = initialData?.description || '';
    const initialAmount = initialData?.amount.toString() || '';
    const initialAccountId = initialData?.accountId || '';
    const initialCategoryId = initialData?.categoryId || '';
    const initialDate = initialData?.issueDate || defaultDate;
    const initialCompleted = initialData ? initialData.completed : true;
    const initialToAccountId = '';

    return (
      desc !== initialDesc ||
      amount !== initialAmount ||
      accountId !== initialAccountId ||
      categoryId !== initialCategoryId ||
      date !== initialDate ||
      completed !== initialCompleted ||
      toAccountId !== initialToAccountId
    );
  };

  const handleCloseAttempt = () => {
    if (hasChanges()) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowConfirmClose(false);
    onClose();
  };

  const handleCancelDiscard = () => {
    setShowConfirmClose(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    
    // Common validations
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('El monto debe ser mayor a cero');
      return;
    }
    if (!accountId) {
      setError('Debes seleccionar una cuenta');
      return;
    }
    if (!date) {
      setError('Debes seleccionar una fecha');
      return;
    }

    if (type === 'transfer') {
      if (!toAccountId) {
        setError('Debes seleccionar una cuenta de destino');
        return;
      }
      if (accountId === toAccountId) {
        setError('La cuenta de origen y destino deben ser diferentes');
        return;
      }
      const defaultTransferDesc = `Transferencia de ${accounts.find(a => a.id === accountId)?.name} a ${accounts.find(a => a.id === toAccountId)?.name}`;
      onAddTransfer(accountId, toAccountId, parsedAmount, date, desc || defaultTransferDesc);
    } else {
      if (!categoryId) {
        setError('Debes seleccionar una categoría');
        return;
      }
      
      if (initialData && onUpdate) {
        onUpdate({
          ...initialData,
          description: desc,
          amount: parsedAmount,
          accountId,
          categoryId,
          issueDate: date,
          dueDate: date,
          completed
        });
      } else {
        onAdd({
          type,
          description: desc || (type === 'income' ? 'Ingreso' : 'Gasto'),
          amount: parsedAmount,
          accountId,
          categoryId,
          issueDate: date,
          dueDate: date,
          completed
        });
      }
    }
    onClose();
  };

  const typeMap: Record<string, string> = {
    'expense': 'Gasto',
    'income': 'Ingreso',
    'transfer': 'Transferencia'
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <motion.div 
        drag="y"
        dragConstraints={{ top: 0 }}
        dragElastic={0.2}
        onDragEnd={(_, info) => {
          if (info.offset.y > 150) {
            handleCloseAttempt();
          }
        }}
        className="bg-white w-full h-[92vh] md:h-auto md:max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Drag Handle for Mobile */}
        <div className="md:hidden w-full pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
        </div>

        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Nueva'} {typeMap[type]}</h2>
          <button type="button" onClick={handleCloseAttempt} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1 pb-20 md:pb-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}
          <div className="space-y-1.5 relative">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
              {desc && (
                <button 
                  type="button" 
                  onClick={() => setDesc('')}
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-700"
                >
                  Limpiar
                </button>
              )}
            </div>
            <div className="relative group">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
              <input 
                ref={inputRef}
                type="text" 
                value={desc} 
                onChange={e => {
                  setDesc(e.target.value);
                  setShowSuggestions(true);
                  setActiveSuggestionIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => {
                  // Delay hiding to allow click on suggestion
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-medium text-base transition-all"
                placeholder={type === 'transfer' && accountId && toAccountId 
                  ? `Transferencia de ${accounts.find(a => a.id === accountId)?.name} a ${accounts.find(a => a.id === toAccountId)?.name}`
                  : `ej. ${type === 'expense' ? 'Supermercado' : type === 'income' ? 'Sueldo' : 'Ahorros'}`}
                required
              />
            </div>
            <AnimatePresence>
              {filteredSuggestions.length > 0 && showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  ref={suggestionRef}
                  className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-2 bg-blue-50/50 border-b border-gray-50 flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-blue-500" />
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Sugerencias inteligentes</span>
                  </div>
                  {filteredSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDesc(s.description);
                        setCategoryId(s.categoryId);
                        setShowSuggestions(false);
                      }}
                      onMouseEnter={() => setActiveSuggestionIndex(idx)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors ${
                        activeSuggestionIndex === idx ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Tag className="w-4 h-4 text-gray-400" />
                        </div>
                        <span className="font-medium text-gray-900">{s.description}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-lg">
                        {categories.find(c => c.id === s.categoryId)?.name}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</label>
              <div className="relative group">
                <DollarSign className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={e => setAmount(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-mono font-bold text-2xl transition-all"
                  placeholder="0,00"
                  inputMode="decimal"
                  required
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {[100, 500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-xl text-xs font-bold text-gray-500 transition-all"
                  >
                    +${val}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</label>
              <div className="relative group">
                <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="date" 
                  value={date} 
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-mono font-medium text-base transition-all"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                {type === 'transfer' ? 'Desde Cuenta' : 'Cuenta'}
              </label>
              <div className="relative group">
                <CreditCard className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                <select 
                  value={accountId} 
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-medium appearance-none text-base transition-all"
                  required
                >
                  <option value="">Seleccionar Cuenta</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ArrowRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {type === 'transfer' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Hacia Cuenta</label>
                <div className="relative group">
                  <CreditCard className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <select 
                    value={toAccountId} 
                    onChange={e => setToAccountId(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-medium appearance-none text-base transition-all"
                    required
                  >
                    <option value="">Seleccionar Cuenta</option>
                    {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                <div className="relative group">
                  <Tag className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                  <select 
                    value={categoryId} 
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full pl-12 pr-10 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:ring-0 focus:border-blue-500 focus:bg-white outline-none font-medium appearance-none text-base transition-all"
                    required
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ArrowRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {type !== 'transfer' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  id="modal-completed"
                  checked={completed} 
                  onChange={e => setCompleted(e.target.checked)}
                  className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                {completed && <Check className="w-4 h-4 text-white absolute left-1 pointer-events-none" />}
              </div>
              <label htmlFor="modal-completed" className="text-sm font-bold text-blue-900/70 cursor-pointer select-none">Completado (acreditado)</label>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-8 md:pb-0">
            <button 
              type="button" 
              onClick={handleCloseAttempt}
              className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 order-1 sm:order-2"
            >
              Guardar
            </button>
          </div>
        </form>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">¿Seguro que quieres descartar los cambios?</h3>
            <p className="text-gray-500 mb-6">Los datos ingresados no se guardarán.</p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={handleCancelDiscard}
                className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={handleConfirmDiscard}
                className="flex-1 py-3 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
