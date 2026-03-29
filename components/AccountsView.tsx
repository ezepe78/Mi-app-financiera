import React, { useState } from 'react';
import { Account, Transaction } from '@/hooks/useFinanceData';
import { Plus, Wallet, Building2, CreditCard, Trash2, Edit2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
          className="flex items-center justify-center gap-2 w-[150px] h-[45px] text-[14px] leading-[20px] bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span className="truncate">Agregar Cuenta</span>
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

      <div className="flex flex-col gap-2">
        {accounts.map(account => {
          const accountTxs = transactions.filter(t => t.accountId === account.id && t.completed);
          const income = accountTxs.filter(t => t.type === 'income' || (t.type === 'transfer' && t.amount > 0)).reduce((sum, t) => sum + t.amount, 0);
          const expense = accountTxs.filter(t => t.type === 'expense' || (t.type === 'transfer' && t.amount < 0)).reduce((sum, t) => sum + Math.abs(t.amount), 0);
          const balance = account.initialBalance + income - expense;
          
          const balanceStr = balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

          return (
            <div key={account.id} className="relative overflow-hidden group rounded-2xl border border-gray-100 shadow-sm">
              {/* Background Actions (Revealed on Swipe) */}
              <div className="absolute inset-0 flex justify-end items-stretch">
                <button 
                  onClick={() => handleEdit(account)}
                  className="w-14 bg-blue-500 text-white flex items-center justify-center transition-colors hover:bg-blue-600"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setAccountToDelete(account)}
                  className="w-14 bg-red-500 text-white flex items-center justify-center transition-colors hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Draggable Content */}
              <motion.div 
                drag="x"
                dragConstraints={{ left: -112, right: 0 }}
                dragElastic={0.1}
                className="relative bg-white p-3 flex items-center justify-between transition-colors group gap-3 z-10"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-blue-50/80 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100/50 shrink-0">
                    {React.cloneElement(getIcon(account.type) as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5' })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate leading-tight" title={account.name}>{account.name}</h3>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate mt-0.5">{accountTypeMap[account.type] || account.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span className="text-[10px] font-bold text-gray-400 font-mono">$</span>
                      <p className="font-bold text-gray-900 tracking-tighter font-mono text-base">
                        {balanceStr}
                      </p>
                    </div>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Saldo</p>
                  </div>
                  
                  {/* Desktop Actions (Visible on Hover) */}
                  <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(account)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setAccountToDelete(account)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Mobile Indicator (Swipe hint) */}
                  <div className="sm:hidden w-1 h-5 bg-gray-50 rounded-full" />
                </div>
              </motion.div>
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
