'use client';

import React, { useState, useEffect } from 'react';
import { Account, Category, Transaction } from '@/hooks/useFinanceData';
import { format } from 'date-fns';
import { X } from 'lucide-react';

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
      onAddTransfer(accountId, toAccountId, parsedAmount, date, desc || 'Transferencia');
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

  const isEditing = !!initialData;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full h-full md:h-auto md:max-w-lg rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom md:zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Nueva'} {typeMap[type]}</h2>
          <button type="button" onClick={handleCloseAttempt} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-64px)] md:max-h-none">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}
          <div className="space-y-1.5 relative">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Descripción</label>
            <input 
              type="text" 
              value={desc} 
              onChange={e => {
                setDesc(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => {
                // Delay hiding to allow click on suggestion
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-base"
              placeholder={`ej. ${type === 'expense' ? 'Supermercado' : type === 'income' ? 'Sueldo' : 'Ahorros'}`}
              required
            />
            {filteredSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredSuggestions.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDesc(s.description);
                      setCategoryId(s.categoryId);
                      setShowSuggestions(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{s.description}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded-lg">
                      {categories.find(c => c.id === s.categoryId)?.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Monto</label>
              <input 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-2xl"
                placeholder="0,00"
                inputMode="decimal"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Fecha</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-medium text-base"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">
                {type === 'transfer' ? 'Desde Cuenta' : 'Cuenta'}
              </label>
              <select 
                value={accountId} 
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-base"
                required
              >
                <option value="">Seleccionar Cuenta</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {type === 'transfer' ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Hacia Cuenta</label>
                <select 
                  value={toAccountId} 
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-base"
                  required
                >
                  <option value="">Seleccionar Cuenta</option>
                  {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Categoría</label>
                <select 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none text-base"
                  required
                >
                  <option value="">Seleccionar Categoría</option>
                  {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {type !== 'transfer' && (
            <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl">
              <input 
                type="checkbox" 
                id="modal-completed"
                checked={completed} 
                onChange={e => setCompleted(e.target.checked)}
                className="w-6 h-6 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="modal-completed" className="text-sm font-bold text-blue-900/70">Completado (acreditado)</label>
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
      </div>

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
