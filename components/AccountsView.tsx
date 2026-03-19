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
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'wallet'>('bank');
  const [initialBalance, setInitialBalance] = useState('');

  const isAccountUsed = (accountId: string) => {
    return transactions.some(t => t.accountId === accountId);
  };

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
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cuentas</h1>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          Agregar Cuenta
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">{editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Nombre de la Cuenta</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                placeholder="ej. Cuenta Corriente Galicia"
                required
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Tipo de Cuenta</label>
              <select 
                value={type} 
                onChange={e => setType(e.target.value as any)}
                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-medium appearance-none"
                required
              >
                <option value="bank">Banco / Tarjeta</option>
                <option value="cash">Efectivo</option>
                <option value="wallet">Billetera Virtual (Mercado Pago, etc)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Saldo Inicial</label>
              <input 
                type="number" 
                step="0.01"
                value={initialBalance} 
                onChange={e => setInitialBalance(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg font-mono"
                placeholder="0,00"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button 
                type="button" 
                onClick={() => { setIsAdding(false); resetForm(); }}
                className="px-8 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
              >
                {editingAccount ? 'Actualizar' : 'Guardar'} Cuenta
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {accounts.map(account => {
          const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
          const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
          const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const balance = account.initialBalance + income - expense;
          
          const balanceStr = balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const isLargeAmount = balanceStr.length > 12;

          return (
            <div key={account.id} className="bg-white p-4 md:p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50/80 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm border border-blue-100/50 shrink-0">
                  {getIcon(account.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 tracking-tight font-sans truncate leading-tight" title={account.name}>{account.name}</h3>
                  <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest truncate mt-0.5">{accountTypeMap[account.type] || account.type}</p>
                </div>
              </div>

              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 px-1 sm:px-4 border-y sm:border-y-0 sm:border-x border-gray-50 py-3 sm:py-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block sm:hidden">Saldo</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs md:text-sm font-bold text-gray-400 font-mono">$</span>
                  <p className={`font-bold text-gray-900 tracking-tighter font-mono ${isLargeAmount ? 'text-lg md:text-xl' : 'text-xl md:text-2xl'}`}>
                    {balanceStr}
                  </p>
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 ml-1 font-sans">ARS</span>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 hidden sm:block">Saldo Disponible</p>
              </div>

              <div className="flex items-center justify-end gap-1 shrink-0">
                <button 
                  onClick={() => handleEdit(account)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-colors"
                >
                  <span className="sr-only">Editar</span>
                  <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button 
                  onClick={() => setAccountToDelete(account)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <span className="sr-only">Eliminar</span>
                  <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation/Warning Modal */}
      {accountToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            {isAccountUsed(accountToDelete.id) ? (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se puede eliminar</h3>
                <p className="text-gray-500 mb-6">Esta cuenta tiene transacciones asociadas. Debes eliminar o reasignar sus movimientos antes de borrar la cuenta.</p>
                <button 
                  onClick={() => setAccountToDelete(null)}
                  className="w-full py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Entendido
                </button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¿Eliminar cuenta?</h3>
                <p className="text-gray-500 mb-6">¿Estás seguro de que deseas eliminar la cuenta <strong>{accountToDelete.name}</strong>? Esta acción no se puede deshacer.</p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setAccountToDelete(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={() => {
                      onDelete(accountToDelete.id);
                      setAccountToDelete(null);
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
