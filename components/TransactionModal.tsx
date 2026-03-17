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
  onAdd: (tx: Omit<Transaction, 'id' | 'uid'>) => void;
  onUpdate?: (tx: Transaction) => void;
  onAddTransfer: (from: string, to: string, amount: number, date: string, desc: string) => void;
  initialData?: Transaction;
}

export function TransactionModal({ isOpen, onClose, type, accounts, categories, onAdd, onUpdate, onAddTransfer, initialData }: TransactionModalProps) {
  const [desc, setDesc] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [date, setDate] = useState(initialData?.issueDate || format(new Date(), 'yyyy-MM-dd'));
  const [completed, setCompleted] = useState(initialData ? initialData.completed : true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === 'transfer') {
      if (!accountId || !toAccountId || !amount) return;
      onAddTransfer(accountId, toAccountId, parseFloat(amount), date, desc || 'Transferencia');
    } else {
      if (!accountId || !categoryId || !amount) return;
      
      if (initialData && onUpdate) {
        onUpdate({
          ...initialData,
          description: desc,
          amount: parseFloat(amount),
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
          amount: parseFloat(amount),
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
