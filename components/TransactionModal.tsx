'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Account, Category, Transaction } from '@/hooks/useFinanceData';
import { format } from 'date-fns';
import { X } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'income' | 'expense' | 'transfer';
  accounts: Account[];
  categories: Category[];
  onAdd: (tx: Omit<Transaction, 'id' | 'uid'>) => void;
  onUpdate?: (tx: Transaction) => void;
  onAddTransfer: (from: string, to: string, amount: number, date: string, desc: string) => void;
  onUpdateTransfer?: (expenseTx: Transaction, incomeTx: Transaction) => void;
  initialData?: Transaction;
  transactions?: Transaction[];
}

export function TransactionModal({ isOpen, onClose, type, accounts, categories, onAdd, onUpdate, onAddTransfer, onUpdateTransfer, initialData, transactions }: TransactionModalProps) {
  const linkedTx = useMemo(() => {
    if (type === 'transfer' && initialData && transactions) {
      return transactions.find(t => t.id === initialData.linkedTransactionId);
    }
    return null;
  }, [type, initialData, transactions]);

  const fromTx = initialData && type === 'transfer' ? (initialData.amount < 0 ? initialData : linkedTx) : initialData;
  const toTx = initialData && type === 'transfer' ? (initialData.amount > 0 ? initialData : linkedTx) : null;

  const [desc, setDesc] = useState(fromTx?.description || '');
  const [amount, setAmount] = useState(fromTx?.amount ? Math.abs(fromTx.amount).toString() : '');
  const [accountId, setAccountId] = useState(fromTx?.accountId || '');
  const [toAccountId, setToAccountId] = useState(toTx?.accountId || '');
  const [categoryId, setCategoryId] = useState(fromTx?.categoryId || '');
  const [date, setDate] = useState(fromTx?.issueDate || format(new Date(), 'yyyy-MM-dd'));
  const [completed, setCompleted] = useState(fromTx ? fromTx.completed : true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

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
      
      if (initialData && onUpdateTransfer && transactions) {
        const linkedTx = transactions.find(t => t.id === initialData.linkedTransactionId);
        if (linkedTx) {
          const expenseId = initialData.amount < 0 ? initialData.id : linkedTx.id;
          const incomeId = initialData.amount > 0 ? initialData.id : linkedTx.id;
          
          const expenseTx: Transaction = {
            id: expenseId,
            uid: initialData.uid,
            type: 'transfer',
            description: desc || 'Transferencia',
            amount: -parsedAmount,
            accountId: accountId,
            categoryId: 'transfer',
            issueDate: date,
            dueDate: date,
            completed: true,
            linkedTransactionId: incomeId
          };

          const incomeTx: Transaction = {
            id: incomeId,
            uid: initialData.uid,
            type: 'transfer',
            description: desc || 'Transferencia',
            amount: parsedAmount,
            accountId: toAccountId,
            categoryId: 'transfer',
            issueDate: date,
            dueDate: date,
            completed: true,
            linkedTransactionId: expenseId
          };

          onUpdateTransfer(expenseTx, incomeTx);
        }
      } else {
        onAddTransfer(accountId, toAccountId, parsedAmount, date, desc || 'Transferencia');
      }
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Editar' : 'Nueva'} {typeMap[type]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Descripción</label>
            <input 
              type="text" 
              value={desc} 
              onChange={e => setDesc(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
              placeholder={`ej. ${type === 'expense' ? 'Supermercado' : type === 'income' ? 'Sueldo' : 'Ahorros'}`}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Monto</label>
              <input 
                type="number" 
                step="0.01"
                value={amount} 
                onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg"
                placeholder="0,00"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Fecha</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                {type === 'transfer' ? 'Desde Cuenta' : 'Cuenta'}
              </label>
              <select 
                value={accountId} 
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none"
                required
              >
                <option value="">Seleccionar Cuenta</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {type === 'transfer' ? (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hacia Cuenta</label>
                <select 
                  value={toAccountId} 
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none"
                  required
                >
                  <option value="">Seleccionar Cuenta</option>
                  {accounts.filter(a => a.id !== accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Categoría</label>
                <select 
                  value={categoryId} 
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none"
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
                className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="modal-completed" className="text-sm font-bold text-blue-900/70">Completado (acreditado)</label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
