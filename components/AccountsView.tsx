import React, { useState } from 'react';
import { Account, Transaction } from '@/hooks/useFinanceData';
import { Plus, Wallet, Building2, CreditCard, Trash2, Edit2 } from 'lucide-react';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  onAdd: (account: Omit<Account, 'id' | 'uid' | 'createdAt'>) => void;
  onUpdate: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountsView({ accounts, transactions, onAdd, onUpdate, onDelete }: AccountsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'wallet'>('bank');
  const [initialBalance, setInitialBalance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !initialBalance) return;
    
    if (editingAccount) {
      onUpdate({
        ...editingAccount,
        name,
        type,
        initialBalance: parseFloat(initialBalance)
      });
    } else {
      onAdd({
        name,
        type,
        initialBalance: parseFloat(initialBalance)
      });
    }
    
    setIsAdding(false);
    setEditingAccount(null);
    resetForm();
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setName(account.name);
    setType(account.type);
    setInitialBalance(account.initialBalance.toString());
    setIsAdding(true);
  };

  const resetForm = () => {
    setName('');
    setType('bank');
    setInitialBalance('');
    setEditingAccount(null);
  };

  const accountTypeMap: Record<string, string> = {
    'bank': 'Banco / Tarjeta',
    'cash': 'Efectivo',
    'wallet': 'Billetera Virtual'
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'cash': return <Wallet className="w-6 h-6" />;
      case 'bank': return <Building2 className="w-6 h-6" />;
      case 'wallet': return <CreditCard className="w-6 h-6" />;
      default: return <Wallet className="w-6 h-6" />;
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Agregar Cuenta
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Cuenta</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="ej. Cuenta Corriente Galicia"
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
                <option value="bank">Banco / Tarjeta</option>
                <option value="cash">Efectivo</option>
                <option value="wallet">Billetera Virtual (Mercado Pago, etc)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Inicial</label>
              <input 
                type="number" 
                step="0.01"
                value={initialBalance} 
                onChange={e => setInitialBalance(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="0,00"
                required
              />
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
                Guardar Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(account => {
          const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
          const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
          const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const balance = account.initialBalance + income - expense;

          return (
            <div key={account.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group relative">
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button 
                  onClick={() => handleEdit(account)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <span className="sr-only">Editar</span>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => onDelete(account.id)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <span className="sr-only">Eliminar</span>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                {getIcon(account.type)}
              </div>
              <h3 className="text-lg font-bold text-gray-900">{account.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{accountTypeMap[account.type] || account.type}</p>
              
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Saldo Actual</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
