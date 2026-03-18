import React, { useState, useRef, useEffect } from 'react';
import { Account, Transaction, Category } from '@/hooks/useFinanceData';
import { Plus, Wallet, Building2, CreditCard, Trash2, Edit2, MoreVertical, History, X } from 'lucide-react';
import { AccountDetailView } from './AccountDetailView';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  onAdd: (account: Omit<Account, 'id' | 'uid' | 'createdAt'>) => void;
  onUpdate: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountsView({ accounts, transactions, categories, onAdd, onUpdate, onDelete }: AccountsViewProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'cash' | 'bank' | 'wallet'>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  
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
    setActiveMenuId(null);
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

  if (selectedAccount) {
    return (
      <AccountDetailView 
        account={selectedAccount}
        transactions={transactions}
        categories={categories}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

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
              <div className="absolute top-4 right-4">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenuId(activeMenuId === account.id ? null : account.id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <MoreVertical className="w-5 h-5" />
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

      {/* Global Context Menu (Bottom Sheet / Popover) */}
      <AnimatePresence>
        {activeMenuId && (
          (() => {
            const account = accounts.find(a => a.id === activeMenuId);
            if (!account) return null;

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
                        setSelectedAccount(account); 
                        setActiveMenuId(null); 
                      }}
                      className="w-full flex items-center gap-4 p-4 text-gray-700 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      Ver Transacciones
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        handleEdit(account); 
                      }}
                      className="w-full flex items-center gap-4 p-4 text-gray-700 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                        <Edit2 className="w-5 h-5" />
                      </div>
                      Editar Cuenta
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation();
                        setAccountToDelete(account); 
                        setActiveMenuId(null); 
                      }}
                      className="w-full flex items-center gap-4 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      <div className="w-10 h-10 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      Eliminar Cuenta
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
                  style={{
                    // Since it's outside the loop, we'd need trigger coordinates for perfect positioning.
                    // For now, let's keep it in a reasonable place or revert to a simpler popover.
                    // Actually, keeping it absolute inside the relative container of the grid works if we manage it well.
                    // But to fix the click issue, moving it to a fixed/portal-like position is safer.
                  }}
                >
                  <button 
                    onClick={() => { setSelectedAccount(account); setActiveMenuId(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-4 h-4 text-blue-600" />
                    Ver Transacciones
                  </button>
                  <button 
                    onClick={() => handleEdit(account)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                    Editar Cuenta
                  </button>
                  <button 
                    onClick={() => { setAccountToDelete(account); setActiveMenuId(null); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                    Eliminar Cuenta
                  </button>
                </motion.div>
              </>
            );
          })()
        )}
      </AnimatePresence>

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
